"""PyG InMemoryDataset wrapper for mock / historical data."""

from pathlib import Path
from typing import Optional

import torch
from torch_geometric.data import Data, InMemoryDataset

from app.data.mock_generator import generate_mock_dataset


class IntegrityDataset(InMemoryDataset):
    """
    Wraps venue graphs into a PyG InMemoryDataset.

    In **test** mode it auto-generates synthetic venues.
    In **production** mode it loads previously saved historical data.
    """

    def __init__(
        self,
        root: str = "dataset_cache",
        num_venues: int = 5,
        num_students: Optional[int] = None,
        cheat_ratio: Optional[float] = None,
        seed: int = 42,
        pre_generated: Optional[list[Data]] = None,
    ):
        self._num_venues = num_venues
        self._num_students = num_students
        self._cheat_ratio = cheat_ratio
        self._seed = seed
        self._pre_generated = pre_generated
        super().__init__(root)
        self.load(self.processed_paths[0])

    @property
    def processed_file_names(self):
        return ["data.pt"]

    def process(self):
        if self._pre_generated is not None:
            data_list = self._pre_generated
        else:
            data_list = generate_mock_dataset(
                num_venues=self._num_venues,
                num_students=self._num_students,
                cheat_ratio=self._cheat_ratio,
                seed=self._seed,
            )
        self.save(data_list, self.processed_paths[0])
