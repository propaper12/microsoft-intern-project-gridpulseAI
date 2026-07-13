# GridPulse AI ⚡

> **Microsoft Internship Project** – Real-Time AI-SCADA IoT Smart Cable Grid Monitor.

[![Vite Build](https://img.shields.io/badge/Vite-Build%20Success-success?style=flat-square&logo=vite)](https://vite.dev)
[![FastAPI](https://img.shields.io/badge/FastAPI-v0.110.0-blue?style=flat-square&logo=fastapi)](https://fastapi.tiangolo.com)
[![Ollama](https://img.shields.io/badge/Ollama-Llama%203.2-orange?style=flat-square)](https://ollama.com)
[![ClickHouse](https://img.shields.io/badge/ClickHouse-OLAP-brightgreen?style=flat-square&logo=clickhouse)](https://clickhouse.com)

**GridPulse AI**, yeraltı yüksek voltaj güç kabloları ve trafoların telemetri verilerini izleyen, açıklanabilir yapay zeka (XAI SHAP) ile siber güvenlik tehditlerini süzgençten geçiren ve SQLite ile yerel (offline) RAG mimarisini birleştiren kurumsal düzeyde bir **AI-SCADA (Co-SCADA) kontrol odası platformudur**.

---

## 🏛️ Mimari Katmanlar & Teknoloji Yığını

| Katman | İşlev | Teknolojiler |
| :--- | :--- | :--- |
| **Arayüz (Frontend)** | Modern 3 Sütunlu Kontrol Paneli, Akış Şemaları, Monaco Simülatörü | React 18, Vite, React Flow, Recharts |
| **Sunucu (Backend)** | REST API'ler, SSE (Server-Sent Events) Akışları, Vektör Arama | FastAPI, Python, Uvicorn |
| **Veri Hattı (Stream Pipeline)** | Yüksek Hızlı Telemetri Toplama, Stateful Filtreleme | Redpanda (Kafka), Bytewax (Rust Engine) |
| **Veritabanları (Storage)** | Analitik Günlükler, Yerel Vektör Bilgi Bankası, Önbellek | ClickHouse (OLAP), SQLite (Vector), Dragonfly |
| **Bilişsel Zeka (Local AI)** | Anlamsal RAG Arama, GraphRAG Bağlantıları, Yerel Çıkarım | Ollama (Llama 3.2 1B), scikit-learn, SHAP |

---

## 🚀 Öne Çıkan Yetenekler

### 🧠 Canlı Düşünce İzleme (Cognitive Thought Daemon)
Sağ panelde yer alan turuncu neon pulsing halkalı takip modülü, ajanın arka planda çalışırken gerçekleştirdiği akıl yürütme adımlarını (Reasoning) anlık olarak ekrana basar. Telemetri günlükleri terminalde 2.5 saniyede bir otomatik akar.

### 🔍 Phoenix RAG Trace & Vektör Analizörü
Yapay Zeka Beyni (`ai_brain`) sekmesinde asistan yanıtlarının altında yer alan trace modülü, RAG çalışma adımlarını görselleştirir:
- **32-D Vektör Izgarası:** Sorgunun 32 boyutlu vektörünü ısıl matris hücreleri olarak çizer.
- **Kosinüs Benzerliği:** SQLite eşleşmelerini neon ilerleme barları ile gösterir.
- **GraphRAG:** Entity-Relation ilişkilerini mini SVG şemasıyla modeller.
- **Groundedness:** Yanıtın kaynak doğruluğunu ölçer.

### ⚡ İnteraktif RAG Sorgu Konsolu
Bilgi Bankası sekmesinde bulunan arama çubuğu sayesinde operatör şebeke terimleriyle semantik arama yapabilir, vektör hücrelerinin anlık parlamasını canlı izleyebilir.

---

## ⚙️ Hızlı Çalıştırma Kılavuzu

```bash
# 1. Konteyner Altyapısını Başlatın (Redpanda, ClickHouse)
docker compose up -d

# 2. Python Ortamını Hazırlayın ve Bağımlılıkları Yükleyin
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt

# 3. SQLite Bilgi Bankasını İlklendirin
python backend/initialize_kb.py

# 4. Servisleri Ayrı Terminallerde Çalıştırın
uvicorn backend.api:app --reload --port 8000
python backend/iot_grid_stream.py
python backend/grid_anomaly_detector.py

# 5. Arayüzü Başlatın
cd frontend
npm install
npm run dev
```

---

## 🛡️ Microsoft Jüri Sunum Senaryoları

1. **AI Control Room:** Sol menüden Yapay Zeka Beyni sekmesine geçin. Sağ paneldeki sinaps frekansını ve Autopilot durumunu jüriye gösterin.
2. **Canlı Sorgu & Düşünce Akışı:** Sohbet kutusuna *"Trafo 301 durum analizi yap"* yazın. Sağdaki **Cognitive Thought** panelinde ajanın adımlarını ve alttaki terminal akışını canlı izletin.
3. **Phoenix RAG Trace:** Cevapların altındaki *"RAG Analiz Raporu"* butonuna tıklayarak 32 boyutlu vektör hücre matrisini ve **GraphRAG bilgi grafiğini** jüriye sunun.
