"""
GridPulse — Otonom Operasyon Raporu & E-posta Servisi
"""
import json
import os
import smtplib
import uuid
from datetime import datetime
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from typing import Optional

_BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DEFAULT_OPS_EMAIL = "omercakan5@gmail.com"
REPORT_HISTORY_FILE = os.path.join(_BASE_DIR, "logs", "report_history.json")
OUTBOX_DIR = os.path.join(_BASE_DIR, "logs", "outbox")

_agent_config = {
    "ops_email": os.environ.get("GRIDPULSE_OPS_EMAIL", DEFAULT_OPS_EMAIL),
    "auto_report_enabled": True,
    "report_interval_minutes": 5,
}


def get_agent_config() -> dict:
    return dict(_agent_config)


def update_agent_config(payload: dict) -> dict:
    if "ops_email" in payload and payload["ops_email"]:
        _agent_config["ops_email"] = payload["ops_email"].strip()
    if "auto_report_enabled" in payload:
        _agent_config["auto_report_enabled"] = bool(payload["auto_report_enabled"])
    if "report_interval_minutes" in payload:
        _agent_config["report_interval_minutes"] = max(1, int(payload["report_interval_minutes"]))
    return get_agent_config()


def _ensure_dirs():
    os.makedirs("logs", exist_ok=True)
    os.makedirs(OUTBOX_DIR, exist_ok=True)


def _load_history() -> list:
    _ensure_dirs()
    if not os.path.exists(REPORT_HISTORY_FILE):
        return []
    try:
        with open(REPORT_HISTORY_FILE, "r", encoding="utf-8") as f:
            return json.load(f)
    except Exception:
        return []


def _save_history(entries: list):
    _ensure_dirs()
    with open(REPORT_HISTORY_FILE, "w", encoding="utf-8") as f:
        json.dump(entries[-50:], f, indent=2, ensure_ascii=False)


def compose_ops_report(
    report_type: str,
    agent_status: str,
    agent_actions: list,
    agent_logs: list,
    alerts: Optional[list] = None,
    trigger: Optional[dict] = None,
    lang: str = "TR",
) -> dict:
    """Operatör odaklı HTML + text rapor üret"""
    is_tr = lang.upper() == "TR"
    now = datetime.utcnow().strftime("%Y-%m-%d %H:%M:%S UTC")
    alerts = alerts or []

    critical_actions = [a for a in agent_actions if a.get("severity") in ("CRITICAL", "HIGH")]
    chart_count = len([a for a in agent_actions if a.get("action") == "SPAWN_CHART"])
    critical_alerts = [a for a in alerts if (a.get("truth_score") or 100) < 50]

    if critical_actions or critical_alerts or (trigger and trigger.get("reason") == "DATA_OUTAGE"):
        verdict = "KRİTİK — Müdahale Gerekli" if is_tr else "CRITICAL — Intervention Required"
        if trigger and trigger.get("reason") == "DATA_OUTAGE":
            verdict = "VERİ KESİNTİSİ — Acil Kontrol" if is_tr else "DATA OUTAGE — Urgent Check"
        verdict_class = "critical"
    elif agent_status == "DIAGNOSING":
        verdict = "TEŞHİS — İzleme Devam" if is_tr else "DIAGNOSING — Monitoring Active"
        verdict_class = "warning"
    else:
        verdict = "STABİL — Rutin İzleme" if is_tr else "STABLE — Routine Monitoring"
        verdict_class = "stable"

    bullets = []
    if trigger:
        if trigger.get("offline_services"):
            bullets.append(
                f"Offline servisler: {', '.join(trigger['offline_services'])}"
                if is_tr
                else f"Offline services: {', '.join(trigger['offline_services'])}"
            )
        else:
            bullets.append(
                f"Tetikleyici: {trigger.get('device_id', '—')} — {trigger.get('rule', trigger.get('reason', '—'))}"
                if is_tr
                else f"Trigger: {trigger.get('device_id', '—')} — {trigger.get('rule', trigger.get('reason', '—'))}"
            )
    bullets.append(f"{chart_count} aktif SCADA grafiği" if is_tr else f"{chart_count} active SCADA charts")
    bullets.append(f"Agent durumu: {agent_status}")
    if critical_actions:
        bullets.append(f"{len(critical_actions)} yüksek öncelikli agent kararı" if is_tr else f"{len(critical_actions)} high-priority agent decisions")
    if critical_alerts:
        bullets.append(f"{len(critical_alerts)} kritik telemetri alarmı" if is_tr else f"{len(critical_alerts)} critical telemetry alerts")

    recent_logs = agent_logs[-8:]
    log_lines = "\n".join(f"  • {lg}" for lg in recent_logs) if recent_logs else ("  • (log yok)" if is_tr else "  • (no logs)")

    action_rows = ""
    for a in critical_actions[-5:] or agent_actions[-3:]:
        action_rows += f"""
        <tr>
          <td>{a.get('device_id', '—')}</td>
          <td>{a.get('rule', '—')}</td>
          <td style="color:{'#ef4444' if a.get('severity') in ('CRITICAL','HIGH') else '#f59e0b'}">{a.get('severity','LOW')}</td>
          <td>{a.get('message','')[:80]}</td>
        </tr>"""

    subject_map = {
        "autopilot_start": "GridPulse — Autopilot Başlatıldı" if is_tr else "GridPulse — Autopilot Activated",
        "critical_alert": "GridPulse — KRİTİK Alarm Raporu" if is_tr else "GridPulse — CRITICAL Alert Report",
        "periodic_digest": "GridPulse — Periyodik Operasyon Özeti" if is_tr else "GridPulse — Periodic Operations Digest",
        "data_outage": "GridPulse — VERİ KESİNTİSİ Raporu" if is_tr else "GridPulse — DATA OUTAGE Report",
        "manual": "GridPulse — Manuel Operasyon Raporu" if is_tr else "GridPulse — Manual Operations Report",
    }
    subject = subject_map.get(report_type, "GridPulse — Operasyon Raporu" if is_tr else "GridPulse — Operations Report")

    html = f"""<!DOCTYPE html>
<html><head><meta charset="utf-8">
<style>
  body {{ font-family: 'Segoe UI', Arial, sans-serif; background: #0f172a; color: #e2e8f0; margin: 0; padding: 24px; }}
  .card {{ background: #1e293b; border: 1px solid #334155; border-radius: 12px; padding: 24px; max-width: 640px; margin: 0 auto; }}
  .header {{ border-bottom: 1px solid #334155; padding-bottom: 16px; margin-bottom: 20px; }}
  .logo {{ color: #3b9eff; font-size: 20px; font-weight: 700; }}
  .verdict {{ display: inline-block; padding: 6px 14px; border-radius: 20px; font-weight: 700; font-size: 13px;
    background: {'#ef444422' if verdict_class=='critical' else '#f59e0b22' if verdict_class=='warning' else '#22c55e22'};
    color: {'#ef4444' if verdict_class=='critical' else '#f59e0b' if verdict_class=='warning' else '#22c55e'}; }}
  ul {{ padding-left: 20px; line-height: 1.8; }}
  table {{ width: 100%; border-collapse: collapse; font-size: 12px; margin-top: 12px; }}
  th, td {{ border: 1px solid #334155; padding: 8px; text-align: left; }}
  th {{ background: #0f172a; color: #94a3b8; }}
  .footer {{ margin-top: 24px; font-size: 11px; color: #64748b; border-top: 1px solid #334155; padding-top: 12px; }}
  .pill {{ display: inline-block; background: #3b9eff22; color: #3b9eff; padding: 3px 10px; border-radius: 12px; font-size: 11px; margin: 2px; }}
</style></head><body>
<div class="card">
  <div class="header">
    <div class="logo">⚡ GridPulse.AI</div>
    <p style="color:#94a3b8;margin:8px 0 0">{now}</p>
  </div>
  <p><span class="verdict">{verdict}</span></p>
  <p style="font-size:14px;line-height:1.6">
    {'Otonom agent şebeke telemetrisini analiz etti ve aşağıdaki operasyon özetini üretti.' if is_tr else 'Autonomous agent analyzed grid telemetry and generated the following operations summary.'}
  </p>
  <h3 style="color:#3b9eff;font-size:14px">{'Ne Yapılmalı' if is_tr else 'Recommended Actions'}</h3>
  <ul>{''.join(f'<li>{b}</li>' for b in bullets)}</ul>
  <div>
    <span class="pill">Live Telemetry</span>
    <span class="pill">Autonomous Agent</span>
    <span class="pill">GraphRAG</span>
    <span class="pill">llama3.2:1b</span>
  </div>
  <h3 style="color:#3b9eff;font-size:14px;margin-top:20px">{'Agent Kararları' if is_tr else 'Agent Decisions'}</h3>
  <table>
    <tr><th>{'Cihaz' if is_tr else 'Device'}</th><th>{'Kural' if is_tr else 'Rule'}</th><th>{'Seviye' if is_tr else 'Severity'}</th><th>{'Mesaj' if is_tr else 'Message'}</th></tr>
    {action_rows or f'<tr><td colspan="4">{"Kayıt yok" if is_tr else "No records"}</td></tr>'}
  </table>
  <h3 style="color:#3b9eff;font-size:14px;margin-top:20px">{'Son Loglar' if is_tr else 'Recent Logs'}</h3>
  <pre style="background:#0f172a;padding:12px;border-radius:8px;font-size:11px;overflow-x:auto">{log_lines}</pre>
  <div class="footer">
    GridPulse AI — {'Otonom SCADA Operasyon Platformu' if is_tr else 'Autonomous SCADA Operations Platform'}<br>
    {'Bu rapor otonom agent tarafından üretildi. Manuel doğrulama önerilir.' if is_tr else 'This report was generated by the autonomous agent. Manual verification recommended.'}
  </div>
</div></body></html>"""

    text = f"""GridPulse.AI — {subject}
{now}
Durum: {verdict}

Özet:
{chr(10).join('- ' + b for b in bullets)}

Son Loglar:
{log_lines}

---
Otonom agent raporu — GridPulse AI
"""

    return {
        "id": str(uuid.uuid4())[:8],
        "subject": subject,
        "html": html,
        "text": text,
        "verdict": verdict,
        "verdict_class": verdict_class,
        "bullets": bullets,
        "report_type": report_type,
        "timestamp": now,
    }


def send_report_email(to_email: str, subject: str, html: str, text: str) -> dict:
    """SMTP ile gönder; yapılandırma yoksa outbox'a kaydet (demo modu)"""
    _ensure_dirs()
    smtp_host = os.environ.get("SMTP_HOST", "smtp.gmail.com")
    smtp_port = int(os.environ.get("SMTP_PORT", "587"))
    smtp_user = os.environ.get("SMTP_USER", "")
    smtp_pass = os.environ.get("SMTP_PASS", "")
    from_email = os.environ.get("SMTP_FROM", smtp_user or "gridpulse@localhost")

    report_id = str(uuid.uuid4())[:8]
    entry = {
        "id": report_id,
        "to": to_email,
        "subject": subject,
        "timestamp": datetime.utcnow().isoformat() + "Z",
        "status": "pending",
        "delivery": "outbox",
    }

    if smtp_user and smtp_pass:
        try:
            msg = MIMEMultipart("alternative")
            msg["Subject"] = subject
            msg["From"] = from_email
            msg["To"] = to_email
            msg.attach(MIMEText(text, "plain", "utf-8"))
            msg.attach(MIMEText(html, "html", "utf-8"))

            with smtplib.SMTP(smtp_host, smtp_port, timeout=15) as server:
                server.starttls()
                server.login(smtp_user, smtp_pass)
                server.sendmail(from_email, [to_email], msg.as_string())

            entry["status"] = "sent"
            entry["delivery"] = "smtp"
        except Exception as e:
            entry["status"] = "failed"
            entry["error"] = str(e)
            outbox_path = os.path.join(OUTBOX_DIR, f"{report_id}.html")
            with open(outbox_path, "w", encoding="utf-8") as f:
                f.write(html)
            entry["outbox_file"] = outbox_path
    else:
        outbox_path = os.path.join(OUTBOX_DIR, f"{report_id}.html")
        with open(outbox_path, "w", encoding="utf-8") as f:
            f.write(html)
        entry["status"] = "queued"
        entry["delivery"] = "outbox"
        entry["outbox_file"] = outbox_path
        entry["note"] = "SMTP yapılandırılmadı — rapor outbox'a kaydedildi. SMTP_USER/SMTP_PASS ayarlayın."

    history = _load_history()
    history.append(entry)
    _save_history(history)
    return entry


def get_report_history() -> list:
    return list(reversed(_load_history()))


def is_agent_report_request(query: str) -> bool:
    """Chat'te agent karar özeti / rapor talebi mi?"""
    l = (query or "").lower()
    report_words = ("rapor", "report", "özetle", "özet", "summarize", "summary", "e-posta", "email")
    agent_words = ("agent", "otonom", "autonomous", "karar", "decision", "operasyon", "operations")
    has_report = any(w in l for w in report_words)
    has_agent = any(w in l for w in agent_words)
    return has_report and (has_agent or "raporla" in l or "gönder" in l)


def build_agent_report_chat_reply(
    agent_actions: list,
    agent_logs: list,
    agent_status: str,
    report_delivery: Optional[dict],
    lang: str = "TR",
) -> str:
    """Copilot chat için yapılandırılmış agent karar özeti (LLM echo bypass)"""
    is_tr = lang.upper() == "TR"
    config = get_agent_config()
    ops_email = config.get("ops_email", DEFAULT_OPS_EMAIL)

    charts = [a for a in agent_actions if a.get("action") == "SPAWN_CHART"]
    critical = [a for a in agent_actions if a.get("severity") in ("CRITICAL", "HIGH")]
    medium = [a for a in agent_actions if a.get("severity") == "MEDIUM"]

    decision_lines = []
    for a in (critical + medium + charts)[-8:]:
        device = a.get("device_id", "—")
        rule = a.get("rule", "—")
        sev = a.get("severity", "LOW")
        title = a.get("widget_title") or a.get("chart_type", "chart")
        msg = (a.get("message") or "")[:120]
        if is_tr:
            decision_lines.append(f"• {device} / {title} [{sev}] — {rule}: {msg}")
        else:
            decision_lines.append(f"• {device} / {title} [{sev}] — {rule}: {msg}")

    activity_logs = [
        lg for lg in agent_logs
        if any(tag in lg for tag in ("KARAR", "🤖", "[AGENT]", "[VISION]", "[REPORT]", "yenilendi", "Anomali"))
    ][-5:]

    delivery = report_delivery or {}
    status = delivery.get("status", "unknown")
    subject = delivery.get("subject", "")
    if status == "sent":
        delivery_txt = (
            f"Operasyon raporu **{ops_email}** adresine e-posta ile gönderildi."
            if is_tr else
            f"Operations report emailed to **{ops_email}**."
        )
    elif status == "queued":
        delivery_txt = (
            f"SMTP yapılandırılmadığı için rapor **outbox**'a kaydedildi (hedef: {ops_email}). "
            f"SCADA Merkezi → Raporlama sekmesinden geçmişi görebilirsiniz."
            if is_tr else
            f"Report saved to **outbox** (target: {ops_email}) — SMTP not configured. "
            f"See Reporting tab in SCADA Center."
        )
    else:
        delivery_txt = (
            "Rapor oluşturuldu; teslimat durumu doğrulanıyor."
            if is_tr else
            "Report composed; verifying delivery status."
        )

    if not decision_lines:
        decision_lines = [
            "• Henüz kayıtlı agent kararı yok — AUTOPILOT başlatın." if is_tr
            else "• No agent decisions yet — start AUTOPILOT."
        ]

    decisions_block = "\n".join(decision_lines)
    logs_block = "\n".join(f"• {lg}" for lg in activity_logs) if activity_logs else (
        "• (Henüz operasyon logu yok)" if is_tr else "• (No operation logs yet)"
    )

    if is_tr:
        crit_txt = (
            f"**{len(critical)}** kritik/yüksek öncelikli karar mevcut."
            if critical else "Kritik seviye karar şu an yok."
        )
        subj_txt = f"\nKonu: _{subject}_" if subject else ""
        return (
            f"**Otonom Agent Operasyon Özeti**\n\n"
            f"**1. Genel Durum**\n"
            f"Agent durumu: **{agent_status}**. Tuvalde **{len(charts)}** aktif SCADA paneli izleniyor. {crit_txt}\n\n"
            f"**2. Son Agent Kararları**\n{decisions_block}\n\n"
            f"**Son işlem logları:**\n{logs_block}\n\n"
            f"**3. Raporlama**\n{delivery_txt}{subj_txt}\n\n"
            f"**Operatör önerisi:** Kritik kararlar varsa ilgili cihazı izole edin; Raporlama sekmesinden gönderim geçmişini doğrulayın. "
            f"Grafik Zekası sekmesinde panel yorumlarını inceleyin."
        )
    crit_txt = (
        f"**{len(critical)}** critical/high-priority decisions recorded."
        if critical else "No critical-level decisions at this time."
    )
    subj_txt = f"\nSubject: _{subject}_" if subject else ""
    return (
        f"**Autonomous Agent Operations Summary**\n\n"
        f"**1. Overall Status**\n"
        f"Agent status: **{agent_status}**. **{len(charts)}** active SCADA panels on canvas. {crit_txt}\n\n"
        f"**2. Recent Agent Decisions**\n{decisions_block}\n\n"
        f"**Recent activity logs:**\n{logs_block}\n\n"
        f"**3. Reporting**\n{delivery_txt}{subj_txt}\n\n"
        f"**Operator recommendation:** Isolate affected devices if critical; verify delivery in the Reporting tab; "
        f"review Chart Vision interpretations."
    )

