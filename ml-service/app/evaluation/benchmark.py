"""Run all 4 models on the same dataset and collect comparative results."""

from typing import Optional

from torch_geometric.data import Data

from app.config import ModelName, settings
from app.evaluation.metrics import compute_metrics
from app.evaluation.confusion import compute_confusion_matrix, generate_confusion_heatmap
from app.models.registry import model_registry


def benchmark_single_model(
    model_name: ModelName,
    data: Data,
    save_heatmaps: bool = True,
) -> dict:
    """Train (if untrained) and evaluate a single model."""
    model = model_registry.get(model_name)

    train_result = model.train_model(
        data,
        epochs=settings.default_epochs,
        lr=settings.learning_rate,
    )

    metrics = compute_metrics(model, data)
    cm = compute_confusion_matrix(model, data)

    result = {
        "model": model_name.value,
        "train_acc": train_result["train_acc"],
        **metrics,
        "confusion_matrix": cm["matrix"],
    }

    if save_heatmaps:
        heatmap = generate_confusion_heatmap(
            model, data, model_name.value, save_dir=str(settings.static_path),
        )
        result["heatmap_path"] = heatmap.get("image_path")

    weight_path = settings.trained_models_path / f"{model_name.value}.pt"
    model.save(str(weight_path))

    return result


def benchmark_all_models(
    data: Data,
    save_heatmaps: bool = True,
) -> dict:
    """Benchmark every registered model on the same data."""
    results = []
    for name in ModelName:
        result = benchmark_single_model(name, data, save_heatmaps)
        results.append(result)

    return {
        "dataset_info": {
            "num_nodes": int(data.num_nodes),
            "num_edges": int(data.edge_index.shape[1]),
            "num_cheaters": int((data.y == 1).sum()),
            "num_clean": int((data.y == 0).sum()),
        },
        "results": results,
    }
