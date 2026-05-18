"""
H2GCN — Heterophily-aware Graph Convolutional Network.

Designed for graphs where connected nodes often have *different* labels
(heterophily).  Separates ego, neighbour, and higher-order neighbour
embeddings before combining them for classification.

Reference: Zhu et al., "Beyond Homophily in Graph Neural Networks", 2020.
"""

import torch
import torch.nn.functional as F
from torch_geometric.data import Data
from torch_geometric.nn import GCNConv
from torch_geometric.utils import add_self_loops, degree

from app.models.base_model import BaseIntegrityModel


class H2GCNModel(BaseIntegrityModel):

    def __init__(
        self,
        num_features: int,
        hidden_channels: int,
        num_classes: int,
        dropout: float = 0.3,
        k_hops: int = 2,
    ):
        super().__init__()
        self.k_hops = k_hops
        self.dropout = dropout

        self.ego_lin = torch.nn.Linear(num_features, hidden_channels)

        self.neighbor_convs = torch.nn.ModuleList()
        for _ in range(k_hops):
            self.neighbor_convs.append(GCNConv(num_features if _ == 0 else hidden_channels, hidden_channels))

        concat_dim = hidden_channels * (1 + k_hops)
        self.classifier = torch.nn.Linear(concat_dim, num_classes)

    def forward(self, data: Data) -> torch.Tensor:
        x, edge_index = data.x, data.edge_index

        ego = F.relu(self.ego_lin(x))
        ego = F.dropout(ego, p=self.dropout, training=self.training)

        neighbor_embeds = []
        h = x
        for conv in self.neighbor_convs:
            h = F.relu(conv(h, edge_index))
            h = F.dropout(h, p=self.dropout, training=self.training)
            neighbor_embeds.append(h)

        combined = torch.cat([ego] + neighbor_embeds, dim=1)
        return self.classifier(combined)
