"""Generate synthetic venue graphs with realistic student behavioral features."""

from typing import Optional

import numpy as np
import torch
from torch_geometric.data import Data

from app.config import settings


def generate_mock_venue(
    num_students: Optional[int] = None,
    cheat_ratio: Optional[float] = None,
    seed: Optional[int] = None,
) -> Data:
    """
    Create a single synthetic exam-venue graph.

    Nodes represent students.  Edges encode seating proximity and answer
    similarity.  Node features mimic real behavioral signals.

    Returns a PyG ``Data`` object with ``train_mask``, ``val_mask``, and
    ``test_mask`` for evaluation splits (60/20/20).
    """
    if seed is not None:
        np.random.seed(seed)
        torch.manual_seed(seed)

    n = num_students or settings.mock_venue_size
    ratio = cheat_ratio or settings.mock_cheat_ratio
    num_cheaters = max(1, int(n * ratio))

    labels = np.zeros(n, dtype=np.int64)
    cheat_indices = np.random.choice(n, size=num_cheaters, replace=False)
    labels[cheat_indices] = 1

    features = _generate_features(n, labels)
    edge_index = _generate_edges(n, labels)
    masks = _split_masks(n)

    return Data(
        x=torch.tensor(features, dtype=torch.float),
        edge_index=torch.tensor(edge_index, dtype=torch.long),
        y=torch.tensor(labels, dtype=torch.long),
        train_mask=masks["train"],
        val_mask=masks["val"],
        test_mask=masks["test"],
        num_nodes=n,
    )


def generate_mock_dataset(
    num_venues: int = 5,
    num_students: Optional[int] = None,
    cheat_ratio: Optional[float] = None,
    seed: int = 42,
) -> list[Data]:
    """Generate multiple venue graphs for training / benchmarking."""
    return [
        generate_mock_venue(num_students, cheat_ratio, seed=seed + i)
        for i in range(num_venues)
    ]


# ── internal helpers ────────────────────────────────────────────────

_FEATURE_NAMES = [
    "tab_switch_count",
    "paste_event_count",
    "window_blur_count",
    "usb_detected",
    "multi_device_login",
    "avg_answer_similarity",
    "time_per_question_std",
    "response_time_pattern",
    "ip_similarity_score",
]


def _generate_features(n: int, labels: np.ndarray) -> np.ndarray:
    """
    Build a (n, 9) feature matrix.

    Clean students get low-risk distributions; cheaters get elevated signals
    with some overlap so the classification task is non-trivial.
    """
    feats = np.zeros((n, len(_FEATURE_NAMES)), dtype=np.float32)

    clean = labels == 0
    cheat = labels == 1

    # tab_switch_count
    feats[clean, 0] = np.random.poisson(1.5, clean.sum())
    feats[cheat, 0] = np.random.poisson(6.0, cheat.sum())

    # paste_event_count
    feats[clean, 1] = np.random.poisson(0.3, clean.sum())
    feats[cheat, 1] = np.random.poisson(3.0, cheat.sum())

    # window_blur_count
    feats[clean, 2] = np.random.poisson(1.0, clean.sum())
    feats[cheat, 2] = np.random.poisson(4.0, cheat.sum())

    # usb_detected (binary)
    feats[clean, 3] = np.random.binomial(1, 0.02, clean.sum())
    feats[cheat, 3] = np.random.binomial(1, 0.35, cheat.sum())

    # multi_device_login (binary)
    feats[clean, 4] = np.random.binomial(1, 0.01, clean.sum())
    feats[cheat, 4] = np.random.binomial(1, 0.25, cheat.sum())

    # avg_answer_similarity
    feats[clean, 5] = np.clip(np.random.normal(0.25, 0.10, clean.sum()), 0, 1)
    feats[cheat, 5] = np.clip(np.random.normal(0.70, 0.12, cheat.sum()), 0, 1)

    # time_per_question_std (low std → copy-paste speed)
    feats[clean, 6] = np.clip(np.random.normal(12.0, 4.0, clean.sum()), 0, None)
    feats[cheat, 6] = np.clip(np.random.normal(4.0, 2.5, cheat.sum()), 0, None)

    # response_time_pattern (synchronisation score 0-1)
    feats[clean, 7] = np.clip(np.random.normal(0.15, 0.08, clean.sum()), 0, 1)
    feats[cheat, 7] = np.clip(np.random.normal(0.60, 0.15, cheat.sum()), 0, 1)

    # ip_similarity_score
    feats[clean, 8] = np.clip(np.random.normal(0.10, 0.08, clean.sum()), 0, 1)
    feats[cheat, 8] = np.clip(np.random.normal(0.55, 0.15, cheat.sum()), 0, 1)

    return feats


def _generate_edges(n: int, labels: np.ndarray) -> np.ndarray:
    """
    Build an undirected edge list.

    Edges come from two sources:
    1. Seating proximity — random geometric graph within a threshold.
    2. Answer-similarity boost — cheaters more likely connected to each other.
    """
    positions = np.random.rand(n, 2)
    proximity_threshold = 0.25

    src, dst = [], []
    for i in range(n):
        for j in range(i + 1, n):
            dist = np.linalg.norm(positions[i] - positions[j])
            if dist < proximity_threshold:
                src.extend([i, j])
                dst.extend([j, i])

    cheat_idx = np.where(labels == 1)[0]
    for i in range(len(cheat_idx)):
        for j in range(i + 1, len(cheat_idx)):
            if np.random.rand() < 0.6:
                a, b = cheat_idx[i], cheat_idx[j]
                src.extend([a, b])
                dst.extend([b, a])

    if len(src) == 0:
        for i in range(n):
            j = (i + 1) % n
            src.extend([i, j])
            dst.extend([j, i])

    edge_index = np.array([src, dst], dtype=np.int64)
    return edge_index


def _split_masks(n: int):
    """60 / 20 / 20 stratified-random split."""
    perm = torch.randperm(n)
    train_end = int(0.6 * n)
    val_end = int(0.8 * n)

    train_mask = torch.zeros(n, dtype=torch.bool)
    val_mask = torch.zeros(n, dtype=torch.bool)
    test_mask = torch.zeros(n, dtype=torch.bool)

    train_mask[perm[:train_end]] = True
    val_mask[perm[train_end:val_end]] = True
    test_mask[perm[val_end:]] = True

    return {"train": train_mask, "val": val_mask, "test": test_mask}
