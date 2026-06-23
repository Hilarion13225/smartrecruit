import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { jobsAPI } from '../../api/jobs';
import toast from 'react-hot-toast';
import {
  ArrowLeft, Plus, X, Briefcase,
  Wrench, BarChart2, Save, GraduationCap, Clock, CheckCircle2,
} from 'lucide-react';

const EDUCATION_LEVELS = ['Bac', 'Bac+2', 'Bac+3', 'Bac+4', 'Bac+5', 'Doctorat', 'Non précisé'];

const css = `
  .jf-header {
    display: flex;
    align-items: center;
    gap: 16px;
    margin-bottom: 28px;
    flex-wrap: wrap;
  }
  .jf-back-btn {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 8px 14px;
    background: #fff;
    border: 1.5px solid #E2E8F0;
    border-radius: 10px;
    font-size: 13px;
    font-weight: 600;
    color: #64748B;
    cursor: pointer;
    transition: background 0.15s, color 0.15s;
    white-space: nowrap;
  }
  .jf-back-btn:hover { background: #F8FAFC; color: #1E2D45; }
  .jf-header-text {}
  .jf-title-label {
    font-size: 11px;
    font-weight: 700;
    color: #94A3B8;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    margin: 0 0 2px;
  }
  .jf-title {
    font-size: 22px;
    font-weight: 700;
    color: #1E2D45;
    margin: 0;
  }

  .jf-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 20px;
    margin-bottom: 20px;
  }
  .jf-column { display: flex; flex-direction: column; gap: 20px; }

  .jf-card {
    background: #fff;
    border-radius: 14px;
    border: 1px solid #F1F5F9;
    padding: 24px;
    display: flex;
    flex-direction: column;
    gap: 18px;
  }
  .jf-card-label {
    font-size: 11px;
    font-weight: 700;
    color: #94A3B8;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    display: flex;
    align-items: center;
    gap: 6px;
    margin: 0 0 -6px;
  }
  .jf-card-title {
    font-size: 16px;
    font-weight: 700;
    color: #1E2D45;
    margin: 0;
  }

  .jf-field { display: flex; flex-direction: column; gap: 6px; }
  .jf-label {
    font-size: 11px;
    font-weight: 700;
    color: #64748B;
    letter-spacing: 0.08em;
    text-transform: uppercase;
  }
  .jf-input-wrap {
    display: flex;
    align-items: center;
    border: 1.5px solid #E2E8F0;
    border-radius: 10px;
    background: #fff;
    padding: 0 14px;
    gap: 10px;
    transition: border-color 0.15s;
  }
  .jf-input-wrap:focus-within { border-color: #4F46E5; }
  .jf-input-wrap input,
  .jf-input-wrap select {
    flex: 1;
    border: none;
    outline: none;
    padding: 11px 0;
    font-size: 14px;
    color: #1E2D45;
    background: transparent;
  }
  .jf-input-wrap input::placeholder { color: #CBD5E1; }
  .jf-textarea {
    width: 100%;
    padding: 12px 14px;
    border: 1.5px solid #E2E8F0;
    border-radius: 10px;
    font-size: 14px;
    outline: none;
    resize: vertical;
    color: #1E2D45;
    font-family: inherit;
    transition: border-color 0.15s;
    box-sizing: border-box;
  }
  .jf-textarea:focus { border-color: #4F46E5; }
  .jf-textarea::placeholder { color: #CBD5E1; }
  .jf-row { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }

  /* Skills */
  .jf-skill-row { display: flex; gap: 8px; }
  .jf-skill-add-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 11px 14px;
    background: #1E2D45;
    color: #fff;
    border: none;
    border-radius: 10px;
    cursor: pointer;
    transition: background 0.15s;
    flex-shrink: 0;
  }
  .jf-skill-add-btn:hover { background: #2D4263; }
  .jf-hint { font-size: 12px; color: #94A3B8; margin: -10px 0 0; }
  .jf-skill-tags {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    min-height: 36px;
  }
  .jf-skill-tag {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 5px 10px 5px 14px;
    background: #EEF2FF;
    color: #4F46E5;
    border-radius: 20px;
    font-size: 12px;
    font-weight: 600;
  }
  .jf-skill-remove {
    display: flex;
    align-items: center;
    justify-content: center;
    background: none;
    border: none;
    color: #A5B4FC;
    cursor: pointer;
    padding: 0;
    transition: color 0.15s;
  }
  .jf-skill-remove:hover { color: #4F46E5; }
  .jf-no-skills { font-size: 13px; color: #CBD5E1; font-style: italic; }

  /* Recap */
  .jf-recap { display: flex; flex-direction: column; gap: 0; }
  .jf-recap-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 10px 0;
    border-bottom: 1px solid #F1F5F9;
    gap: 8px;
  }
  .jf-recap-item:last-child { border-bottom: none; }
  .jf-recap-label {
    font-size: 11px;
    font-weight: 700;
    color: #94A3B8;
    text-transform: uppercase;
    letter-spacing: 0.06em;
  }
  .jf-recap-value {
    font-size: 13px;
    font-weight: 600;
    color: #1E2D45;
    text-align: right;
    max-width: 60%;
    word-break: break-word;
  }

  /* Actions */
  .jf-actions {
    display: flex;
    justify-content: flex-end;
    gap: 12px;
  }
  .jf-cancel-btn {
    padding: 11px 22px;
    background: #fff;
    border: 1.5px solid #E2E8F0;
    border-radius: 10px;
    font-size: 13px;
    font-weight: 600;
    color: #64748B;
    cursor: pointer;
    transition: background 0.15s;
  }
  .jf-cancel-btn:hover { background: #F8FAFC; }
  .jf-submit-btn {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 11px 24px;
    background: #1E2D45;
    color: #fff;
    border: none;
    border-radius: 10px;
    font-size: 13px;
    font-weight: 700;
    letter-spacing: 0.02em;
    cursor: pointer;
    transition: background 0.15s;
  }
  .jf-submit-btn:hover:not(:disabled) { background: #2D4263; }
  .jf-submit-btn:disabled { opacity: 0.7; cursor: not-allowed; }

  @media (max-width: 900px) {
    .jf-grid { grid-template-columns: 1fr; }
  }
  @media (max-width: 640px) {
    .jf-row { grid-template-columns: 1fr; }
    .jf-title { font-size: 18px; }
    .jf-card { padding: 18px; }
    .jf-actions { flex-direction: column; }
    .jf-cancel-btn, .jf-submit-btn { width: 100%; justify-content: center; }
  }
`;

export default function JobForm() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [skillInput, setSkillInput] = useState('');
  const [form, setForm] = useState({
    title: '',
    description: '',
    required_skills: [],
    required_experience: 0,
    required_education: 'Bac+3',
    status: 'active',
  });

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const addSkill = () => {
    const skill = skillInput.trim();
    if (!skill) return;
    if (form.required_skills.includes(skill)) { toast.error('Compétence déjà ajoutée.'); return; }
    setForm({ ...form, required_skills: [...form.required_skills, skill] });
    setSkillInput('');
  };

  const removeSkill = (skill) =>
    setForm({ ...form, required_skills: form.required_skills.filter((s) => s !== skill) });

  const handleSkillKeyDown = (e) => {
    if (e.key === 'Enter') { e.preventDefault(); addSkill(); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.required_skills.length === 0) { toast.error('Ajoutez au moins une compétence.'); return; }
    setLoading(true);
    try {
      const res = await jobsAPI.create(form);
      toast.success('Offre créée avec succès !');
      navigate(`/jobs/${res.data.id}`);
    } catch {
      toast.error('Erreur lors de la création.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <style>{css}</style>

      {/* Header */}
      <div className="jf-header">
        <button className="jf-back-btn" onClick={() => navigate('/jobs')}>
          <ArrowLeft size={14} /> Retour
        </button>
        <div className="jf-header-text">
          <p className="jf-title-label">Recrutement</p>
          <h1 className="jf-title">Nouvelle offre d'emploi</h1>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="jf-grid">

          {/* Colonne gauche */}
          <div className="jf-column">
            <div className="jf-card">
              <p className="jf-card-label"><Briefcase size={12} /> Informations générales</p>

              <div className="jf-field">
                <label className="jf-label">Titre du poste *</label>
                <div className="jf-input-wrap">
                  <Briefcase size={15} color="#CBD5E1" />
                  <input
                    name="title"
                    value={form.title}
                    onChange={handleChange}
                    placeholder="Ex : Développeur Full Stack React/Node.js"
                    required
                  />
                </div>
              </div>

              <div className="jf-field">
                <label className="jf-label">Description du poste *</label>
                <textarea
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  placeholder="Décrivez le poste, les missions, le contexte..."
                  required
                  rows={6}
                  className="jf-textarea"
                />
              </div>

              <div className="jf-row">
                <div className="jf-field">
                  <label className="jf-label">Expérience requise</label>
                  <div className="jf-input-wrap">
                    <Clock size={15} color="#CBD5E1" />
                    <select name="required_experience" value={form.required_experience} onChange={handleChange}>
                      {[0,1,2,3,5,7,10].map((n) => (
                        <option key={n} value={n}>
                          {n === 0 ? 'Débutant accepté' : `${n} an(s) minimum`}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="jf-field">
                  <label className="jf-label">Niveau d'études</label>
                  <div className="jf-input-wrap">
                    <GraduationCap size={15} color="#CBD5E1" />
                    <select name="required_education" value={form.required_education} onChange={handleChange}>
                      {EDUCATION_LEVELS.map((l) => <option key={l} value={l}>{l}</option>)}
                    </select>
                  </div>
                </div>
              </div>

              <div className="jf-field">
                <label className="jf-label">Statut de l'offre</label>
                <div className="jf-input-wrap">
                  <CheckCircle2 size={15} color="#CBD5E1" />
                  <select name="status" value={form.status} onChange={handleChange}>
                    <option value="active">Active</option>
                    <option value="draft">Brouillon</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Colonne droite */}
          <div className="jf-column">
            <div className="jf-card">
              <p className="jf-card-label"><Wrench size={12} /> Compétences requises</p>
              <p className="jf-hint">Appuyez sur Entrée ou + pour ajouter une compétence</p>

              <div className="jf-skill-row">
                <div className="jf-input-wrap" style={{ flex: 1 }}>
                  <Plus size={15} color="#CBD5E1" />
                  <input
                    value={skillInput}
                    onChange={(e) => setSkillInput(e.target.value)}
                    onKeyDown={handleSkillKeyDown}
                    placeholder="Ex : Python, React, SQL..."
                  />
                </div>
                <button type="button" className="jf-skill-add-btn" onClick={addSkill}>
                  <Plus size={16} />
                </button>
              </div>

              <div className="jf-skill-tags">
                {form.required_skills.length === 0 ? (
                  <p className="jf-no-skills">Aucune compétence ajoutée pour l'instant</p>
                ) : (
                  form.required_skills.map((skill) => (
                    <span key={skill} className="jf-skill-tag">
                      {skill}
                      <button type="button" className="jf-skill-remove" onClick={() => removeSkill(skill)}>
                        <X size={12} />
                      </button>
                    </span>
                  ))
                )}
              </div>
            </div>

            {/* Récapitulatif */}
            <div className="jf-card">
              <p className="jf-card-label"><BarChart2 size={12} /> Récapitulatif</p>
              <div className="jf-recap">
                {[
                  { label: 'Poste',        value: form.title || '—' },
                  { label: 'Expérience',   value: form.required_experience === 0 ? 'Débutant accepté' : `${form.required_experience} an(s)` },
                  { label: 'Formation',    value: form.required_education },
                  { label: 'Statut',       value: form.status === 'active' ? 'Active' : 'Brouillon' },
                  { label: 'Compétences',  value: `${form.required_skills.length} ajoutée(s)` },
                ].map((item) => (
                  <div key={item.label} className="jf-recap-item">
                    <span className="jf-recap-label">{item.label}</span>
                    <span className="jf-recap-value">{item.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="jf-actions">
          <button type="button" className="jf-cancel-btn" onClick={() => navigate('/jobs')}>
            Annuler
          </button>
          <button type="submit" className="jf-submit-btn" disabled={loading}>
            <Save size={14} />
            {loading ? 'Création en cours...' : "Créer l'offre"}
          </button>
        </div>
      </form>
    </>
  );
}