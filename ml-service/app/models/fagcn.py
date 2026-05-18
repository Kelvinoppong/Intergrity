"""
FAGCN — Frequency Adaptive Graph Convolutional Network.

Learns per-edge coefficients that adaptively mix low-frequency (smoothing)
and high-frequency (sharpening) signals, making it effective on both
homophilic and heterophilic graphs.

Reference: Bo et al., "Beyond Low-frequency Information in Graph
Convolutional Networks", 2021.
"""

import torch
import torch.nn as nn
import torch.nn.functional as F
from torch_geometric.data import Data
from torch_geometric.nn import FAConv

from app.models.base_model import BaseIntegrityModel


class FAGCNModel(BaseIntegrityModel):

    def __init__(
        self,
        num_features: int,
        hidden_channels: int,
        num_classes: int,
        dropout: float = 0.3,
        num_layers: int = 2,
        eps: float = 0.1,
    ):
        super().__init__()
        self.dropout = dropout
        self.input_lin = nn.Linear(num_features, hidden_channels)

        self.convs = nn.ModuleList()
        for _ in range(num_layers):
            self.convs.append(FAConv(hidden_channels, eps=eps, dropout=dropout))

        self.output_lin = nn.Linear(hidden_channels, num_classes)

    def forward(self, data: Data) -> torch.Tensor:
        x, edge_index = data.x, data.edge_index

        x = F.relu(self.input_lin(x))
        x = F.dropout(x, p=self.dropout, training=self.training)

        x_0 = x
        for conv in self.convs:
            x = F.relu(conv(x, x_0, edge_index))
            x = F.dropout(x, p=self.dropout, training=self.training)

        return self.output_lin(x)
