"""
PDF Report Generator — Bilingual Edition
Supports English and Tamil via translation keys and optional Tamil TTF font.

IMPORTANT:
- The report labels output as 'Model-Estimated Risk Score' — NOT a clinical probability.
- SHAP contributions are described as mathematical contributions, not medical causes.
- The report includes the standard disclaimer prominently.
"""

import os
import io
from datetime import datetime, timezone
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import cm
from reportlab.lib.colors import HexColor, black, white, grey
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle,
    HRFlowable, Image as RLImage
)
from reportlab.lib.enums import TA_CENTER, TA_LEFT, TA_JUSTIFY
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont

from utils.i18n import t

# ── Brand colours ────────────────────────────────────────────────────────────
BRAND_DARK   = HexColor("#1a1a2e")
BRAND_ACCENT = HexColor("#e94560")
BRAND_BLUE   = HexColor("#0f3460")
BRAND_LIGHT  = HexColor("#f5f5f5")
LOW_RISK_COLOR = HexColor("#2d6a4f")
MOD_RISK_COLOR = HexColor("#e9c46a")
HIGH_RISK_COLOR = HexColor("#e63946")

# ── Tamil font registration ───────────────────────────────────────────────────
_TAMIL_FONT_PATH = 'fonts/NotoSansTamil-Regular.ttf'
_TAMIL_FONT_NAME = 'NotoSansTamil'
_TAMIL_FONT_AVAILABLE = False

try:
    if os.path.exists(_TAMIL_FONT_PATH):
        pdfmetrics.registerFont(TTFont(_TAMIL_FONT_NAME, _TAMIL_FONT_PATH))
        _TAMIL_FONT_AVAILABLE = True
except Exception:
    _TAMIL_FONT_AVAILABLE = False


def tamil_font_available() -> bool:
    return _TAMIL_FONT_AVAILABLE


def _body_font(lang: str) -> str:
    if lang == 'ta' and _TAMIL_FONT_AVAILABLE:
        return _TAMIL_FONT_NAME
    return 'Helvetica'


def _bold_font(lang: str) -> str:
    # Tamil TTF registered is the regular weight — use it for bold too (no bold variant available)
    if lang == 'ta' and _TAMIL_FONT_AVAILABLE:
        return _TAMIL_FONT_NAME
    return 'Helvetica-Bold'


def _get_styles(lang: str = 'en'):
    base = getSampleStyleSheet()
    bf   = _bold_font(lang)
    nf   = _body_font(lang)
    styles = {
        'title': ParagraphStyle('title', parent=base['Title'],
            fontSize=22, textColor=BRAND_DARK, spaceAfter=6,
            fontName=bf, alignment=TA_CENTER),
        'subtitle': ParagraphStyle('subtitle', parent=base['Normal'],
            fontSize=11, textColor=BRAND_BLUE, spaceAfter=4,
            fontName=nf, alignment=TA_CENTER),
        'section': ParagraphStyle('section', parent=base['Heading2'],
            fontSize=13, textColor=BRAND_BLUE, spaceBefore=14, spaceAfter=4,
            fontName=bf),
        'body': ParagraphStyle('body', parent=base['Normal'],
            fontSize=9.5, textColor=black, spaceAfter=4,
            fontName=nf, leading=14, alignment=TA_JUSTIFY),
        'bullet': ParagraphStyle('bullet', parent=base['Normal'],
            fontSize=9, textColor=black, spaceAfter=3,
            fontName=nf, leftIndent=12, leading=13),
        'disclaimer': ParagraphStyle('disclaimer', parent=base['Normal'],
            fontSize=8, textColor=grey, spaceAfter=4,
            fontName=nf, leading=11, alignment=TA_JUSTIFY),
        'score_label': ParagraphStyle('score_label', parent=base['Normal'],
            fontSize=11, textColor=white, fontName=bf,
            alignment=TA_CENTER),
    }
    return styles


def generate_pdf_report(
    username: str,
    timestamp: datetime,
    risk_score: float,
    risk_category: str,
    input_summary: str,
    top_shap_features: dict,
    recommendations: list[str],
    shap_image_path: str | None = None,
    lang: str = 'en',
) -> bytes:
    """
    Generate a bilingual PDF report and return it as bytes.

    Args:
        username:           Logged-in user's name.
        timestamp:          Prediction timestamp.
        risk_score:         Model-estimated score (0-100).
        risk_category:      "Lower Risk" / "Moderate Risk" / "Higher Risk".
        input_summary:      Brief text description of inputs.
        top_shap_features:  dict of {feature: shap_value}.
        recommendations:    Pre-translated recommendation strings.
        shap_image_path:    Optional path to SHAP waterfall PNG.
        lang:               Language code ('en' or 'ta').

    Returns:
        PDF as bytes.
    """
    _t = lambda key: t(key, lang=lang)

    buffer = io.BytesIO()
    doc = SimpleDocTemplate(
        buffer, pagesize=A4,
        rightMargin=2*cm, leftMargin=2*cm,
        topMargin=2.5*cm, bottomMargin=2*cm
    )

    styles   = _get_styles(lang)
    elements = []

    # ── Header ──────────────────────────────────────────────────────────────
    elements.append(Paragraph(_t('pdf.report.title'), styles['title']))
    elements.append(Paragraph(_t('pdf.report.subtitle'), styles['subtitle']))
    elements.append(HRFlowable(width="100%", thickness=1.5, color=BRAND_ACCENT))
    elements.append(Spacer(1, 0.4*cm))

    # Meta table
    ts_str = timestamp.strftime("%Y-%m-%d %H:%M UTC") if timestamp else "N/A"
    meta_data = [
        [_t('pdf.meta.user'),      username],
        [_t('pdf.meta.generated'), ts_str],
        [_t('pdf.meta.input'),     input_summary],
    ]
    meta_table = Table(meta_data, colWidths=[4.5*cm, 12*cm])
    meta_table.setStyle(TableStyle([
        ('FONTNAME', (0, 0), (0, -1), _bold_font(lang)),
        ('FONTNAME', (1, 0), (1, -1), _body_font(lang)),
        ('FONTSIZE', (0, 0), (-1, -1), 9),
        ('TEXTCOLOR', (0, 0), (0, -1), BRAND_BLUE),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 4),
    ]))
    elements.append(meta_table)
    elements.append(Spacer(1, 0.5*cm))

    # ── Risk Score Banner ────────────────────────────────────────────────────
    elements.append(Paragraph(_t('pdf.score.title'), styles['section']))
    elements.append(Paragraph(_t('pdf.score.note'), styles['body']))

    banner_color = (
        LOW_RISK_COLOR  if "Lower"    in risk_category else
        MOD_RISK_COLOR  if "Moderate" in risk_category or "மிதமான" in risk_category else
        HIGH_RISK_COLOR
    )

    score_data = [[f"{risk_score:.1f}%  —  {risk_category}"]]
    score_table = Table(score_data, colWidths=[16.5*cm])
    score_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, -1), banner_color),
        ('TEXTCOLOR',  (0, 0), (-1, -1), white),
        ('FONTNAME',   (0, 0), (-1, -1), _bold_font(lang)),
        ('FONTSIZE',   (0, 0), (-1, -1), 18),
        ('ALIGN',      (0, 0), (-1, -1), 'CENTER'),
        ('TOPPADDING',    (0, 0), (-1, -1), 10),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 10),
    ]))
    elements.append(score_table)
    elements.append(Spacer(1, 0.5*cm))

    # ── Top SHAP Contributors ────────────────────────────────────────────────
    elements.append(Paragraph(_t('pdf.shap.title'), styles['section']))
    elements.append(Paragraph(_t('pdf.shap.note'), styles['body']))

    shap_rows = [[
        _t('pdf.shap.col.feature'),
        _t('pdf.shap.col.value'),
        _t('pdf.shap.col.direction')
    ]]
    for feat, val in sorted(top_shap_features.items(), key=lambda x: abs(x[1]), reverse=True)[:5]:
        dir_key = 'pdf.shap.direction.increased' if val > 0 else 'pdf.shap.direction.decreased'
        shap_rows.append([feat, f"{val:.4f}", _t(dir_key)])

    shap_table = Table(shap_rows, colWidths=[6*cm, 4*cm, 6.5*cm])
    shap_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), BRAND_BLUE),
        ('TEXTCOLOR',  (0, 0), (-1, 0), white),
        ('FONTNAME', (0, 0), (-1, 0),  _bold_font(lang)),
        ('FONTNAME', (0, 1), (-1, -1), _body_font(lang)),
        ('FONTSIZE', (0, 0), (-1, -1), 9),
        ('ROWBACKGROUNDS', (0, 1), (-1, -1), [BRAND_LIGHT, white]),
        ('GRID', (0, 0), (-1, -1), 0.5, grey),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 5),
        ('TOPPADDING',    (0, 0), (-1, -1), 5),
    ]))
    elements.append(shap_table)
    elements.append(Spacer(1, 0.4*cm))

    # ── SHAP Waterfall Image ─────────────────────────────────────────────────
    if shap_image_path and os.path.exists(shap_image_path):
        elements.append(Paragraph(_t('pdf.shap.img.title'), styles['section']))
        img = RLImage(shap_image_path, width=14*cm, height=8*cm)
        elements.append(img)
        elements.append(Spacer(1, 0.3*cm))

    # ── General Wellness Suggestions ─────────────────────────────────────────
    elements.append(HRFlowable(width="100%", thickness=0.8, color=BRAND_ACCENT))
    elements.append(Paragraph(_t('pdf.rec.title'), styles['section']))
    elements.append(Paragraph(_t('pdf.rec.note'), styles['body']))
    for i, rec in enumerate(recommendations, 1):
        elements.append(Paragraph(f"{i}. {rec}", styles['bullet']))
    elements.append(Spacer(1, 0.5*cm))

    # ── Disclaimer ────────────────────────────────────────────────────────────
    elements.append(HRFlowable(width="100%", thickness=1, color=BRAND_ACCENT))
    elements.append(Spacer(1, 0.2*cm))
    elements.append(Paragraph(_t('pdf.disclaimer.title'), styles['section']))
    elements.append(Paragraph(_t('pdf.disclaimer.text'), styles['disclaimer']))

    doc.build(elements)
    buffer.seek(0)
    return buffer.read()
