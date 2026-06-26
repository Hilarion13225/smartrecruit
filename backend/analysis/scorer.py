from sklearn.metrics.pairwise import cosine_similarity
from sklearn.feature_extraction.text import TfidfVectorizer
import re


def extract_skills_from_text(text, required_skills):
    """
    Détecte quelles compétences requises sont présentes dans le CV
    Utilise la correspondance exacte + TF-IDF (sans torch)
    """
    text_lower = text.lower()
    found_skills = []
    missing_skills = []

    for skill in required_skills:
        skill_lower = skill.lower()

        # Vérification directe
        if skill_lower in text_lower:
            found_skills.append(skill)
            continue

        # Vérification par mots-clés
        skill_words = skill_lower.split()
        if all(word in text_lower for word in skill_words):
            found_skills.append(skill)
            continue

        # Vérification sémantique légère avec TF-IDF
        sentences = [s.strip() for s in re.split(r'[.\n,;]', text_lower) if len(s.strip()) > 10][:50]

        if sentences:
            try:
                vectorizer = TfidfVectorizer()
                docs = [skill_lower] + sentences
                tfidf_matrix = vectorizer.fit_transform(docs)
                similarities = cosine_similarity(tfidf_matrix[0:1], tfidf_matrix[1:])[0]
                if similarities.max() > 0.3:
                    found_skills.append(skill)
                    continue
            except Exception:
                pass

        missing_skills.append(skill)

    return found_skills, missing_skills


def calculate_score_skills(found_skills, required_skills):
    """Score compétences : % de compétences trouvées"""
    if not required_skills:
        return 100.0
    return (len(found_skills) / len(required_skills)) * 100


def calculate_score_experience(cv_experience, required_experience):
    """Score expérience basé sur l'écart"""
    if required_experience == 0:
        return 100.0
    if cv_experience >= required_experience:
        return 100.0
    if cv_experience == 0:
        return 10.0
    ratio = cv_experience / required_experience
    return min(ratio * 100, 100.0)


def calculate_score_education(cv_education, required_education):
    """Score formation : compare les niveaux"""
    levels = {
        'Non précisé': 0,
        'Bac': 1,
        'Bac+2': 2,
        'Bac+3': 3,
        'Bac+4': 4,
        'Bac+5': 5,
        'Doctorat': 6,
    }
    cv_level = levels.get(cv_education, 0)
    req_level = levels.get(required_education, 0)

    if req_level == 0:
        return 100.0
    if cv_level >= req_level:
        return 100.0
    if cv_level == 0:
        return 20.0
    ratio = cv_level / req_level
    return min(ratio * 100, 100.0)


def calculate_score_semantic(cv_text, job_description):
    """
    Score sémantique : similarité CV / description du poste
    Utilise TF-IDF au lieu de sentence_transformers
    """
    if not cv_text or not job_description:
        return 50.0

    try:
        cv_short = cv_text[:2000]
        job_short = job_description[:1000]

        vectorizer = TfidfVectorizer()
        tfidf_matrix = vectorizer.fit_transform([cv_short, job_short])
        similarity = cosine_similarity(tfidf_matrix[0:1], tfidf_matrix[1:])[0][0]

        return float(similarity * 100)
    except Exception:
        return 50.0


def calculate_total_score(score_skills, score_experience, score_education, score_semantic):
    """
    Score final pondéré :
    - Compétences : 40%
    - Expérience  : 30%
    - Formation   : 15%
    - Sémantique  : 15%
    """
    return (
        score_skills * 0.40 +
        score_experience * 0.30 +
        score_education * 0.15 +
        score_semantic * 0.15
    )


def get_recommendation(score_total):
    """Recommandation basée sur le score total"""
    if score_total >= 75:
        return 'priority'
    elif score_total >= 55:
        return 'possible'
    elif score_total >= 35:
        return 'reserve'
    else:
        return 'rejected'


def generate_interview_questions(missing_skills, job_title):
    """Génère des questions d'entretien basées sur les lacunes"""
    questions = []

    for skill in missing_skills[:5]:
        questions.append(
            f"Avez-vous déjà travaillé avec {skill} ? "
            f"Pouvez-vous décrire votre niveau et expérience avec cet outil ?"
        )

    if missing_skills:
        questions.append(
            f"Pour le poste de {job_title}, certaines compétences semblent absentes "
            f"de votre CV. Comment envisagez-vous de les acquérir rapidement ?"
        )

    return questions