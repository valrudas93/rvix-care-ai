"""
LLM interface — pluggable backend.

Supported providers (set LLM_PROVIDER in .env):
  mock      → static response (default, no external calls)
  openai    → OpenAI chat completions API
  anthropic → Anthropic Claude API
  llama     → llama-cpp-python local model
  mistral   → Mistral AI API (same interface as OpenAI)

Add a new provider by implementing _call_<provider>(prompt) and registering it
in _PROVIDERS below.
"""
import logging
from typing import Any, Dict, Optional

from app.ai_models.llm.llm_prompts import build_explanation_prompt
from app.config.settings import settings

logger = logging.getLogger(__name__)


# ── Mock provider ─────────────────────────────────────────────────────────────

def _call_mock(prompt: str) -> str:
    return (
        "⚠️  Respuesta simulada — LLM no configurado.\n\n"
        "Para activar la explicación médica real configure LLM_PROVIDER en su archivo .env "
        "(opciones: openai, llama, mistral).\n\n"
        "Cuando el LLM esté integrado, este espacio mostrará una interpretación médica "
        "detallada del resultado del modelo ViT, incluyendo hallazgos, implicaciones clínicas "
        "y recomendaciones de seguimiento."
    )


# ── OpenAI provider ───────────────────────────────────────────────────────────

def _call_openai(prompt: str) -> str:
    try:
        from openai import OpenAI
        client = OpenAI(api_key=settings.OPENAI_API_KEY)
        response = client.chat.completions.create(
            model="gpt-4o",
            messages=[{"role": "user", "content": prompt}],
            temperature=0.3,
            max_tokens=800,
        )
        return response.choices[0].message.content or ""
    except Exception as exc:
        logger.error("OpenAI error: %s", exc)
        return _call_mock(prompt)


# ── Llama (llama-cpp-python local) ────────────────────────────────────────────

def _call_llama(prompt: str) -> str:
    try:
        from llama_cpp import Llama
        llm = Llama(model_path=settings.LLAMA_MODEL_PATH, n_ctx=2048, verbose=False)
        output = llm(prompt, max_tokens=800, temperature=0.3)
        return output["choices"][0]["text"]
    except Exception as exc:
        logger.error("Llama error: %s", exc)
        return _call_mock(prompt)


# ── Anthropic provider ────────────────────────────────────────────────────────

_ANTHROPIC_SYSTEM = (
    "Eres un asistente médico especializado en oncología ginecológica. "
    "Responde siempre en español con lenguaje técnico pero comprensible para un médico tratante. "
    "Sé conciso, estructurado y claro."
)

def _call_anthropic(prompt: str) -> str:
    try:
        import anthropic
        client = anthropic.Anthropic(api_key=settings.ANTHROPIC_API_KEY)
        response = client.messages.create(
            model="claude-opus-4-6",
            max_tokens=1024,
            system=_ANTHROPIC_SYSTEM,
            messages=[{"role": "user", "content": prompt}],
        )
        return response.content[0].text
    except Exception as exc:
        logger.error("Anthropic error: %s", exc)
        return _call_mock(prompt)


# ── Mistral provider ──────────────────────────────────────────────────────────

def _call_mistral(prompt: str) -> str:
    try:
        from mistralai.client import MistralClient
        from mistralai.models.chat_completion import ChatMessage
        client = MistralClient(api_key=settings.OPENAI_API_KEY)   # reuse key field
        response = client.chat(
            model="mistral-medium",
            messages=[ChatMessage(role="user", content=prompt)],
        )
        return response.choices[0].message.content or ""
    except Exception as exc:
        logger.error("Mistral error: %s", exc)
        return _call_mock(prompt)


# ── Registry ──────────────────────────────────────────────────────────────────

_PROVIDERS = {
    "mock": _call_mock,
    "openai": _call_openai,
    "anthropic": _call_anthropic,
    "llama": _call_llama,
    "mistral": _call_mistral,
}


# ── Public API ────────────────────────────────────────────────────────────────

def generate_medical_explanation(
    prediction: str,
    confidence: float,
    detected_regions: Optional[list] = None,
    recommendations: Optional[list] = None,
    model1_findings: Optional[str] = None,
    model2_findings: Optional[str] = None,
    clinical_data: Optional[Dict[str, Any]] = None,
) -> str:
    """Generate a medical explanation using the configured LLM provider."""
    prompt = build_explanation_prompt(
        prediction=prediction,
        confidence=confidence,
        detected_regions=detected_regions,
        recommendations=recommendations,
        model1_findings=model1_findings,
        model2_findings=model2_findings,
        clinical_data=clinical_data,
    )
    provider_fn = _PROVIDERS.get(settings.LLM_PROVIDER.lower(), _call_mock)
    logger.info("LLM provider: %s", settings.LLM_PROVIDER)
    return provider_fn(prompt)
