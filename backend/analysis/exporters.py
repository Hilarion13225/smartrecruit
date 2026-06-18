import csv
import io
from reportlab.lib.pagesizes import A4
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer
from reportlab.lib.units import cm
from resumes.models import Resume


def export_csv(job):
    """Génère un fichier CSV des candidats classés"""
    output = io.StringIO()
    writer = csv.writer(output, delimiter=';')

    # En-têtes
    writer.writerow([
        'Rang', 'Nom', 'Email', 'Score Total',
        'Compétences', 'Expérience', 'Formation', 'Sémantique',
        'Recommandation', 'Compétences manquantes', 'Expérience (ans)',
    ])

    resumes = Resume.objects.filter(
        job=job, status='analyzed'
    ).select_related('analysis').order_by('-analysis__score_total')

    for rank, resume in enumerate(resumes, 1):
        a = resume.analysis
        writer.writerow([
            rank,
            resume.candidate_name,
            resume.candidate_email or '—',
            f"{a.score_total:.1f}",
            f"{a.score_skills:.1f}",
            f"{a.score_experience:.1f}",
            f"{a.score_education:.1f}",
            f"{a.score_semantic:.1f}",
            a.get_recommendation_display(),
            ', '.join(a.missing_skills) if a.missing_skills else 'Aucune',
            a.extracted_experience,
        ])

    return output.getvalue()


def export_pdf(job):
    """Génère un rapport PDF des candidats classés"""
    buffer = io.BytesIO()
    doc = SimpleDocTemplate(
        buffer, pagesize=A4,
        rightMargin=2*cm, leftMargin=2*cm,
        topMargin=2*cm, bottomMargin=2*cm
    )

    styles = getSampleStyleSheet()
    story = []

    # Titre
    title_style = ParagraphStyle(
        'CustomTitle',
        parent=styles['Title'],
        fontSize=18,
        textColor=colors.HexColor('#4F46E5'),
        spaceAfter=6,
    )
    story.append(Paragraph(f"Rapport de recrutement", title_style))
    story.append(Paragraph(f"Poste : {job.title}", styles['Heading2']))
    story.append(Spacer(1, 0.5*cm))

    # Infos poste
    info_style = ParagraphStyle(
        'Info', parent=styles['Normal'],
        fontSize=10, textColor=colors.HexColor('#6B7280')
    )
    story.append(Paragraph(
        f"Expérience requise : {job.required_experience} an(s) | "
        f"Formation : {job.required_education} | "
        f"Compétences : {', '.join(job.required_skills)}",
        info_style
    ))
    story.append(Spacer(1, 0.8*cm))

    # Tableau candidats
    resumes = Resume.objects.filter(
        job=job, status='analyzed'
    ).select_related('analysis').order_by('-analysis__score_total')

    if not resumes.exists():
        story.append(Paragraph("Aucun candidat analysé.", styles['Normal']))
    else:
        data = [[
            '#', 'Candidat', 'Score', 'Compétences',
            'Expérience', 'Formation', 'Recommandation'
        ]]

        rec_labels = {
            'priority': '⭐ Prioritaire',
            'possible': '✅ Possible',
            'reserve': '⚠️ Réserve',
            'rejected': '❌ Rejeté',
        }

        for rank, resume in enumerate(resumes, 1):
            a = resume.analysis
            data.append([
                str(rank),
                resume.candidate_name[:20],
                f"{a.score_total:.0f}/100",
                f"{a.score_skills:.0f}%",
                f"{a.score_experience:.0f}%",
                f"{a.score_education:.0f}%",
                rec_labels.get(a.recommendation, '—'),
            ])

        table = Table(data, colWidths=[
            1*cm, 4.5*cm, 2*cm, 2.5*cm, 2.5*cm, 2.5*cm, 3*cm
        ])

        # Style du tableau
        rec_colors = {
            'priority': colors.HexColor('#D1FAE5'),
            'possible': colors.HexColor('#DBEAFE'),
            'reserve': colors.HexColor('#FEF3C7'),
            'rejected': colors.HexColor('#FEE2E2'),
        }

        table_style = [
            ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#4F46E5')),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, 0), 9),
            ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
            ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
            ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, colors.HexColor('#F9FAFB')]),
            ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#E5E7EB')),
            ('FONTSIZE', (0, 1), (-1, -1), 8),
            ('ROWHEIGHT', (0, 0), (-1, -1), 0.7*cm),
        ]

        # Colorer les lignes selon recommandation
        for i, resume in enumerate(resumes, 1):
            bg = rec_colors.get(resume.analysis.recommendation, colors.white)
            table_style.append(('BACKGROUND', (6, i), (6, i), bg))

        table.setStyle(TableStyle(table_style))
        story.append(table)

    story.append(Spacer(1, 1*cm))
    story.append(Paragraph(
        "Rapport généré par SmartRecruit — IA de présélection de candidats",
        info_style
    ))

    doc.build(story)
    buffer.seek(0)
    return buffer