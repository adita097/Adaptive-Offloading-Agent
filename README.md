# Adaptive Offloading Agent: Real-Time Edge/Fog/Cloud Routing with LangGraph

---

Modern IoT and mobile applications continuously generate computationally intensive workloads (such as image analysis, sensor processing, and real-time analytics) that can exceed the processing and battery capabilities of end devices. While executing tasks locally can deplete battery rapidly, offloading everything to a distant cloud introduces substantial network latency and bandwidth costs.

This project develops an **Adaptive Offloading Agent** that decides whether computational tasks should run **locally (on-device)** or be offloaded to the **edge**, **fog**, or **cloud** based on:
- Task requirements (computational load, data payload size, deadline)
- Dynamic network conditions (bandwidth, latency, packet loss)
- Tier resource states (compute capacity, queue depths, energy consumption)

A key architectural strength of this system is the **separation of concerns**:
- **LangGraph** orchestrates the stateful workflow and decision loop.
- **Deterministic Mathematical Models** evaluate latency ($T$) and energy ($E$) across all tiers, and an algorithmic mechanism selects the optimal execution tier.
- The **LLM** is used strictly for **Task Classification** (Step 3) and **Decision Explanation** (Step 6), ensuring transparent, hallucination-free, and interpretable offloading decisions.

---

## 🏗️ 6-Stage Methodology

1. **Step 1: Data Ingestion & Normalisation**: Adapts and cleans heterogeneous edge, fog, and cloud datasets into a unified schema.
2. **Step 2: Scenario Construction Layer**: Synthesizes real-world dynamic network conditions, server queue lengths, and battery status.
3. **Step 3: Task Classification**: LLM analyzes task attributes (compute intensity, data intensity, latency sensitivity).
4. **Step 4: Cost Calculation**: Mathematical cost modeling for communication delay, computation delay, and power/energy usage across Local, Edge, Fog, and Cloud tiers.
5. **Step 5: Offloading Decision**: Algorithmic cost minimization ($\min \alpha \cdot \text{Latency} + \beta \cdot \text{Energy}$) subject to deadline QoS constraints.
6. **Step 6: Explanation**: LLM translates the metrics, bottlenecks, and trade-offs into human-interpretable justifications.

---

## 🛠️ Tools & Technologies

| Component | Technology |
| :--- | :--- |
| **Language** | Python 3.10+ |
| **Workflow Orchestration** | LangGraph / LangChain |
| **Data Processing** | Pandas / NumPy / Pydantic |
| **Backend & APIs** | FastAPI, WebSockets |
| **Frontend UI** | React + Vite, Tailwind CSS |
| **Visualization** | Recharts / Plotly |
| **Cache & State** | Redis / In-Memory State Store |

---

## 📂 Project Structure

```
├── backend/
│   ├── app/
│   │   ├── ingestion/       # Stage 1: Dataset Adapters & Unit Normalizer
│   │   ├── scenario/        # Stage 2: Dynamic Scenario Construction
│   │   ├── agent/           # Stages 3 & 6: LangGraph & LLM Classification/Explanation
│   │   ├── cost_model/      # Stage 4: Mathematical Cost Modeling Engine
│   │   ├── decision/        # Stage 5: Algorithmic Tier Selection
│   │   └── api/             # FastAPI REST & WebSocket Endpoints
│   └── data/
│       ├── raw/             # Benchmark dataset slices
│       └── processed/       # Clean, normalized task traces
└── frontend/                # Interactive React + Vite Dashboard
```

---

## 🚀 Getting Started

### 1. Prerequisites
- Python 3.10+
- Node.js v18+ & npm

### 2. Backend Setup & Execution
```bash
# Navigate to backend directory
cd backend

# Install dependencies
pip install -r requirements.txt

# Run unit tests across all 6 stages
pytest

# Launch FastAPI server (REST & WebSockets)
python -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```
API Docs available at: `http://127.0.0.1:8000/docs`

### 3. Frontend UI Setup & Execution
```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Start Vite development dashboard
npm run dev
```
Open your browser at: `http://localhost:5173/`

