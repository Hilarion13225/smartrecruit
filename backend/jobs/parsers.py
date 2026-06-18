import json
import re
import docx
import io


def parse_json_job(file):
    """Parse une offre depuis un fichier JSON"""
    try:
        content = file.read()
        if isinstance(content, bytes):
            content = content.decode('utf-8')
        data = json.loads(content)

        return {
            'title': data.get('title', data.get('titre', '')),
            'description': data.get('description', ''),
            'required_skills': data.get('required_skills',
                data.get('competences', data.get('skills', []))),
            'required_experience': int(data.get('required_experience',
                data.get('experience', 0))),
            'required_education': data.get('required_education',
                data.get('formation', data.get('education', 'Bac+3'))),
            'status': data.get('status', 'active'),
        }
    except Exception as e:
        raise ValueError(f"Fichier JSON invalide : {e}")


def parse_txt_job(file):
    """Parse une offre depuis un fichier TXT"""
    try:
        content = file.read()
        if isinstance(content, bytes):
            content = content.decode('utf-8', errors='ignore')
        return extract_job_from_text(content)
    except Exception as e:
        raise ValueError(f"Fichier TXT invalide : {e}")


def parse_docx_job(file):
    """Parse une offre depuis un fichier Word (.docx)"""
    try:
        content = file.read()
        doc = docx.Document(io.BytesIO(content))
        text = '\n'.join([para.text for para in doc.paragraphs if para.text.strip()])
        return extract_job_from_text(text)
    except Exception as e:
        raise ValueError(f"Fichier Word invalide : {e}")


def extract_job_from_text(text):
    """
    Extrait les infos d'une offre depuis un texte libre.
    Utilise des patterns regex + heuristiques.
    """
    lines = [l.strip() for l in text.split('\n') if l.strip()]
    text_lower = text.lower()

    # ── Titre du poste ──
    title = extract_title(lines, text_lower)

    # ── Description ──
    description = extract_description(text, lines)

    # ── Compétences ──
    skills = extract_skills(text, text_lower)

    # ── Expérience ──
    experience = extract_experience(text_lower)

    # ── Formation ──
    education = extract_education(text_lower)

    return {
        'title': title,
        'description': description,
        'required_skills': skills,
        'required_experience': experience,
        'required_education': education,
        'status': 'active',
    }


def extract_title(lines, text_lower):
    """Extrait le titre du poste"""
    # Cherche des patterns courants
    title_patterns = [
        r'poste\s*[:\-]\s*(.+)',
        r'titre\s*[:\-]\s*(.+)',
        r'offre\s*[:\-]\s*(.+)',
        r'recrutons?\s+(?:un|une)\s+(.+)',
        r'recherchons?\s+(?:un|une)\s+(.+)',
        r'job\s*[:\-]\s*(.+)',
    ]
    for pattern in title_patterns:
        match = re.search(pattern, text_lower)
        if match:
            # Récupérer la ligne correspondante avec la casse d'origine
            start = match.start()
            end = match.end()
            return text_lower[start:end].split(':', 1)[-1].strip().title()

    # Sinon prendre la première ligne non vide comme titre
    for line in lines[:5]:
        if len(line.split()) >= 2 and len(line) < 100:
            return line.title()

    return 'Offre importée'


def extract_description(text, lines):
    """Extrait la description du poste"""
    desc_patterns = [
        r'description\s*[:\-]\s*([\s\S]+?)(?=compétences|skills|expérience|formation|profil|$)',
        r'missions?\s*[:\-]\s*([\s\S]+?)(?=compétences|skills|expérience|formation|profil|$)',
        r'contexte\s*[:\-]\s*([\s\S]+?)(?=compétences|skills|expérience|formation|profil|$)',
    ]
    for pattern in desc_patterns:
        match = re.search(pattern, text.lower())
        if match:
            desc = text[match.start(1):match.end(1)].strip()
            if len(desc) > 30:
                return desc[:2000]

    # Sinon prendre les 5 premières lignes
    return '\n'.join(lines[:5])


def extract_skills(text, text_lower):
    """Extrait les compétences requises"""
    skills = []

    # Cherche une section compétences
    skills_patterns = [
        r'compétences\s*(?:requises?)?\s*[:\-]\s*([\s\S]+?)(?=\n\n|\Z|expérience|formation)',
        r'skills?\s*[:\-]\s*([\s\S]+?)(?=\n\n|\Z|experience|education)',
        r'technologies?\s*[:\-]\s*([\s\S]+?)(?=\n\n|\Z)',
        r'outils?\s*[:\-]\s*([\s\S]+?)(?=\n\n|\Z)',
        r'stack\s*[:\-]\s*([\s\S]+?)(?=\n\n|\Z)',
    ]

    for pattern in skills_patterns:
        match = re.search(pattern, text_lower)
        if match:
            section = text[match.start(1):match.end(1)]
            # Extraire les éléments de liste (tirets, puces, virgules)
            items = re.split(r'[,\n\-•·*]', section)
            for item in items:
                item = item.strip()
                if 2 < len(item) < 50:
                    skills.append(item.title())
            if skills:
                break

    # Technologies courantes détectées dans le texte
    tech_keywords = [
        'Python', 'Django', 'FastAPI', 'Flask',
        'JavaScript', 'TypeScript', 'React', 'Vue', 'Angular',
        'Node.js', 'Express', 'Next.js',
        'Java', 'Spring', 'Kotlin',
        'PHP', 'Laravel', 'Symfony',
        'SQL', 'PostgreSQL', 'MySQL', 'MongoDB', 'Redis',
        'Docker', 'Kubernetes', 'AWS', 'Azure', 'GCP',
        'Git', 'Linux', 'CI/CD', 'Jenkins',
        'HTML', 'CSS', 'Tailwind', 'Bootstrap',
        'REST', 'GraphQL', 'API',
        'Machine Learning', 'Deep Learning', 'TensorFlow', 'PyTorch',
        'Excel', 'Power BI', 'Tableau',
        'Figma', 'Adobe', 'Photoshop',
    ]

    for tech in tech_keywords:
        if tech.lower() in text_lower and tech not in skills:
            skills.append(tech)

    return list(dict.fromkeys(skills))[:15]  # Max 15, sans doublons


def extract_experience(text_lower):
    """Extrait l'expérience requise en années"""
    patterns = [
        r'(\d+)\s*(?:ans?|années?)\s*d[\'e]expérience',
        r'expérience\s*(?:de|:)?\s*(\d+)\s*(?:ans?|années?)',
        r'(\d+)\s*years?\s*(?:of\s*)?experience',
        r'minimum\s*(\d+)\s*(?:ans?|années?)',
        r'au\s*moins\s*(\d+)\s*(?:ans?|années?)',
    ]
    for pattern in patterns:
        match = re.search(pattern, text_lower)
        if match:
            return min(int(match.group(1)), 20)
    return 0


def extract_education(text_lower):
    """Extrait le niveau d'études requis"""
    levels = [
        (['doctorat', 'phd', 'thèse'], 'Doctorat'),
        (['bac+5', 'bac +5', 'master', 'mba', 'ingénieur', 'grande école'], 'Bac+5'),
        (['bac+4', 'bac +4', 'licence pro', 'maîtrise'], 'Bac+4'),
        (['bac+3', 'bac +3', 'licence', 'bachelor'], 'Bac+3'),
        (['bac+2', 'bac +2', 'bts', 'dut', 'deug'], 'Bac+2'),
        (['bac', 'baccalauréat'], 'Bac'),
    ]
    for keywords, level in levels:
        if any(kw in text_lower for kw in keywords):
            return level
    return 'Bac+3'