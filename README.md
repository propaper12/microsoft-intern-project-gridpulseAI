# GridPulseAI ⚡
### Microsoft Staj Projesi - Gerçek Zamanlı Yapay Zeka Destekli SCADA IoT Kablo Şebeke İzleme Platformu

**GridPulseAI**, yeraltı yüksek voltaj güç kablolarını izlemek, toprak termal kapasitesini analiz etmek, güneş kaynaklı yük sınırlarını hesaplamak, gerçek zamanlı açıklanabilir siber güvenlik anomali tespiti (XAI SHAP) yapmak ve SQLite vektör depolaması kullanarak tamamen yerel (offline) çalışan bir RAG AI Copilot barındıran kurumsal düzeyde bir **AI-SCADA (Co-SCADA) Kontrol Odası** uygulamasıdır.

---

## 🚀 Öne Çıkan Özellikler

*   **🧠 Yapay Zeka Beyni & 3 Sütunlu Otonom Kontrol Odası (3-Column Workspace):** 
    *   **Görkemli 3 Sütunlu Grid Layout:** SCADA izleme operasyonlarını kurumsal standartlarda dikey sol navigasyon menüsü, geniş orta analitik çalışma alanı ve sağ taraftaki **GridPulse AI Aktivite HUD** paneli ile yönetir.
    *   **Bilişsel Düşünce İzleme (Cognitive Thought Daemon):** Sağ panelde yer alan turuncu neon pulsing efekti, ajanın o anki akıl yürütme adımlarını (Reasoning Steps) milisaniyelik gecikmelerle canlı olarak yansıtır. (Örn: *Sorgu vektörü hesaplanıyor*, *ClickHouse anomali tablosu taranıyor*, *SQLite RAG kuralları eşleştiriliyor*).
    *   **Bilişsel Sinaps Analiz Paneli:** Ajan aktif olduğunda dalgalanan neon sinaps SVG sinyal dalgalarını, bellek/RAM kullanımını (3.4 GB) ve aktif ClickHouse / SQLite thread durumlarını canlı gösterir.
    *   **2.5 Saniyede Bir Canlı Telemetri Güncellemesi:** Telemetri veri akışı ve terminal günlüğü arka planda sürekli akan canlı SCADA günlükleriyle (`[DAEMON] Ingested telemetry packets...`) beslenir.
*   **🔍 Phoenix RAG İzleyici & Vektör Analizörü (AI Brain Tab):**
    *   Yapay Zeka Beyni sekmesinde, asistan cevaplarının altında beliren **"🔍 RAG Analiz Raporu"** butonu veya doğrudan sağ panel aracılığıyla çalışan görsel teşhis modülüdür.
    *   **32 Boyutlu Vektör Hücre Izgarası (Adım 1):** Sorgunun çözümlenen 32 boyutlu vektörünü 12 hücrelik ısıl renkli kutucuk matrisi olarak çizer.
    *   **Kosinüs Benzerlik İlerleme Barları (Adım 2):** SQLite kural eşleşmesini neon ilerleme barları (progress bars) ve benzerlik skorlarıyla yansıtır.
    *   **GraphRAG Bilgi Grafı (Adım 3):** SQLite anlamsal ilişkilerini gösteren mini bir SVG grafik akış devresi çizer.
    *   **Doğruluk Oranı (Adım 4):** Modelin halüsinasyon durumunu ölçen groundedness yüzdesini yüksek kontrastlı kural paneliyle sunar.
*   **🔍 İnteraktif RAG Sorgu Konsolu (Knowledge Base Tab):**
    *   Bilgi Bankası sekmesinin en tepesine, operatörün RAG sistemini canlı olarak test edebilmesi için **Sorgu Arama Kutusu & VEKTÖR SORGUSU ÇALIŞTIR** butonu entegre edilmiştir. Operatör buraya *"Westminster voltaj"* yazdığında, kuralların kosinüs skorlarına göre progress barlarla süzüldüğünü ve 32-D vektör hücrelerinin anlık parladığını canlı izleyebilir.
*   **🗺️ Coğrafi SCADA Haritası (Google Maps Entegrasyonu):** 
    *   Google Maps Roadmap CDN katmanlarını kullanarak anında yüklenir.
    *   Londra'daki 9 kritik trafo merkezini birbirine bağlayan **SVG Kablo Güzergahları** (Polylines), gerçek zamanlı kablo termal stres seviyelerine göre dinamik olarak renk değiştirir.
*   **📡 Stateful Büyük Veri Akış Hattı (Big Data Stream Pipeline):**
    *   **Redpanda (Kafka):** Yüksek verimli telemetri veri toplama broker'ı.
    *   **Bytewax (Rust Destekli):** Telemetri sensör verilerini filtreleyen ve gruplayan stateful veri akış motoru.
    *   **ClickHouse OLAP Veritabanı:** Milisaniyenin altında telemetri analitiği için sütun bazlı (columnar) veritabanı.
*   **🧠 Açıklanabilir Yapay Zeka (XAI SHAP) & Teşhisler:**
    *   Voltaj dalgalanmaları, fiziksel aşırı yüklenme ve aşırı ısınma alarmlarını tespit eden yapay zeka tehdit sınıflandırıcısı.
    *   Ajanın karar alma kriterlerini (Yük, Sıcaklık, Voltaj Sapması) gösteren gerçek zamanlı **SHAP özellik ağırlığı barları**.
*   **📁 Çevrimdışı Yerel RAG (Ollama Llama 3.2 1B):**
    *   **Strict QA Prompt Format:** Küçük yerel modellerin (Llama 3.2 1B gibi) sistem talimatlarını tekrarlamasını veya sızdırmasını (prompt leakage) önlemek üzere özel olarak tasarlanmış, doğrudan soru-cevap odaklı prompt şablonu.
    *   Yerel işlemci (CPU) üzerinde çalışan yerel dil modeli sayesinde tamamen çevrimdışı, güvenli ve bağımsız Q&A desteği.

---

## 🏗️ Sistem Mimarisi

```mermaid
graph TD
    subgraph Veri Akış Hattı (Stream Pipeline)
        Sensors[📡 IoT Şebeke Sensörleri] -->|JSON Telemetri| Redpanda[✉️ Redpanda Kafka Broker]
        Redpanda -->|Veri Akışı İşleme| Bytewax[🐝 Bytewax Stream Engine]
        Bytewax -->|ML Teşhis| XAI[🧠 SHAP Karar Sınıflandırıcı]
        XAI -->|Aggregated Data| ClickHouse[(🗄️ ClickHouse DB)]
    end

    subgraph Çevrimdışı Yerel RAG
        SQLite[(📁 SQLite Vektör DB)] <-->|Kosinüs Benzerliği| VectorStore[🔍 Vektör Arama Motoru]
    end

    subgraph Servis Katmanı
        ClickHouse -->|SQL Sorguları| FastAPI[⚡ FastAPI Server]
        VectorStore <-->|Yerel Bağlam| FastAPI
        FastAPI -->|SSE / JSON API| React[⚛️ React Vite UI]
        React -->|Operatör Chat Sorguları| FastAPI
        FastAPI -->|Çevrimdışı LLM| LLM[🤖 Local LLM / Ollama Llama 3.2]
    end
```

---

## ⚙️ Teknoloji Yığını

*   **Arayüz:** React 18, Vite, Leaflet, Recharts.
*   **Sunucu:** FastAPI (Python), Uvicorn.
*   **Veri İşleme:** Bytewax (Stateful Python/Rust Veri Akış Motoru).
*   **Mesaj Broker:** Redpanda (Kafka Uyumlu).
*   **Veritabanı:** ClickHouse (OLAP), SQLite (Vektör Bilgi Bankası), Dragonfly (Redis-uyumlu önbellek).
*   **AI/ML:** scikit-learn, SHAP, Ollama (Llama 3.2 1B).

---

## 🛠️ Kurulum ve Çalıştırma Kılavuzu

### Gereksinimler
*   [Python 3.9+](https://www.python.org/downloads/)
*   [Node.js (v16+)](https://nodejs.org/)
*   [Docker Desktop](https://www.docker.com/products/docker-desktop/)
*   [Ollama (Llama 3.2 1B kurulu)](https://ollama.com/)

---

### Adım 1: Docker Altyapısını Başlatın
Redpanda, ClickHouse ve Dragonfly konteynerlerini arka planda çalıştırın:
```bash
docker compose up -d
```
Servis arayüzleri:
*   **Redpanda Console:** [http://localhost:8080](http://localhost:8080)
*   **ClickHouse Play Arayüzü:** [http://localhost:8123/play](http://localhost:8123/play)

---

### Adım 2: Python Sanal Ortamını Kurun
Kök dizinde virtualenv oluşturup bağımlılıkları yükleyin:
```bash
# Sanal ortam oluşturma
python -m venv venv

# Aktifleştirme (Windows)
venv\Scripts\activate

# Bağımlılıkları yükleme
pip install -r requirements.txt
```

---

### Adım 3: Yerel RAG SQLite Bilgi Bankasını Oluşturun
SQLite veritabanını ilklendirin ve vektör kurallarını yerleştirin:
```bash
python backend/initialize_kb.py
```

---

### Adım 4: Arka Plan Servislerini Çalıştırın
Sanal ortamınız aktifken her bir servisi ayrı bir terminalde başlatın:
1.  **FastAPI Sunucusu:**
    ```bash
    uvicorn backend.api:app --reload --port 8000
    ```
2.  **IoT Telemetri Üreticisi:**
    ```bash
    python backend/iot_grid_stream.py
    ```
3.  **Real-Time ML Anomali Dedektörü:**
    ```bash
    python backend/grid_anomaly_detector.py
    ```

---

### Adım 5: Arayüzü (Frontend) Çalıştırın
`frontend/` dizinine gidin, paketleri kurun ve Vite geliştirme sunucusunu başlatın:
```bash
cd frontend
npm install
npm run dev
```
Tarayıcınızdan [http://localhost:5173](http://localhost:5173) adresine girin.

---

## 🛡️ Sunum İçin İpuçları ve Senaryolar

*   **🧠 Yapay Zeka Beyni (AI Control Room):** Sol menüden `🧠 Yapay Zeka Beyni` sekmesine geçin. Sağ paneldeki **Düşünce Daemon** turuncu neon halkasının ve bilişsel sinapsların nasıl çalıştığını gösterin.
*   **💬 Canlı Düşünce Testi:** Sol sohbet paneline *"Trafo 301 durum analizi yap"* yazıp gönderin. Sağ paneldeki düşüncelerin sırasıyla değişmesini ve milisaniyelik işlemlerle log akmasını izletin.
*   **🔍 RAG İzleyici & Vektör Izgarası:** Cevabın altındaki *"🔍 RAG Analiz Raporu"* butonuna basarak 32 boyutlu vektör hücrelerini, progress barları ve bilgi grafiğini jüriye gösterin.
*   **⚡ Şebeke Güvenlik Sınırı Onayları (SCADA Terminal):** Senaryolar tetiklendiğinde ortaya çıkan SCADA override uyarı onay butonlarını bip sesleriyle jüriye sunun.
