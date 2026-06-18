import pdfplumber
import re

def extract_text_from_pdf(file_path):
    """Extrait le texte brut d'un fichier PDF"""
    text = ""
    try:
        with pdfplumber.open(file_path) as pdf:
            for page in pdf.pages:
                page_text = page.extract_text()
                if page_text:
                    text += page_text + "\n"
    except Exception as e:
        print(f"Erreur extraction PDF : {e}")
        return ""
    return text.strip()


def clean_text(text):
    """Nettoie le texte extrait"""
    # Supprimer les caractères spéciaux inutiles
    text = re.sub(r'[^\w\s\-\+\.\,\@]', ' ', text)
    # Supprimer les espaces multiples
    text = re.sub(r'\s+', ' ', text)
    return text.strip().lower()


def extract_email(text):
    """Extrait l'email du CV"""
    pattern = r'[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}'
    match = re.search(pattern, text)
    return match.group(0) if match else None


def extract_candidate_name(text):
    """Tente d'extraire le nom du candidat (première ligne non vide)"""
    lines = [l.strip() for l in text.split('\n') if l.strip()]
    for line in lines[:5]:
        # Si la ligne ressemble à un nom (2-4 mots, pas d'email)
        words = line.split()
        if 2 <= len(words) <= 4 and '@' not in line:
            return line.title()
    return None


def extract_experience_years(text):
    """Extrait le nombre d'années d'expérience"""
    patterns = [
        r'(\d+)\s*ans?\s*d[\'e]expérience',
        r'(\d+)\s*années?\s*d[\'e]expérience',
        r'expérience\s*[:\-]?\s*(\d+)\s*ans?',
        r'(\d+)\s*years?\s*of\s*experience',
    ]
    text_lower = text.lower()
    for pattern in patterns:
        match = re.search(pattern, text_lower)
        if match:
            return int(match.group(1))

    # Compter les expériences par dates (ex: 2019-2022)
    date_ranges = re.findall(r'(20\d{2}|19\d{2})\s*[-–]\s*(20\d{2}|19\d{2}|présent|present|actuel)', text_lower)
    if date_ranges:
        return min(len(date_ranges) * 2, 15)  # Estimation

    return 0


def extract_education_level(text):
    """Extrait le niveau d'études"""
    text_lower = text.lower()
    levels = [
        (['doctorat', 'phd', 'thèse'], 'Doctorat'),
        (['master', 'bac+5', 'bac +5', 'mba', 'ingénieur'], 'Bac+5'),
        (['bac+4', 'bac +4', 'licence pro', 'mstc'], 'Bac+4'),
        (['licence', 'bachelor', 'bac+3', 'bac +3'], 'Bac+3'),
        (['bts', 'dut', 'bac+2', 'bac +2', 'deug'], 'Bac+2'),
        (['bac', 'baccalauréat', 'terminale'], 'Bac'),
    ]
    for keywords, level in levels:
        if any(kw in text_lower for kw in keywords):
            return level
    return 'Non précisé'