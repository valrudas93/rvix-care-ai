import os
import uuid
from pathlib import Path

from fastapi import UploadFile

from app.config.settings import settings

ALLOWED_EXTENSIONS = {".jpg", ".jpeg", ".png", ".tif", ".tiff", ".dcm", ".nii", ".nii.gz"}


def _ensure_upload_dir(sub: str = "") -> Path:
    path = Path(settings.UPLOAD_DIR) / sub
    path.mkdir(parents=True, exist_ok=True)
    return path


async def save_upload_file(file: UploadFile, sub_folder: str = "studies") -> str:
    """Save an uploaded file and return its relative path."""
    ext = Path(file.filename or "image.jpg").suffix.lower()
    filename = f"{uuid.uuid4().hex}{ext}"
    dest_dir = _ensure_upload_dir(sub_folder)
    dest_path = dest_dir / filename

    content = await file.read()

    # Size check
    max_bytes = settings.MAX_FILE_SIZE_MB * 1024 * 1024
    if len(content) > max_bytes:
        raise ValueError(f"El archivo supera el tamaño máximo de {settings.MAX_FILE_SIZE_MB} MB.")

    with open(dest_path, "wb") as f:
        f.write(content)

    return str(dest_path)


def delete_file(path: str) -> None:
    try:
        os.remove(path)
    except FileNotFoundError:
        pass
