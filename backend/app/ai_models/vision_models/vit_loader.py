"""
Loads both .keras models (citology and MRI) and exposes them.

Usage
-----
    from app.ai_models.vision_models.vit_loader import get_model
    model = get_model('citologia')   # returns tf.keras.Model or None
    model = get_model('resonancia')  # returns tf.keras.Model or None
"""
import logging
from pathlib import Path
from typing import Optional, Literal

# Import custom layers BEFORE loading models
import app.ai_models.vision_models.custom_layers  # noqa: F401
from app.ai_models.vision_models.custom_layers import (
    PatchEmbedding,
    PositionalEncoding,
)

logger = logging.getLogger(__name__)

_models = {}  # {'citologia': model, 'resonancia': model}

def _get_model_paths() -> dict[str, Path]:
    """Resolve model paths from settings/.env with sensible defaults."""
    from app.config.settings import settings

    citology_path = Path(settings.VIT_MODEL_PATH)
    mri_path = Path(getattr(settings, "VIT_MODEL_PATH2", "app/ai_models/vision_models/vit_tcia_heterogeneidad_final.keras"))
    return {
        "citologia": citology_path,
        "resonancia": mri_path,
    }


def get_model(study_type: Literal["citologia", "resonancia"] = "citologia"):
    """
    Return the loaded Keras model for the specified study type.
    Loads it on first call and caches it.
    """
    global _models
    
    # Normalize study type
    if study_type not in ["citologia", "resonancia"]:
        logger.warning("Tipo de estudio '%s' no reconocido, usando 'citologia'", study_type)
        study_type = "citologia"
    
    # Return cached model if available
    if study_type in _models:
        return _models[study_type]

    model_paths = _get_model_paths()
    model_path = model_paths[study_type]
    if not model_path.exists():
        logger.warning(
            "Modelo ViT para '%s' no encontrado en '%s'. "
            "El sistema devolverá predicciones simuladas.",
            study_type,
            model_path,
        )
        _models[study_type] = None
        return None

    try:
        import tensorflow as tf  # lazy import so the app starts without TF if needed

        logger.info("Loading Keras model '%s' from %s", study_type, model_path)
        model = tf.keras.models.load_model(
            str(model_path),
            custom_objects={
                "PatchEmbedding": PatchEmbedding,
                "PositionalEncoding": PositionalEncoding,
            },
            compile=False,
        )
        logger.info("Model '%s' loaded successfully.", study_type)
        _models[study_type] = model
        return model
    except Exception as exc:
        logger.error("Error loading model '%s': %s", study_type, exc)
        _models[study_type] = None
        return None
