"""Training and retraining service for GNN models."""

from typing import Optional

from app.config import ModelName, settings
from app.data.mock_generator import generate_mock_venue
from app.models.registry import model_registry


def train_model(
    model_name: ModelName,
    epochs: Optional[int] = None,
    num_students: Optional[int] = None,
    cheat_ratio: Optional[float] = None,
    seed: int = 42,
) -> dict:
    """
    Train a specific model on mock data (test mode) or provided data.

    Returns training stats and saves weights.
    """
    model = model_registry.get(model_name)
    ep = epochs or settings.default_epochs

    data = generate_mock_venue(
        num_students=num_students,
        cheat_ratio=cheat_ratio,
        seed=seed,
    )

    result = model.train_model(data, epochs=ep, lr=settings.learning_rate)

    weight_path = settings.trained_models_path / f"{model_name.value}.pt"
    model.save(str(weight_path))

    return {
        "model": model_name.value,
        "epochs": ep,
        "final_loss": result["loss_history"][-1] if result["loss_history"] else None,
        "train_acc": result["train_acc"],
        "weights_saved": str(weight_path),
    }
