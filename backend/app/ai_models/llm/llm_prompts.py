"""
Prompt templates for generating medical explanations.
Keep prompts here so they are easy to iterate without touching business logic.
"""
from typing import Any, Dict, List, Optional

_RISK_CONTEXT = {
    "bajo_riesgo": (
        "El modelo de citología clasificó las células como **normales** y el modelo de heterogeneidad "
        "tumoral indica **bajo riesgo**. No se observan cambios celulares sugestivos de lesión "
        "intraepitelial ni proceso neoplásico activo."
    ),
    "medio_riesgo": (
        "El sistema detectó **hallazgos atípicos de significado indeterminado** (ASC-US / LSIL). "
        "Existe evidencia de cambios celulares que requieren evaluación adicional. "
        "El nivel de heterogeneidad tumoral es moderado."
    ),
    "alto_riesgo": (
        "El sistema identificó **cambios celulares de alto grado** (HSIL / ASC-H) con heterogeneidad "
        "tumoral elevada. Los hallazgos son sugestivos de neoplasia intraepitelial cervical (NIC) "
        "de alto grado o carcinoma in situ. Se requiere intervención clínica urgente."
    ),
}


def build_explanation_prompt(
    prediction: str,
    confidence: float,
    detected_regions: Optional[List[str]] = None,
    recommendations: Optional[List[str]] = None,
    model1_findings: Optional[str] = None,
    model2_findings: Optional[str] = None,
    clinical_data: Optional[Dict[str, Any]] = None,
) -> str:

    risk_context = _RISK_CONTEXT.get(prediction, _RISK_CONTEXT["medio_riesgo"])

    regions_str = (
        ", ".join(detected_regions) if detected_regions else "No especificadas"
    )

    model_findings = ""
    if model1_findings:
        model_findings += f"\n  - Modelo 1 (Detección de lesiones tempranas): {model1_findings}"
    if model2_findings:
        model_findings += f"\n  - Modelo 2 (Heterogeneidad tumoral): {model2_findings}"

    clinical_section = ""
    if clinical_data:
        relevant = {k: v for k, v in clinical_data.items() if v}
        if relevant:
            clinical_section = "\n\n**Datos clínicos de la paciente:**\n" + "\n".join(
                f"  - {k}: {v}" for k, v in relevant.items()
            )

    return f"""Un sistema de doble modelo de Vision Transformer (ViT) analizó imágenes de citología cervical \
y resonancia magnética de una paciente. Los resultados son:

**Clasificación de riesgo:** {prediction.replace("_", " ").upper()}
**Confianza del sistema:** {round(confidence * 100, 1)}%
**Regiones afectadas identificadas:** {regions_str}
{model_findings}{clinical_section}

**Contexto clínico del resultado:**
{risk_context}

---

Genera un informe médico estructurado en **markdown** con las siguientes secciones exactas:

## Interpretación del Resultado

Explica en 3-4 oraciones qué significa esta clasificación en términos anatomopatológicos, qué cambios \
celulares son esperables según el nivel de riesgo detectado, y qué implica el nivel de confianza del {round(confidence * 100, 1)}%.

## Hallazgos Relevantes

Lista los hallazgos morfológicos o histológicos más importantes que justifican esta clasificación, \
correlacionando con las regiones afectadas reportadas: {regions_str}.

## Plan de Acción Clínica

Proporciona los pasos clínicos específicos y priorizados según urgencia para este nivel de riesgo. \
Incluye estudios complementarios, interconsultas y plazos de seguimiento concretos.

## Consideraciones Adicionales

Menciona factores de confusión, limitaciones del análisis automatizado y cualquier dato clínico \
relevante que pueda modificar la interpretación.

---
⚠️ *Este informe es un apoyo diagnóstico generado por IA. No reemplaza el juicio clínico del \
médico tratante ni el diagnóstico histopatológico definitivo.*
"""
