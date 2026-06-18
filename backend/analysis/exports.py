import csv
import io
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import cm
from reportlab.lib import colors
from reportlab.platypus import (
    SimpleDocTemplate, Table, TableStyle,
    Paragraph, Spacer
)


def export_csv(resumes):
    """Génère un fichier CSV de la shortlist"""
    output = io.StringIO()
    writer = csv.writer(output, delimiter=';')

    # En-têtes
    writer.writerow([
        'Rang', 'Nom', 'Email', 'Score Total',
        'Compétences (%)', 'Expérience (%)', 'Formation (%)',
        'Sémantique (%)', 'Expérience (ans)', 'Formation',
        'Compétences trouvées', 'Compétences manquantes',
        'Recommandation'
    ])

    for rank, resume in enumerate(resumes, 1):
        analysis = getattr(resume, 'analysis', None)
        writer.writerow([
            rank,
            resume.candidate_name,
            resume.candidate_email or '',
            f"{analysis.score_total:.1f}" if analysis else '',
            f"{analysis.score_skills:.1f}" if analysis else '',
            f"{analysis.score_experience:.1f}" if analysis else '',
            f"{analysis.score_education:.1f}" if analysis else '',
            f"{analysis.score_semantic:.1f}" if analysis else '',
            analysis.extracted_experience if analysis else '',
            analysis.extracted_education if analysis else '',
            ', '.join(analysis.extracted_skills) if analysis else '',
            ', '.join(analysis.missing_skills) if analysis else '',
            analysis.get_recommendation_display() if analysis else '',
        ])

    return output.getvalue()


def export_pdf(job, resumes):
    """Génère un rapport PDF de la shortlist"""
    buffer = io.BytesIO()

    doc = SimpleDocTemplate(
        buffer, pagesize=A4,
        rightMargin=2*cm, leftMargin=2*cm,
        topMargin=2*cm, bottomMargin=2*cm
    )

    styles = getSampleStyleSheet()
    elements = []

    # ── Titre ──
    title_style = ParagraphStyle(
        'Title',
        parent=styles['Heading1'],
        fontSize=20,
        textColor=colors.HexColor('#4F46E5'),
        spaceAfter=6,
    )
    elements.append(Paragraph("SmartRecruit — Rapport d'analyse", title_style))

    subtitle_style = ParagraphStyle(
        'Subtitle',
        parent=styles['Normal'],
        fontSize=12,
        textColor=colors.HexColor('#6B7280'),
        spaceAfter=20,
    )
    elements.append(Paragraph(f"Poste : {job.title}", subtitle_style))
    elements.append(Spacer(1, 0.5*cm))

    # ── Statistiques globales ──
    analyzed = [r for r in resumes if hasattr(r, 'analysis')]
    stats_data = [
        ['Total CV', 'Analysés', 'Prioritaires', 'Score moyen'],
        [
            str(len(resumes)),
            str(len(analyzed)),
            str(sum(1 for r in analyzed if r.analysis.recommendation == 'priority')),
            f"{sum(r.analysis.score_total for r in analyzed) / len(analyzed):.1f}%" if analyzed else '—'
        ]
    ]

    stats_table = Table(stats_data, colWidths=[4*cm]*4)
    stats_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#4F46E5')),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
        ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, 0), 11),
        ('FONTSIZE', (0, 1), (-1, 1), 14),
        ('FONTNAME', (0, 1), (-1, 1), 'Helvetica-Bold'),
        ('BACKGROUND', (0, 1), (-1, 1), colors.HexColor('#EEF2FF')),
        ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.HexColor('#EEF2FF')]),
        ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#E5E7EB')),
        ('ROUNDEDCORNERS', [4]),
        ('TOPPADDING', (0, 0), (-1, -1), 10),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 10),
    ]))
    elements.append(stats_table)
    elements.append(Spacer(1, 1*cm))

    # ── Tableau des candidats ──
    section_style = ParagraphStyle(
        'Section',
        parent=styles['Heading2'],
        fontSize=14,
        textColor=colors.HexColor('#1F2937'),
        spaceAfter=10,
    )
    elements.append(Paragraph("Classement des candidats", section_style))

    table_data = [['#', 'Nom', 'Score', 'Compétences', 'Expérience', 'Recommandation']]

    rec_colors = {
        'priority': colors.HexColor('#D1FAE5'),
        'possible': colors.HexColor('#DBEAFE'),
        'reserve': colors.HexColor('#FEF3C7'),
        'rejected': colors.HexColor('#FEE2E2'),
    }

    for rank, resume in enumerate(resumes, 1):
        analysis = getattr(resume, 'analysis', None)
        table_data.append([
            str(rank),
            resume.candidate_name,
            f"{analysis.score_total:.0f}/100" if analysis else '—',
            f"{analysis.score_skills:.0f}%" if analysis else '—',
            f"{analysis.extracted_experience} an(s)" if analysis else '—',
            analysis.get_recommendation_display() if analysis else '—',
        ])

    candidate_table = Table(
        table_data,
        colWidths=[1*cm, 5*cm, 2.5*cm, 3*cm, 2.5*cm, 3*cm]
    )

    table_style = [
        ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#1F2937')),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, -1), 9),
        ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
        ('ALIGN', (1, 0), (1, -1), 'LEFT'),
        ('GRID', (0, 0), (-1, -1), 0.3, colors.HexColor('#E5E7EB')),
        ('TOPPADDING', (0, 0), (-1, -1), 7),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 7),
        ('ROWBACKGROUNDS', (0, 1), (-1, -1),
         [colors.white, colors.HexColor('#F9FAFB')]),
    ]

    # Couleur par recommandation
    for i, resume in enumerate(resumes, 1):
        analysis = getattr(resume, 'analysis', None)
        if analysis:
            bg = rec_colors.get(analysis.recommendation, colors.white)
            table_style.append(('BACKGROUND', (5, i), (5, i), bg))

    candidate_table.setStyle(TableStyle(table_style))
    elements.append(candidate_table)
    elements.append(Spacer(1, 1*cm))

    # ── Questions d'entretien ──
    elements.append(Paragraph("Questions d'entretien suggérées", section_style))

    priority_resumes = [
        r for r in resumes
        if hasattr(r, 'analysis') and r.analysis.recommendation == 'priority'
    ]

    if priority_resumes:
        for resume in priority_resumes[:3]:
            name_style = ParagraphStyle(
                'Name',
                parent=styles['Normal'],
                fontSize=11,
                textColor=colors.HexColor('#4F46E5'),
                fontName='Helvetica-Bold',
                spaceAfter=4,
            )
            elements.append(Paragraph(f"► {resume.candidate_name}", name_style))

            q_style = ParagraphStyle(
                'Question',
                parent=styles['Normal'],
                fontSize=9,
                textColor=colors.HexColor('#374151'),
                leftIndent=10,
                spaceAfter=3,
            )
            for q in resume.analysis.interview_questions[:3]:
                elements.append(Paragraph(f"• {q}", q_style))
            elements.append(Spacer(1, 0.3*cm))
    else:
        elements.append(Paragraph(
            "Aucun candidat prioritaire pour l'instant.",
            styles['Normal']
        ))

    doc.build(elements)
    buffer.seek(0)
    return buffer