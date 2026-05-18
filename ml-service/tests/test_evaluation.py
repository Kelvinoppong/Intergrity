"""Tests for evaluation metrics and confusion matrix generation."""

from app.data.mock_generator import generate_mock_venue
from app.evaluation.metrics import compute_metrics
from app.evaluation.confusion import compute_confusion_matrix, generate_confusion_heatmap
from app.models.vanilla_gcn import VanillaGCN

NUM_FEATURES = 9
HIDDEN = 32
NUM_CLASSES = 2


def _trained_model_and_data():
    data = generate_mock_venue(num_students=60, cheat_ratio=0.2, seed=42)
    model = VanillaGCN(NUM_FEATURES, HIDDEN, NUM_CLASSES, dropout=0.3)
    model.train_model(data, epochs=50, lr=0.01)
    return model, data


def test_compute_metrics():
    model, data = _trained_model_and_data()
    metrics = compute_metrics(model, data)

    assert "precision_macro" in metrics
    assert "recall_macro" in metrics
    assert "f1_macro" in metrics
    assert 0.0 <= metrics["precision_macro"] <= 1.0
    assert 0.0 <= metrics["recall_macro"] <= 1.0
    assert 0.0 <= metrics["f1_macro"] <= 1.0

    assert "precision_per_class" in metrics
    assert len(metrics["precision_per_class"]) == 2


def test_confusion_matrix():
    model, data = _trained_model_and_data()
    cm = compute_confusion_matrix(model, data)

    assert "matrix" in cm
    assert "labels" in cm
    assert len(cm["matrix"]) == 2
    assert len(cm["matrix"][0]) == 2
    assert cm["labels"] == ["clean", "flagged"]


def test_confusion_heatmap_base64():
    model, data = _trained_model_and_data()
    result = generate_confusion_heatmap(model, data, "vanilla_gcn")

    assert "image_base64" in result
    assert len(result["image_base64"]) > 100


def test_confusion_heatmap_file(tmp_path):
    model, data = _trained_model_and_data()
    result = generate_confusion_heatmap(
        model, data, "vanilla_gcn", save_dir=str(tmp_path)
    )

    assert "image_path" in result
    from pathlib import Path
    assert Path(result["image_path"]).exists()
