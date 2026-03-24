"""
Preprocessing pipeline for cervical cytology / MRI images.

Input  : raw bytes of an image file
Output : numpy array of shape (1, IMAGE_SIZE, IMAGE_SIZE, 3), dtype float32, values in [0, 1]
"""
import io
import numpy as np

from app.config.settings import settings


def preprocess_image(raw_bytes: bytes) -> np.ndarray:
    """
    1. Decode the image bytes with Pillow (avoids OpenCV dependency).
    2. Convert to RGB.
    3. Resize to (IMAGE_SIZE, IMAGE_SIZE).
    4. Normalize to [0, 1].
    5. Add batch dimension → (1, H, W, 3).
    """
    from PIL import Image

    img = Image.open(io.BytesIO(raw_bytes)).convert("RGB")
    img = img.resize((settings.IMAGE_SIZE, settings.IMAGE_SIZE), Image.BILINEAR)
    arr = np.array(img, dtype=np.float32) / 255.0
    return np.expand_dims(arr, axis=0)   # (1, 224, 224, 3)
