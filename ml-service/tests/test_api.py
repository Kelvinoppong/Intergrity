"""Tests for FastAPI endpoints."""

import pytest
from fastapi.testclient import TestClient

from app.main import app

client = TestClient(app)


def test_health():
    resp = client.get("/health")
    assert resp.status_code == 200
    data = resp.json()
    assert data["status"] == "healthy"


def test_list_models():
    resp = client.get("/models/")
    assert resp.status_code == 200
    data = resp.json()
    assert "models" in data
    assert "active" in data
    assert len(data["models"]) == 4


def test_switch_model():
    resp = client.post("/models/switch", json={"model": "graphsage"})
    assert resp.status_code == 200
    assert resp.json()["active"] == "graphsage"


def test_switch_model_invalid():
    resp = client.post("/models/switch", json={"model": "nonexistent"})
    assert resp.status_code == 400


def test_predict_test_mode():
    resp = client.post("/predict")
    assert resp.status_code == 200
    data = resp.json()
    assert "predictions" in data
    assert "model_used" in data
    assert data["mode"] == "test"


def test_evaluate_single_model():
    resp = client.get("/evaluate/vanilla_gcn?num_students=30&seed=1")
    assert resp.status_code == 200
    data = resp.json()
    assert "precision_macro" in data
    assert "confusion_matrix" in data


def test_evaluate_all():
    resp = client.get("/evaluate/all?num_students=30&seed=1")
    assert resp.status_code == 200
    data = resp.json()
    assert "results" in data
    assert len(data["results"]) == 4


def test_evaluate_invalid_model():
    resp = client.get("/evaluate/bad_model")
    assert resp.status_code == 400


def test_train_model():
    resp = client.post("/models/train/vanilla_gcn?epochs=10&num_students=30&seed=1")
    assert resp.status_code == 200
    data = resp.json()
    assert data["model"] == "vanilla_gcn"
    assert "train_acc" in data
