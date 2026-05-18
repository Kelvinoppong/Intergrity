"""Generate confusion matrices — both raw data and heatmap images."""

import base64
import io
from pathlib import Path
from typing import Optional

import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
import seaborn as sns
import torch
from sklearn.metrics import confusion_matrix
from torch_geometric.data import Data

from app.models.base_model import BaseIntegrityModel


def compute_confusion_matrix(
    model: BaseIntegrityModel,
    data: Data,
    mask: Optional[torch.Tensor] = None,
) -> dict:
    """Return raw confusion matrix as nested list + label mapping."""
    if mask is None:
        mask = getattr(data, "test_mask", None)
    if mask is None:
        mask = torch.ones(data.num_nodes, dtype=torch.bool)

    preds = model.predict_classes(data)[mask].cpu().numpy()
    labels = data.y[mask].cpu().numpy()

    cm = confusion_matrix(labels, preds, labels=[0, 1])
    return {
        "matrix": cm.tolist(),
        "labels": ["clean", "flagged"],
    }


def generate_confusion_heatmap(
    model: BaseIntegrityModel,
    data: Data,
    model_name: str,
    save_dir: Optional[str] = None,
    mask: Optional[torch.Tensor] = None,
) -> dict:
    """
    Create a seaborn heatmap of the confusion matrix.

    Returns the raw matrix and either a file path or base64-encoded PNG.
    """
    cm_data = compute_confusion_matrix(model, data, mask)
    cm = cm_data["matrix"]
    label_names = cm_data["labels"]

    fig, ax = plt.subplots(figsize=(5, 4))
    sns.heatmap(
        cm,
        annot=True,
        fmt="d",
        cmap="Blues",
        xticklabels=label_names,
        yticklabels=label_names,
        ax=ax,
    )
    ax.set_xlabel("Predicted")
    ax.set_ylabel("Actual")
    ax.set_title(f"Confusion Matrix — {model_name}")
    fig.tight_layout()

    result = {"matrix": cm, "labels": label_names}

    if save_dir:
        path = Path(save_dir) / f"confusion_{model_name}.png"
        fig.savefig(path, dpi=150)
        result["image_path"] = str(path)
    else:
        buf = io.BytesIO()
        fig.savefig(buf, format="png", dpi=150)
        buf.seek(0)
        result["image_base64"] = base64.b64encode(buf.read()).decode("utf-8")

    plt.close(fig)
    return result
