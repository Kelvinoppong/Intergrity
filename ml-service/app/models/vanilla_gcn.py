"""Vanilla 2-layer Graph Convolutional Network."""

import torch
import torch.nn.functional as F
from torch_geometric.data import Data
from torch_geometric.nn import GCNConv

from app.models.base_model import BaseIntegrityModel


class VanillaGCN(BaseIntegrityModel):

    def __init__(
        self,
        num_features: int,
        hidden_channels: int,
        num_classes: int,
        dropout: float = 0.3,
    ):
        super().__init__()
        self.conv1 = GCNConv(num_features, hidden_channels)
        self.conv2 = GCNConv(hidden_channels, num_classes)
        self.dropout = dropout

    def forward(self, data: Data) -> torch.Tensor:
        x, edge_index = data.x, data.edge_index
        x = self.conv1(x, edge_index)
        x = F.relu(x)
        x = F.dropout(x, p=self.dropout, training=self.training)
        x = self.conv2(x, edge_index)
        return x
