"""Runtime smoke tests, not graph quality or M0 acceptance tests."""

import cv2
import numpy as np
from skimage.morphology import skeletonize


def test_png_round_trip() -> None:
    image = np.zeros((8, 8), dtype=np.uint8)
    image[2:6, 2:6] = 255
    success, encoded = cv2.imencode(".png", image)
    assert success
    decoded = cv2.imdecode(encoded, cv2.IMREAD_GRAYSCALE)
    np.testing.assert_array_equal(decoded, image)


def test_skeleton_dependency_runs() -> None:
    mask = np.zeros((8, 8), dtype=bool)
    mask[1:7, 3:5] = True
    result = skeletonize(mask)
    assert result.dtype == np.bool_
    assert result.shape == mask.shape
    assert result.any()
