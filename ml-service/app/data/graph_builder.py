"""Build PyG Data objects from raw live student behavioural data."""

from typing import Any

import numpy as np
import torch
from torch_geometric.data import Data


def build_graph_from_live_data(venue_data: dict[str, Any]) -> Data:
    """
    Convert a venue payload (from the backend) into a PyG graph.

    Expected schema for *venue_data*::

        {
            "venue_id": "...",
            "exam_id": "...",
            "students": [
                {
                    "student_id": "s1",
                    "seat_x": 0.2,  "seat_y": 0.5,
                    "tab_switch_count": 3,
                    "paste_event_count": 1,
                    "window_blur_count": 2,
                    "usb_detected": false,
                    "multi_device_login": false,
                    "avg_answer_similarity": 0.35,
                    "time_per_question_std": 8.2,
                    "response_time_pattern": 0.20,
                    "ip_similarity_score": 0.10,
                },
                ...
            ]
        }
    """
    students = venue_data["students"]
    n = len(students)

    feature_keys = [
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

    features = np.zeros((n, len(feature_keys)), dtype=np.float32)
    positions = np.zeros((n, 2), dtype=np.float32)

    for i, s in enumerate(students):
        for j, key in enumerate(feature_keys):
            features[i, j] = float(s.get(key, 0))
        positions[i] = [float(s.get("seat_x", 0)), float(s.get("seat_y", 0))]

    edge_index = _build_edges(n, positions, features[:, 5])

    student_ids = [s["student_id"] for s in students]

    return Data(
        x=torch.tensor(features, dtype=torch.float),
        edge_index=torch.tensor(edge_index, dtype=torch.long),
        num_nodes=n,
        student_ids=student_ids,
        venue_id=venue_data.get("venue_id"),
        exam_id=venue_data.get("exam_id"),
    )


def _build_edges(
    n: int,
    positions: np.ndarray,
    answer_similarity: np.ndarray,
    proximity_threshold: float = 0.25,
    similarity_threshold: float = 0.55,
) -> np.ndarray:
    """Edges based on seating proximity OR high answer similarity."""
    src, dst = [], []
    for i in range(n):
        for j in range(i + 1, n):
            dist = np.linalg.norm(positions[i] - positions[j])
            sim = (answer_similarity[i] + answer_similarity[j]) / 2

            if dist < proximity_threshold or sim > similarity_threshold:
                src.extend([i, j])
                dst.extend([j, i])

    if len(src) == 0:
        for i in range(n):
            j = (i + 1) % n
            src.extend([i, j])
            dst.extend([j, i])

    return np.array([src, dst], dtype=np.int64)
