"""Model listing, switching, and training endpoints."""

from typing import Optional

from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel

from app.config import ModelName
from app.models.registry import model_registry
from app.services.training_service import train_model

router = APIRouter()


class SwitchRequest(BaseModel):
    model: str


@router.get("/")
async def list_models():
    """List all available models and which one is currently active."""
    return model_registry.list_models()


@router.post("/switch")
async def switch_model(request: SwitchRequest):
    """Switch the active model used for predictions."""
    try:
        name = ModelName(request.model)
        model_registry.switch(name)
        return {
            "message": f"Switched to {name.value}",
            "active": name.value,
        }
    except ValueError:
        valid = [m.value for m in ModelName]
        raise HTTPException(
            status_code=400,
            detail=f"Unknown model '{request.model}'. Valid: {valid}",
        )


@router.post("/train/{model_name}")
async def train_endpoint(
    model_name: str,
    epochs: Optional[int] = Query(default=None),
    num_students: Optional[int] = Query(default=None),
    cheat_ratio: Optional[float] = Query(default=None),
    seed: int = Query(default=42),
):
    """Train or retrain a specific model."""
    try:
        name = ModelName(model_name)
    except ValueError:
        valid = [m.value for m in ModelName]
        raise HTTPException(
            status_code=400,
            detail=f"Unknown model '{model_name}'. Valid: {valid}",
        )

    try:
        result = train_model(
            name,
            epochs=epochs,
            num_students=num_students,
            cheat_ratio=cheat_ratio,
            seed=seed,
        )
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Training failed: {str(e)}")
