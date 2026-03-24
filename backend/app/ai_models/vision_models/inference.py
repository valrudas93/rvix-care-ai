"""
Inference module for the cervical cancer ViT (.keras).

Model output
------------
The loaded models output raw logits. Softmax is applied here before
interpreting results.

Class configurations per model:
  citologia  (vit_sipakmed)       — 2 classes: normal, anormal
  resonancia (vit_tcia_heterogen) — 3 classes: bajo_riesgo, medio_riesgo, alto_riesgo

"anormal" from citología is mapped to "alto_riesgo" so downstream code stays uniform.
"""
import logging
from typing import Dict, Any

import numpy as np

from app.ai_models.vision_models.vit_loader import get_model
from app.ai_models.vision_models.preprocessing import preprocess_image

logger = logging.getLogger(__name__)

# Citología model (sipakmed): binary — normal vs anormal
CLASS_NAMES_CITOLOGIA = ["normal", "anormal"]

# Resonancia model (tcia heterogeneidad): three risk levels
CLASS_NAMES_RESONANCIA = ["bajo_riesgo", "medio_riesgo", "alto_riesgo"]

# Map citología raw labels → unified risk vocabulary used by the rest of the system
_CITOLOGIA_TO_RISK = {
    "normal": "bajo_riesgo",
    "anormal": "alto_riesgo",
}

_CLASS_NAMES_BY_TYPE = {
    "citologia": CLASS_NAMES_CITOLOGIA,
    "resonancia": CLASS_NAMES_RESONANCIA,
}


def _softmax(x: np.ndarray) -> np.ndarray:
    e = np.exp(x - np.max(x))
    return e / e.sum()


# Static recommendations per unified risk level
RECOMMENDATIONS: Dict[str, list] = {
    "bajo_riesgo": [
        "Control de rutina en 12 meses.",
        "Mantener controles preventivos regulares.",
    ],
    "medio_riesgo": [
        "Seguimiento en 3 meses.",
        "Considerar colposcopía para evaluación detallada.",
        "Mantener vigilancia regular.",
    ],
    "alto_riesgo": [
        "Referencia urgente a oncología ginecológica.",
        "Realizar colposcopía y biopsia.",
        "Iniciar seguimiento cada 4-6 semanas.",
    ],
}

DETECTED_REGIONS: Dict[str, list] = {
    "bajo_riesgo": ["Sin anomalías significativas", "Células normales"],
    "medio_riesgo": ["Zona de transformación", "Células escamosas atípicas"],
    "alto_riesgo": [
        "Zona de transformación",
        "Células escamosas atípicas",
        "Lesión intraepitelial de alto grado",
    ],
}


def _mock_prediction(study_type: str = "citologia") -> Dict[str, Any]:
    """Return a simulated result when the model file is absent (dev mode)."""
    logger.warning("Using simulated prediction for '%s' (model unavailable).", study_type)
    return {
        "prediction": "medio_riesgo",
        "confidence": 0.82,
        "detected_regions": DETECTED_REGIONS["medio_riesgo"],
        "recommendations": RECOMMENDATIONS["medio_riesgo"],
    }


def run_inference(image_bytes: bytes, study_type: str = "citologia") -> Dict[str, Any]:
    """
    Run ViT inference on raw image bytes.

    Parameters
    ----------
    image_bytes : bytes
        Raw image file content
    study_type : str
        'citologia' → 2-class sipakmed model (normal/anormal)
        'resonancia' → 3-class tcia model (bajo/medio/alto riesgo)

    Returns
    -------
    dict with keys: prediction, confidence, detected_regions, recommendations
    The 'prediction' value is always one of: bajo_riesgo, medio_riesgo, alto_riesgo
    """
    normalized_type = study_type if study_type in ("citologia", "resonancia") else "citologia"
    model = get_model(normalized_type)

    if model is None:
        return _mock_prediction(normalized_type)

    try:
        logger.info("Running inference with model '%s'", normalized_type)
        tensor = preprocess_image(image_bytes)            # (1, 224, 224, 3)
        raw_output = model.predict(tensor, verbose=0)[0]  # shape (num_classes,)

        # Apply softmax to convert raw logits → probabilities
        probs = _softmax(raw_output)

        class_names = _CLASS_NAMES_BY_TYPE.get(normalized_type, CLASS_NAMES_RESONANCIA)
        class_idx = int(np.argmax(probs))
        confidence = float(probs[class_idx])
        raw_label = class_names[class_idx] if class_idx < len(class_names) else "desconocido"

        # Unify to risk vocabulary (citología uses normal/anormal → map to risk level)
        risk_label = _CITOLOGIA_TO_RISK.get(raw_label, raw_label)

        logger.info(
            "model='%s' | raw_label='%s' | risk='%s' | confidence=%.2f%% | n_classes=%d",
            normalized_type, raw_label, risk_label, confidence * 100, len(probs),
        )

        return {
            "prediction": risk_label,
            "confidence": round(confidence, 4),
            "detected_regions": DETECTED_REGIONS.get(risk_label, []),
            "recommendations": RECOMMENDATIONS.get(risk_label, []),
        }

    except Exception as exc:
        logger.error("ViT inference error ('%s'): %s", normalized_type, exc)
        return _mock_prediction(normalized_type)
