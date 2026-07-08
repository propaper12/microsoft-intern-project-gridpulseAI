# ML Anomaly Detection & SHAP Explanations (XAI) 🧠

This document outlines the Machine Learning classifier and the Explainable AI (XAI) engine that diagnoses telemetry anomalies in the GridPulseAI pipeline.

---

## 🤖 1. XGBoost Anomaly Classifier

The stateful data stream processor (`src/grid_anomaly_detector.py`) consumes high-frequency IoT telemetry from Redpanda. For each device type (SmartMeter, EV Charger, Substation Transformer), it executes an **XGBoost Classifier** model to compute the probability of a physical or cyber anomaly:

$$\text{Anomaly Probability} = P(Y = 1 \mid X_1, X_2, \dots, X_n)$$

### Feature Space
The model evaluates three primary features:
1.  **Active Load ($kW$):** Measures current draw. Excess load indicates overload anomalies.
2.  **Phase Voltage ($V$):** Measures phase stability. High or low values indicate voltage drops or surges.
3.  **Substation Temp ($^\circ C$):** Measures thermal stress. Excess temperature indicates equipment overheating.

---

## 🔍 2. Explainable AI (XAI) with SHAP

In high-stakes industrial SCADA environments, operators cannot trust "black-box" machine learning predictions. They need to know *why* the AI flagged a device. 

GridPulseAI calculates **SHAP (Shapley Additive exPlanations)** values in real-time. SHAP values calculate the marginal contribution of each feature to the final prediction score relative to the baseline average prediction:

$$\phi_i(f, x) = \sum_{S \subseteq N \setminus \{i\}} \frac{|S|! (|N| - |S| - 1)!}{|N|!} \left[ f(S \cup \{i\}) - f(S) \right]$$

Where:
*   $N$ is the set of all input features.
*   $S$ is a subset of features excluding feature $i$.
*   $f(S)$ is the model prediction using only features in $S$.
*   $\phi_i$ represents the directional weight (positive or negative) that feature $i$ contributed to pushing the anomaly prediction away from the grid baseline.

---

## ⚛️ 3. SCADA Visualization

The calculated SHAP contribution weights are published to ClickHouse and fetched by the React UI. The UI represents these values as interactive horizontal bars under the **Threats (Alarmlar)** and **Rules (Filtre Kuralları)** panels:

*   **Red Bars (+ SHAP):** Indicators that increased the likelihood of an anomaly (e.g. Temperature rising to 98°C adds positive SHAP pressure).
*   **Green Bars (- SHAP):** Indicators that kept the device stable (e.g. Voltage sitting at 230V pulls the prediction back towards nominal safety).
*   **Operator Override:** Armed with this breakdown, operators can make informed override decisions (e.g., if Temperature has the highest SHAP contribution, they trigger the *Activate Grid Cooling* remote SCADA override).
