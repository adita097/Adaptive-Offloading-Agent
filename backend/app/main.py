"""
Adaptive Offloading Agent - Master FastAPI Application Entrypoint.
Exposes RESTful endpoints and real-time WebSockets for edge/fog/cloud routing.
"""
from pathlib import Path
from dotenv import load_dotenv

# Load local environment variables from .env file
load_dotenv()

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from app.api.routes_scenarios import router as scenarios_router
from app.api.routes_benchmarks import router as benchmarks_router
from app.api.routes_offload import router as offload_router
from app.api.websocket import router as websocket_router

app = FastAPI(
    title="Adaptive Offloading Agent API",
    description="Real-Time Edge/Fog/Cloud Routing with LangGraph, Cost Modeling, and Dataset Ingestion",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

# Enable CORS for local React + Vite frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register API Routers
app.include_router(scenarios_router)
app.include_router(benchmarks_router)
app.include_router(offload_router)
app.include_router(websocket_router)


@app.get("/", tags=["Root"])
@app.get("/api/health", tags=["Root"])
def root_status():
    """System health and architectural overview."""
    return {
        "project": "Adaptive Offloading Agent: Real-Time Edge/Fog/Cloud Routing with LangGraph",
        "status": "ONLINE",
        "version": "1.0.0",
        "stages": {
            "stage_1_ingestion": "ACTIVE (Kaggle/IEEE Adapters & Normalization)",
            "stage_2_scenario": "ACTIVE (5G Dynamic Channels, M/M/1 Queuing)",
            "stage_3_classification": "ACTIVE (LLM / Domain Heuristic)",
            "stage_4_cost_model": "ACTIVE (Latency & Energy Physics)",
            "stage_5_decision": "ACTIVE (Pareto Optimal Multi-Objective)",
            "stage_6_explanation": "ACTIVE (LangGraph State Machine)",
        },
        "endpoints": {
            "docs": "/docs",
            "dashboard": "/dashboard",
            "scenarios": "/api/scenarios",
            "benchmarks": "/api/benchmarks",
            "offload": "/api/offload",
            "websocket": "/ws/simulation",
        },
    }


# Mount production frontend bundle if built
frontend_dist = Path(__file__).resolve().parent.parent.parent / "frontend" / "dist"
if frontend_dist.exists() and (frontend_dist / "index.html").exists():
    if (frontend_dist / "assets").exists():
        app.mount("/assets", StaticFiles(directory=str(frontend_dist / "assets")), name="assets")
    app.mount("/dashboard", StaticFiles(directory=str(frontend_dist), html=True), name="dashboard")


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
