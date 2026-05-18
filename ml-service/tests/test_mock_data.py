"""Tests for the mock data generator."""

import torch
from app.data.mock_generator import generate_mock_venue, generate_mock_dataset


def test_generate_mock_venue_default():
    data = generate_mock_venue(seed=0)
    assert data.x is not None
    assert data.y is not None
    assert data.edge_index is not None
    assert data.num_nodes == 80  # default venue size
    assert data.x.shape == (80, 9)
    assert data.y.shape == (80,)
    assert set(data.y.numpy().tolist()).issubset({0, 1})


def test_generate_mock_venue_custom_size():
    data = generate_mock_venue(num_students=50, cheat_ratio=0.3, seed=1)
    assert data.num_nodes == 50
    num_cheaters = int((data.y == 1).sum())
    assert num_cheaters == 15  # 50 * 0.3


def test_masks_cover_all_nodes():
    data = generate_mock_venue(num_students=100, seed=2)
    total = data.train_mask.sum() + data.val_mask.sum() + data.test_mask.sum()
    assert total == 100
    overlap = data.train_mask & data.val_mask
    assert overlap.sum() == 0


def test_edge_index_valid():
    data = generate_mock_venue(num_students=40, seed=3)
    assert data.edge_index.shape[0] == 2
    assert data.edge_index.max() < data.num_nodes
    assert data.edge_index.min() >= 0


def test_generate_mock_dataset():
    dataset = generate_mock_dataset(num_venues=3, num_students=30, seed=10)
    assert len(dataset) == 3
    for d in dataset:
        assert d.num_nodes == 30


def test_deterministic_with_seed():
    d1 = generate_mock_venue(num_students=40, seed=99)
    d2 = generate_mock_venue(num_students=40, seed=99)
    assert torch.equal(d1.x, d2.x)
    assert torch.equal(d1.y, d2.y)
