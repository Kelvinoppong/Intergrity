"""Compute precision, recall, and F1 for a model on a given graph."""

from typing import Optional

import torch
from sklearn.metrics import precision_score, recall_score, f1_score, classification_report
from torch_geometric.data import Data

from app.models.base_model import BaseIntegrityModel


def compute_metrics(
    model: BaseIntegrityModel,
    data: Data,
    mask: Optional[torch.Tensor] = None,
) -> dict:
    """
    Run inference and return precision, recall, F1 (macro + per-class).

    Parameters
    ----------
    model : BaseIntegrityModel
    data  : PyG Data object (must have ``y`` labels)
    mask  : Optional boolean mask (defaults to ``data.test_mask``)
    """
    if mask is None:
        mask = getattr(data, "test_mask", None)
    if mask is None:
        mask = torch.ones(data.num_nodes, dtype=torch.bool)

    preds = model.predict_classes(data)[mask].cpu().numpy()
    labels = data.y[mask].cpu().numpy()

    target_names = ["clean", "flagged"]

    return {
        "precision_macro": float(precision_score(labels, preds, average="macro", zero_division=0)),
        "recall_macro": float(recall_score(labels, preds, average="macro", zero_division=0)),
        "f1_macro": float(f1_score(labels, preds, average="macro", zero_division=0)),
        "precision_per_class": precision_score(labels, preds, average=None, zero_division=0).tolist(),
        "recall_per_class": recall_score(labels, preds, average=None, zero_division=0).tolist(),
        "f1_per_class": f1_score(labels, preds, average=None, zero_division=0).tolist(),
        "classification_report": classification_report(
            labels, preds, target_names=target_names, zero_division=0, output_dict=True,
        ),
    }
