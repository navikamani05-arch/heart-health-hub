"""
Internationalization (i18n) utility.
Loads translation strings from JSON files in the translations/ directory.
Supports dynamic format arguments and graceful fallback to English.
"""

import json
import os

_cache: dict[str, dict] = {}

SUPPORTED_LANGUAGES = {
    'English': 'en',
    'தமிழ்': 'ta'
}


def _load(lang: str) -> dict:
    """Load and cache translations for a given language code."""
    if lang not in _cache:
        path = os.path.join('translations', f'{lang}.json')
        try:
            with open(path, 'r', encoding='utf-8') as f:
                _cache[lang] = json.load(f)
        except FileNotFoundError:
            _cache[lang] = {}
    return _cache[lang]


def t(key: str, lang: str = None, **kwargs) -> str:
    """
    Translate a key to the current session language.

    Args:
        key: Translation key (e.g. 'auth.title')
        lang: Optional language code override (e.g. 'en', 'ta').
              If None, reads from Streamlit session_state.lang.
        **kwargs: Format arguments for placeholder substitution.

    Returns:
        Translated string, or English fallback, or the key itself if missing.
    """
    # Resolve language
    if lang is None:
        try:
            import streamlit as st
            lang = st.session_state.get('lang', 'en')
        except Exception:
            lang = 'en'

    # Look up in target language first, then English, then return key
    text = _load(lang).get(key) or _load('en').get(key) or key

    # Apply format args
    if kwargs:
        try:
            text = text.format(**kwargs)
        except (KeyError, ValueError, IndexError):
            pass

    return text


def get_all_keys(lang: str = 'en') -> set[str]:
    """Return the set of all keys defined in the given language file."""
    return set(_load(lang).keys())


def clear_cache():
    """Clear the translation cache (useful in tests)."""
    _cache.clear()
