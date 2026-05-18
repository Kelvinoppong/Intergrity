"""Tests for all four GNN models."""

import tempfile
from pathlib import Path

import torch
from app.data.mock_generator import generate_mock_venue
from app.models.vanilla_gcn import VanillaGCN
from app.models.h2gcn import H2GCNModel
from app.models.fagcn import FAGCNModel
from app.models.graphsage import GraphSAGEModel

NUM_FEATURES = 9
HIDDEN = 32
NUM_CLASSES = 2
DROPOUT = 0.3
EPOCHS = 20


def _get_data():
    return generate_mock_venue(num_students=50, cheat_ratio=0.2, seed=42)


def _test_model_forward(model_cls, **kwargs):
    model = model_cls(NUM_FEATURES, HIDDEN, NUM_CLASSES, DROPOUT, **kwargs)
    data = _get_data()
    out = model(data)
    assert out.shape == (data.num_nodes, NUM_CLASSES)
    return model, data


def _test_model_train(model, data):
    result = model.train_model(data, epochs=EPOCHS, lr=0.01)
    assert "loss_history" in result
    assert len(result["loss_history"]) == EPOCHS
    assert "train_acc" in result
    assert 0.0 <= result["train_acc"] <= 1.0


def _test_model_predict(model, data):
    probs = model.predict(data)
    assert probs.shape == (data.num_nodes, NUM_CLASSES)
    row_sums = probs.sum(dim=1)
    assert torch.allclose(row_sums, torch.ones_like(row_sums), atol=1e-5)


def _test_model_save_load(model_cls, **kwargs):
    model = model_cls(NUM_FEATURES, HIDDEN, NUM_CLASSES, DROPOUT, **kwargs)
    data = _get_data()
    model.train_model(data, epochs=5)

    with tempfile.TemporaryDirectory() as tmp:
        path = str(Path(tmp) / "model.pt")
        model.save(path)

        model2 = model_cls(NUM_FEATURES, HIDDEN, NUM_CLASSES, DROPOUT, **kwargs)
        model2.load(path)

        p1 = model.predict(data)
        p2 = model2.predict(data)
        assert torch.allclose(p1, p2, atol=1e-5)


# ── Vanilla GCN ──

def test_vanilla_gcn_forward():
    model, data = _test_model_forward(VanillaGCN)
    _test_model_predict(model, data)


def test_vanilla_gcn_train():
    model, data = _test_model_forward(VanillaGCN)
    _test_model_train(model, data)


def test_vanilla_gcn_save_load():
    _test_model_save_load(VanillaGCN)


# ── H2GCN ──

def test_h2gcn_forward():
    model, data = _test_model_forward(H2GCNModel)
    _test_model_predict(model, data)


def test_h2gcn_train():
    model, data = _test_model_forward(H2GCNModel)
    _test_model_train(model, data)


def test_h2gcn_save_load():
    _test_model_save_load(H2GCNModel)


# ── FAGCN ──

def test_fagcn_forward():
    model, data = _test_model_forward(FAGCNModel)
    _test_model_predict(model, data)


def test_fagcn_train():
    model, data = _test_model_forward(FAGCNModel)
    _test_model_train(model, data)


def test_fagcn_save_load():
    _test_model_save_load(FAGCNModel)


# ── GraphSAGE ──

def test_graphsage_forward():
    model, data = _test_model_forward(GraphSAGEModel)
    _test_model_predict(model, data)


def test_graphsage_train():
    model, data = _test_model_forward(GraphSAGEModel)
    _test_model_train(model, data)


def test_graphsage_save_load():
    _test_model_save_load(GraphSAGEModel)
