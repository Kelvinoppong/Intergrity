"""Orchestrates graph building and inference for live or test predictions."""

from typing import Any, Optional

from torch_geometric.data import Data

from app.config import AppMode, settings
from app.data.graph_builder import build_graph_from_live_data
from app.data.mock_generator import generate_mock_venue
from app.models.registry import model_registry


def run_prediction(
    venue_payload: Optional[dict[str, Any]] = None,
) -> dict:
    """
    Run integrity prediction on a venue.

    In test mode, generates a mock venue.
    In production mode, builds a graph from the provided payload.
    """
    if settings.mode == AppMode.TEST:
        data = generate_mock_venue()
        student_ids = [f"mock_student_{i}" for i in range(data.num_nodes)]
    else:
        if venue_payload is None:
            raise ValueError("Production mode requires venue_payload")
        data = build_graph_from_live_data(venue_payload)
        student_ids = data.student_ids

    model = model_registry.active_model
    probs = model.predict(data)

    predictions = []
    for i in range(data.num_nodes):
        predictions.append({
            "student_id": student_ids[i],
            "clean_prob": round(float(probs[i, 0]), 4),
            "flagged_prob": round(float(probs[i, 1]), 4),
            "prediction": "flagged" if probs[i, 1] > 0.5 else "clean",
        })

    flagged_count = sum(1 for p in predictions if p["prediction"] == "flagged")

    return {
        "model_used": model_registry.active_name.value,
        "mode": settings.mode.value,
        "num_students": data.num_nodes,
        "num_flagged": flagged_count,
        "num_clean": data.num_nodes - flagged_count,
        "predictions": predictions,
    }
