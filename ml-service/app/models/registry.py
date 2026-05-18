from __future__ import annotations

from typing import Dict, Optional

from app.config import ModelName, settings


class ModelRegistry:
    """Singleton registry for loading, caching, and switching GNN models."""

    def __init__(self):
        self._models: Dict[str, object] = {}
        self._active_name: Optional[ModelName] = None

    def initialize(self):
        from app.models.vanilla_gcn import VanillaGCN
        from app.models.h2gcn import H2GCNModel
        from app.models.fagcn import FAGCNModel
        from app.models.graphsage import GraphSAGEModel

        num_features = settings.num_node_features
        num_classes = settings.num_classes
        hidden = settings.hidden_channels
        dropout = settings.dropout

        self._models = {
            ModelName.VANILLA_GCN: VanillaGCN(num_features, hidden, num_classes, dropout),
            ModelName.H2GCN: H2GCNModel(num_features, hidden, num_classes, dropout),
            ModelName.FAGCN: FAGCNModel(num_features, hidden, num_classes, dropout),
            ModelName.GRAPHSAGE: GraphSAGEModel(num_features, hidden, num_classes, dropout),
        }
        self._active_name = settings.default_model

        for name, model in self._models.items():
            weight_path = settings.trained_models_path / f"{name.value}.pt"
            if weight_path.exists():
                model.load(str(weight_path))

    @property
    def active_model(self):
        return self._models[self._active_name]

    @property
    def active_name(self) -> ModelName:
        return self._active_name

    def switch(self, name: ModelName):
        if name not in self._models:
            raise ValueError(f"Unknown model: {name}")
        self._active_name = name

    def get(self, name: ModelName):
        if name not in self._models:
            raise ValueError(f"Unknown model: {name}")
        return self._models[name]

    def list_models(self):
        return {
            "models": [n.value for n in self._models],
            "active": self._active_name.value,
        }


model_registry = ModelRegistry()
