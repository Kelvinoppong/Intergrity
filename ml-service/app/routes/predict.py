"""Prediction endpoint — run integrity inference on a venue."""

from typing import Any, Optional

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from app.config import AppMode, settings
from app.services.prediction_service import run_prediction

router = APIRouter()


class StudentPayload(BaseModel):
    student_id: str
    seat_x: float = 0.0
    seat_y: float = 0.0
    tab_switch_count: float = 0
    paste_event_count: float = 0
    window_blur_count: float = 0
    usb_detected: bool = False
    multi_device_login: bool = False
    avg_answer_similarity: float = 0.0
    time_per_question_std: float = 0.0
    response_time_pattern: float = 0.0
    ip_similarity_score: float = 0.0


class VenuePayload(BaseModel):
    venue_id: str = ""
    exam_id: str = ""
    students: list[StudentPayload] = []


@router.post("/predict")
async def predict_integrity(payload: Optional[VenuePayload] = None):
    """
    Run integrity prediction on a venue.

    - **test mode**: Generates mock data automatically (payload optional).
    - **production mode**: Requires a full venue payload with student data.
    """
    try:
        venue_data = None
        if payload and payload.students:
            venue_data = payload.model_dump()

        if settings.mode == AppMode.PRODUCTION and venue_data is None:
            raise HTTPException(
                status_code=400,
                detail="Production mode requires a venue payload with student data.",
            )

        result = run_prediction(venue_payload=venue_data)
        return result

    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Prediction failed: {str(e)}")
