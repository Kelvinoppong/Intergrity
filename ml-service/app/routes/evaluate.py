"""Evaluation endpoints — single-model and benchmark-all."""

from fastapi import APIRouter, HTTPException, Query

from app.config import ModelName, settings
from app.data.mock_generator import generate_mock_venue
from app.evaluation.benchmark import benchmark_all_models, benchmark_single_model

router = APIRouter()


@router.get("/evaluate/all")
async def evaluate_all(
    num_students: int = Query(default=None, description="Override venue size"),
    cheat_ratio: float = Query(default=None, description="Override cheat ratio"),
    seed: int = Query(default=42),
):
    """Benchmark every model on the same dataset and compare results."""
    try:
        data = generate_mock_venue(
            num_students=num_students or settings.mock_venue_size,
            cheat_ratio=cheat_ratio or settings.mock_cheat_ratio,
            seed=seed,
        )
        result = benchmark_all_models(data, save_heatmaps=True)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Benchmark failed: {str(e)}")


@router.get("/evaluate/{model_name}")
async def evaluate_model(
    model_name: str,
    num_students: int = Query(default=None),
    cheat_ratio: float = Query(default=None),
    seed: int = Query(default=42),
):
    """Train and evaluate a single model, returning precision/recall/F1 + confusion matrix."""
    try:
        name = ModelName(model_name)
    except ValueError:
        valid = [m.value for m in ModelName]
        raise HTTPException(
            status_code=400,
            detail=f"Unknown model '{model_name}'. Valid: {valid}",
        )

    try:
        data = generate_mock_venue(
            num_students=num_students or settings.mock_venue_size,
            cheat_ratio=cheat_ratio or settings.mock_cheat_ratio,
            seed=seed,
        )
        result = benchmark_single_model(name, data, save_heatmaps=True)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Evaluation failed: {str(e)}")
