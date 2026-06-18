from django.utils import timezone
from .pdf_extractor import (
    extract_text_from_pdf,
    clean_text,
    extract_email,
    extract_experience_years,
    extract_education_level,
    extract_candidate_name,
)
from .scorer import (
    extract_skills_from_text,
    calculate_score_skills,
    calculate_score_experience,
    calculate_score_education,
    calculate_score_semantic,
    calculate_total_score,
    get_recommendation,
    generate_interview_questions,
)


def analyze_resume(resume_id):
    """
    Fonction principale d'analyse d'un CV
    Appelée depuis resumes/views.py
    """
    # Import ici pour éviter les imports circulaires
    from resumes.models import Resume
    from .models import Analysis

    try:
        resume = Resume.objects.get(id=resume_id)
        job = resume.job

        print(f"\n📄 Analyse de : {resume.candidate_name}")
        resume.status = 'analyzing'
        resume.save()

        # ── ÉTAPE 1 : Extraction du texte PDF ──
        file_path = resume.cv_file.path
        raw_text = extract_text_from_pdf(file_path)

        if not raw_text:
            raise ValueError("Impossible d'extraire le texte du PDF.")

        resume.raw_text = raw_text
        clean = clean_text(raw_text)

        # ── ÉTAPE 2 : Extraction des infos candidat ──
        email = extract_email(raw_text)
        if email and not resume.candidate_email:
            resume.candidate_email = email

        name = extract_candidate_name(raw_text)
        if name and resume.candidate_name.endswith('.pdf'):
            resume.candidate_name = name

        # ── ÉTAPE 3 : Extraction expérience et formation ──
        cv_experience = extract_experience_years(clean)
        cv_education = extract_education_level(clean)

        print(f"  ✅ Expérience détectée : {cv_experience} an(s)")
        print(f"  ✅ Formation détectée  : {cv_education}")

        # ── ÉTAPE 4 : Extraction des compétences ──
        required_skills = job.required_skills
        found_skills, missing_skills = extract_skills_from_text(clean, required_skills)

        print(f"  ✅ Compétences trouvées  : {found_skills}")
        print(f"  ❌ Compétences manquantes: {missing_skills}")

        # ── ÉTAPE 5 : Calcul des scores ──
        score_skills = calculate_score_skills(found_skills, required_skills)
        score_experience = calculate_score_experience(cv_experience, job.required_experience)
        score_education = calculate_score_education(cv_education, job.required_education)
        score_semantic = calculate_score_semantic(clean, job.description)
        score_total = calculate_total_score(
            score_skills, score_experience,
            score_education, score_semantic
        )

        print(f"  📊 Scores — Compétences: {score_skills:.1f} | "
              f"Expérience: {score_experience:.1f} | "
              f"Formation: {score_education:.1f} | "
              f"Sémantique: {score_semantic:.1f}")
        print(f"  🏆 Score total : {score_total:.1f}/100")

        # ── ÉTAPE 6 : Recommandation + questions ──
        recommendation = get_recommendation(score_total)
        questions = generate_interview_questions(missing_skills, job.title)

        # ── ÉTAPE 7 : Sauvegarde en base ──
        Analysis.objects.update_or_create(
            resume=resume,
            defaults={
                'score_total': round(score_total, 2),
                'score_skills': round(score_skills, 2),
                'score_experience': round(score_experience, 2),
                'score_education': round(score_education, 2),
                'score_semantic': round(score_semantic, 2),
                'extracted_skills': found_skills,
                'missing_skills': missing_skills,
                'extracted_experience': cv_experience,
                'extracted_education': cv_education,
                'recommendation': recommendation,
                'interview_questions': questions,
            }
        )

        resume.status = 'analyzed'
        resume.analyzed_at = timezone.now()
        resume.save()

        print(f"  ✅ Analyse terminée — {recommendation.upper()}\n")

    except Exception as e:
        print(f"  ❌ Erreur analyse CV {resume_id} : {e}")
        try:
            resume.status = 'error'
            resume.save()
        except Exception:
            pass