"""
FunnelX — Ishu AI Document & PDF Generator
Uses ReportLab to generate clean, professionally styled B2B Business Plans, Budget Breakdowns,
Roadmaps, and Execution Strategy documents.
"""

import os
import io
from datetime import datetime
from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.lib.units import inch
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, HRFlowable, KeepTogether
)

def create_document_pdf(doc_data, output_filepath):
    """
    Renders a formatted PDF document using ReportLab.
    
    doc_data format:
    {
        "title": "...",
        "subtitle": "...",
        "doc_type": "...", # e.g. "Budget Plan", "Roadmap", "Business Plan"
        "prepared_for": "...",
        "date": "...",
        "sections": [
            {
                "heading": "1. Section Heading",
                "content": "...",
                "key_takeaway": "..."
            },
            ...
        ],
        "metrics_table": [ # or "financial_table"
            ["Column 1", "Column 2", "Column 3"],
            ["Row 1 Col 1", "Row 1 Col 2", "Row 1 Col 3"],
            ...
        ]
    }
    """
    os.makedirs(os.path.dirname(os.path.abspath(output_filepath)), exist_ok=True)
    doc = SimpleDocTemplate(
        output_filepath,
        pagesize=letter,
        leftMargin=0.6 * inch,
        rightMargin=0.6 * inch,
        topMargin=0.6 * inch,
        bottomMargin=0.6 * inch
    )

    styles = getSampleStyleSheet()
    
    # Custom Brand Palette
    PRIMARY = colors.HexColor('#0a0a0f')     # Deep Obsidian Black
    ACCENT = colors.HexColor('#00cc55')      # Neon/Emerald Green Accent
    ACCENT_LIGHT = colors.HexColor('#e6fbf1') # Soft Green Tint
    TEXT_DARK = colors.HexColor('#1e293b')   # Slate 800
    TEXT_MUTED = colors.HexColor('#64748b')  # Slate 500
    BORDER_COLOR = colors.HexColor('#cbd5e1')# Slate 300

    # Custom Paragraph Styles
    title_style = ParagraphStyle(
        'DocTitle',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=22,
        leading=26,
        textColor=PRIMARY,
        spaceAfter=4
    )

    subtitle_style = ParagraphStyle(
        'DocSubtitle',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=11,
        leading=15,
        textColor=TEXT_MUTED,
        spaceAfter=12
    )

    heading_style = ParagraphStyle(
        'SectionHeading',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=12,
        leading=16,
        textColor=PRIMARY,
        spaceBefore=12,
        spaceAfter=5,
        keepWithNext=True
    )

    body_style = ParagraphStyle(
        'BodyDark',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=9,
        leading=13.5,
        textColor=TEXT_DARK,
        spaceAfter=5
    )

    takeaway_style = ParagraphStyle(
        'TakeawayText',
        parent=styles['Normal'],
        fontName='Helvetica-Oblique',
        fontSize=8.5,
        leading=12,
        textColor=colors.HexColor('#065f46')
    )

    table_header_style = ParagraphStyle(
        'TableHeader',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=8.5,
        leading=11,
        textColor=colors.white
    )

    table_cell_style = ParagraphStyle(
        'TableCell',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=8,
        leading=10.5,
        textColor=TEXT_DARK
    )

    story = []

    # ── HEADER BANNER ──────────────────────────────
    doc_type_tag = doc_data.get("doc_type", "EXECUTIVE ADVISORY").upper()
    banner_data = [
        [
            Paragraph(f"<b>FUNNELX // ISHU AI ADVISORY &bull; {doc_type_tag}</b>", ParagraphStyle('H1', fontName='Helvetica-Bold', fontSize=9.5, textColor=ACCENT)),
            Paragraph(f"DATE: {doc_data.get('date', datetime.now().strftime('%B %d, %Y'))}", ParagraphStyle('H2', fontName='Helvetica', fontSize=8, textColor=TEXT_MUTED, alignment=2))
        ]
    ]
    banner_table = Table(banner_data, colWidths=[4.4 * inch, 2.4 * inch])
    banner_table.setStyle(TableStyle([
        ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
        ('BOTTOMPADDING', (0,0), (-1,-1), 0),
        ('TOPPADDING', (0,0), (-1,-1), 0),
    ]))
    story.append(banner_table)
    story.append(HRFlowable(width="100%", thickness=1.5, color=ACCENT, spaceBefore=4, spaceAfter=12))

    # ── DOCUMENT TITLE ─────────────────────────────
    title_text = doc_data.get("title", "Strategic Execution & Growth Document")
    subtitle_text = doc_data.get("subtitle", "Autonomous Pipeline & Strategic Framework")
    story.append(Paragraph(title_text, title_style))
    story.append(Paragraph(subtitle_text, subtitle_style))
    story.append(Spacer(1, 6))

    # ── PLAN SECTIONS ──────────────────────────────
    sections = doc_data.get("sections", [])
    for sec in sections:
        sec_flowables = []
        heading = sec.get("heading", "")
        content = sec.get("content", "")
        takeaway = sec.get("key_takeaway", "")

        sec_flowables.append(Paragraph(heading, heading_style))
        sec_flowables.append(HRFlowable(width="100%", thickness=0.8, color=BORDER_COLOR, spaceBefore=2, spaceAfter=5))
        sec_flowables.append(Paragraph(content, body_style))

        if takeaway:
            box_data = [[
                Paragraph(f"<b>KEY STRATEGIC TAKEAWAY:</b> {takeaway}", takeaway_style)
            ]]
            box_table = Table(box_data, colWidths=[6.8 * inch])
            box_table.setStyle(TableStyle([
                ('BACKGROUND', (0,0), (-1,-1), ACCENT_LIGHT),
                ('BOX', (0,0), (-1,-1), 1, ACCENT),
                ('TOPPADDING', (0,0), (-1,-1), 5),
                ('BOTTOMPADDING', (0,0), (-1,-1), 5),
                ('LEFTPADDING', (0,0), (-1,-1), 8),
                ('RIGHTPADDING', (0,0), (-1,-1), 8),
            ]))
            sec_flowables.append(Spacer(1, 3))
            sec_flowables.append(box_table)

        sec_flowables.append(Spacer(1, 6))
        story.append(KeepTogether(sec_flowables))

    # ── METRICS / BREAKDOWN / FINANCIAL TABLE ───────
    fin_data = doc_data.get("metrics_table") or doc_data.get("financial_table")
    if fin_data and isinstance(fin_data, list) and len(fin_data) > 1:
        table_title = doc_data.get("table_title") or (
            "Budget Allocation & Resource Breakdown" if "budget" in title_text.lower() or "budget" in str(doc_data).lower()
            else "Strategic Milestones & Execution Matrix"
        )
        table_flowables = [
            Paragraph(table_title, heading_style),
            HRFlowable(width="100%", thickness=0.8, color=BORDER_COLOR, spaceBefore=2, spaceAfter=6)
        ]

        formatted_rows = []
        col_count = len(fin_data[0])
        # Header row
        formatted_rows.append([Paragraph(str(cell), table_header_style) for cell in fin_data[0]])
        # Data rows
        for row in fin_data[1:]:
            # Ensure row matches col_count
            row_cells = list(row)
            while len(row_cells) < col_count:
                row_cells.append("")
            formatted_rows.append([Paragraph(str(cell), table_cell_style) for cell in row_cells[:col_count]])

        col_w = (6.8 * inch) / max(col_count, 1)
        fin_table = Table(formatted_rows, colWidths=[col_w] * col_count)
        fin_table.setStyle(TableStyle([
            ('BACKGROUND', (0,0), (-1,0), PRIMARY),
            ('ALIGN', (0,0), (-1,-1), 'LEFT'),
            ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
            ('GRID', (0,0), (-1,-1), 0.5, BORDER_COLOR),
            ('ROWBACKGROUNDS', (0,1), (-1,-1), [colors.white, colors.HexColor('#f8fafc')]),
            ('TOPPADDING', (0,0), (-1,-1), 4),
            ('BOTTOMPADDING', (0,0), (-1,-1), 4),
            ('LEFTPADDING', (0,0), (-1,-1), 5),
            ('RIGHTPADDING', (0,0), (-1,-1), 5),
        ]))
        table_flowables.append(fin_table)
        table_flowables.append(Spacer(1, 12))
        story.append(KeepTogether(table_flowables))

    # ── FOOTER SIGN-OFF ────────────────────────────
    footer_flowables = [
        HRFlowable(width="100%", thickness=1.0, color=ACCENT, spaceBefore=8, spaceAfter=6),
        Paragraph(
            "<b>Generated autonomously by FunnelX Ishu AI Advisory Engine</b> &bull; Confidential &bull; Designed for high-velocity scale.",
            ParagraphStyle('Foot', fontName='Helvetica', fontSize=7.5, leading=9, textColor=TEXT_MUTED, alignment=1)
        )
    ]
    story.append(KeepTogether(footer_flowables))

    # Build PDF
    doc.build(story)
    return output_filepath

# Backwards compatibility alias
create_business_plan_pdf = create_document_pdf
