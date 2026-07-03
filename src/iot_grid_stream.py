import json
import time
import random
import urllib.request
import os
from kafka import KafkaProducer
from datetime import datetime

REDPANDA_BROKERS = ['localhost:9092']
TOPIC_NAME = 'social_media_posts'

try:
    producer = KafkaProducer(
        bootstrap_servers=REDPANDA_BROKERS,
        value_serializer=lambda v: json.dumps(v).encode('utf-8')
    )
    print(f"Connected to Kafka! Publishing to: {TOPIC_NAME}")
except Exception as e:
    print(f"Kafka connection error: {e}")
    producer = None

# Cache variables
last_update_time = 0
weather_cache = {}
uk_grid_cache = {"intensity": 150, "index": "moderate", "renewables": 35.0}

def get_live_temperature(city):
    coords = {
        "Westminster": (51.4975, -0.1357),
        "Chelsea": (51.4875, -0.1687),
        "Camden": (51.5390, -0.1426),
        "Greenwich": (51.4826, -0.0077),
        "Brixton": (51.4627, -0.1149),
        "Hackney": (51.5450, -0.0553),
        "Wembley": (51.5560, -0.2796),
        "Wimbledon": (51.4214, -0.2064),
        "Stratford": (51.5417, -0.0039)
    }
    if city not in coords:
        return 20.0
    
    lat, lon = coords[city]
    url = f"https://api.open-meteo.com/v1/forecast?latitude={lat}&longitude={lon}&current=temperature_2m"
    try:
        req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
        with urllib.request.urlopen(req, timeout=5) as response:
            data = json.loads(response.read().decode())
            temp = data.get("current", {}).get("temperature_2m", 20.0)
            return temp
    except Exception as e:
        print(f"Error fetching weather for {city}: {e}")
        return 20.0

def get_uk_grid_status():
    """
    Fetches real-time carbon intensity and generation mix from the UK National Grid API.
    Does not require any API keys or whitelisting.
    """
    status = {"intensity": 150, "index": "moderate", "renewables": 35.0}
    try:
        # 1. Fetch Carbon Intensity
        url_intensity = "https://api.carbonintensity.org.uk/intensity"
        req1 = urllib.request.Request(url_intensity, headers={'User-Agent': 'Mozilla/5.0'})
        with urllib.request.urlopen(req1, timeout=5) as response:
            data = json.loads(response.read().decode())
            latest = data.get("data", [{}])[0]
            status["intensity"] = latest.get("intensity", {}).get("actual", 150)
            status["index"] = latest.get("intensity", {}).get("index", "moderate")
            
        # 2. Fetch Generation Mix
        url_mix = "https://api.carbonintensity.org.uk/generation"
        req2 = urllib.request.Request(url_mix, headers={'User-Agent': 'Mozilla/5.0'})
        with urllib.request.urlopen(req2, timeout=5) as response:
            data_mix = json.loads(response.read().decode())
            mix = data_mix.get("data", {}).get("generationmix", [])
            renewables = sum(item.get("perc", 0.0) for item in mix if item.get("fuel") in ["wind", "solar", "hydro"])
            if renewables > 0:
                status["renewables"] = round(renewables, 1)
        
        print(f"Live UK Grid Data -> Intensity: {status['intensity']} gCO2/kWh ({status['index']}) | Renewables Share: {status['renewables']}%")
        return status
    except Exception as e:
        print(f"Error fetching UK National Grid data: {e}")
        return status

def start_stream():
    global last_update_time, weather_cache, uk_grid_cache
    devices = [
        {"id": "METER_101", "type": "SmartMeter", "city": "Westminster"},
        {"id": "METER_102", "type": "SmartMeter", "city": "Chelsea"},
        {"id": "METER_103", "type": "SmartMeter", "city": "Camden"},
        {"id": "CHARGER_201", "type": "EVCharger", "city": "Greenwich"},
        {"id": "CHARGER_202", "type": "EVCharger", "city": "Brixton"},
        {"id": "CHARGER_203", "type": "EVCharger", "city": "Hackney"},
        {"id": "TRAFO_301", "type": "Transformer", "city": "Wembley"},
        {"id": "TRAFO_302", "type": "Transformer", "city": "Wimbledon"},
        {"id": "TRAFO_303", "type": "Transformer", "city": "Stratford"}
    ]

    streets = {
        "Westminster": "Victoria Street",
        "Chelsea": "King's Road",
        "Camden": "Camden High Street",
        "Greenwich": "Romney Road",
        "Brixton": "Brixton Road",
        "Hackney": "Mare Street",
        "Wembley": "Harrow Road",
        "Wimbledon": "Merton Road",
        "Stratford": "Great Eastern Road"
    }

    print("Generating real-time smart grid sensor telemetry data...")
    while True:
        # Fetch weather and UK grid updates every 5 minutes (300 seconds)
        current_time = time.time()
        if current_time - last_update_time > 300 or not weather_cache:
            print("\n--- FETCHING LIVE EXTERNAL API DATA ---")
            for city in ["Westminster", "Chelsea", "Camden", "Greenwich", "Brixton", "Hackney", "Wembley", "Wimbledon", "Stratford"]:
                weather_cache[city] = get_live_temperature(city)
            uk_grid_cache = get_uk_grid_status()
            last_update_time = current_time
            print(f"Live Weather Temperatures: {weather_cache}\n")
        
        dev = random.choice(devices)
        
        # Get baseline parameters from live cached sources
        base_temp = weather_cache.get(dev["city"], 20.0)
        
        # Calculate weather-driven load factor (AC in summer, heaters in winter)
        weather_load_factor = 1.0
        if base_temp > 22.0:
            # AC Load: increase consumption by 3.5% per degree above 22C
            weather_load_factor += (base_temp - 22.0) * 0.035
        elif base_temp < 12.0:
            # Heating Load: increase consumption by 2.5% per degree below 12C
            weather_load_factor += (12.0 - base_temp) * 0.025
            
        # All UK devices are driven by the live UK National Grid carbon index
        index_scale = {
            "very low": 0.80,
            "low": 0.90,
            "moderate": 1.00,
            "high": 1.20,
            "very high": 1.35
        }
        grid_load_factor = index_scale.get(uk_grid_cache["index"], 1.0)
            
        # Total combined scale factor
        total_scale = round(weather_load_factor * grid_load_factor, 2)
        
        # Simulate load (kW), voltage (V), temp (C) based on live API parameters
        if dev["type"] == "SmartMeter":
            consumption = round(random.uniform(0.5, 8.0) * total_scale, 2)
            voltage = round(random.uniform(215.0, 225.0), 1)
            temp = round(base_temp + random.uniform(0.0, 5.0), 1)
        elif dev["type"] == "EVCharger":
            consumption = round(random.uniform(11.0, 50.0) * total_scale, 2)
            voltage = round(random.uniform(210.0, 220.0), 1)
            temp = round(base_temp + random.uniform(5.0, 15.0), 1)
        else:
            consumption = round(random.uniform(100.0, 500.0) * total_scale, 2)
            voltage = round(random.uniform(218.0, 222.0), 1)
            temp = round(base_temp + random.uniform(20.0, 35.0), 1)
        
        # Inject anomalies
        is_anomaly = False
        anomaly_reason = "NORMAL"
        if random.random() < 0.12:
            is_anomaly = True
            anomaly_type = random.choice(["OVERLOAD", "VOLTAGE_DROP", "OVERHEATING"])
            if anomaly_type == "OVERLOAD":
                consumption = round(consumption * random.uniform(2.0, 3.0), 2)
                voltage = round(voltage - random.uniform(10.0, 20.0), 1)
                anomaly_reason = "CRITICAL_OVERLOAD"
            elif anomaly_type == "VOLTAGE_DROP":
                voltage = round(voltage - random.uniform(25.0, 35.0), 1)
                anomaly_reason = "VOLTAGE_DROP"
            else:
                temp = round(temp + random.uniform(25.0, 40.0), 1)
                anomaly_reason = "OVERHEATING"

        street = streets.get(dev["city"], "High Street")
        post = {
            "account_id": dev["id"],
            "hashtag": dev["type"],
            "post_text": f"Telemetry update: Load={consumption}kW, Voltage={voltage}V, Temp={temp}C. Location={street}, {dev['city']}. UK Grid Renewables={uk_grid_cache['renewables']}%",
            "post_velocity": int(consumption * 10),
            "city": dev["city"],
            "device": dev["type"],
            "timestamp": datetime.utcnow().isoformat(),
            "consumption": consumption,
            "voltage": voltage,
            "temp": temp,
            "is_anomaly": is_anomaly,
            "anomaly_reason": anomaly_reason
        }

        if producer:
            try:
                producer.send(TOPIC_NAME, value=post)
                producer.flush()
            except Exception as e:
                print(f"Error publishing: {e}")
        
        print(f"[{dev['city']} - {street}] {dev['id']} ({dev['type']}) -> Load: {consumption} kW (Scale: {total_scale}x) | V: {voltage} V | Temp: {temp} C (Live Base: {base_temp}°C) | Status: {anomaly_reason} | [UK Grid Renewables: {uk_grid_cache['renewables']}%]")
        
        time.sleep(random.uniform(0.3, 0.8))

if __name__ == '__main__':
    try:
        start_stream()
    except KeyboardInterrupt:
        print("\nIoT stream stopped.")
