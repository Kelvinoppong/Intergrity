"""Utilities for normalising and augmenting node features."""

import torch
from torch_geometric.data import Data


def normalize_features(data: Data) -> Data:
    """Zero-mean, unit-variance normalisation per feature column."""
    x = data.x
    mean = x.mean(dim=0, keepdim=True)
    std = x.std(dim=0, keepdim=True).clamp(min=1e-8)
    data.x = (x - mean) / std
    return data


def add_degree_feature(data: Data) -> Data:
    """Append node degree as an extra feature column."""
    row = data.edge_index[0]
    deg = torch.zeros(data.num_nodes, dtype=torch.float)
    deg.scatter_add_(0, row, torch.ones_like(row, dtype=torch.float))
    deg = deg.unsqueeze(1)
    data.x = torch.cat([data.x, deg], dim=1)
    return data
