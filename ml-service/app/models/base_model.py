"""Abstract base class that every GNN integrity model must implement."""

from abc import ABC, abstractmethod

import torch
import torch.nn as nn
from torch_geometric.data import Data


class BaseIntegrityModel(ABC, nn.Module):
    """
    Contract for all integrity-prediction GNN models.

    Sub-classes must implement ``forward`` (standard PyTorch) and may
    override ``train_model`` / ``evaluate_model`` if they need custom
    training loops.
    """

    @abstractmethod
    def forward(self, data: Data) -> torch.Tensor:
        """Return raw logits of shape (num_nodes, num_classes)."""
        ...

    def predict(self, data: Data) -> torch.Tensor:
        """Return per-node predicted class probabilities."""
        self.eval()
        with torch.no_grad():
            logits = self.forward(data)
            return torch.softmax(logits, dim=1)

    def predict_classes(self, data: Data) -> torch.Tensor:
        """Return hard class predictions."""
        return self.predict(data).argmax(dim=1)

    def train_model(
        self,
        data: Data,
        epochs: int = 200,
        lr: float = 0.01,
        weight_decay: float = 5e-4,
    ) -> dict:
        """
        Standard training loop with cross-entropy loss.

        Returns a dict with ``loss_history`` and final ``train_acc``.
        """
        self.train()
        optimizer = torch.optim.Adam(self.parameters(), lr=lr, weight_decay=weight_decay)
        criterion = nn.CrossEntropyLoss()

        loss_history = []
        for epoch in range(epochs):
            optimizer.zero_grad()
            out = self.forward(data)
            loss = criterion(out[data.train_mask], data.y[data.train_mask])
            loss.backward()
            optimizer.step()
            loss_history.append(float(loss))

        self.eval()
        with torch.no_grad():
            pred = self.forward(data).argmax(dim=1)
            correct = (pred[data.train_mask] == data.y[data.train_mask]).sum()
            train_acc = float(correct) / int(data.train_mask.sum())

        return {"loss_history": loss_history, "train_acc": train_acc}

    def save(self, path: str) -> None:
        torch.save(self.state_dict(), path)

    def load(self, path: str) -> None:
        self.load_state_dict(torch.load(path, map_location="cpu", weights_only=True))
        self.eval()
