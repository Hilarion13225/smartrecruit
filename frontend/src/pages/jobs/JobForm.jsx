import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { jobsAPI } from '../../api/jobs';
import toast from 'react-hot-toast';

const EDUCATION_LEVELS = [
  'Bac', 'Bac+2', 'Bac+3', 'Bac+4', 'Bac+5', 'Doctorat', 'Non précisé'
];

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

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const addSkill = () => {
    const skill = skillInput.trim();
    if (!skill) return;
    if (form.required_skills.includes(skill)) {
      toast.error('Cette compétence est déjà ajoutée.');
      return;
    }
    setForm({ ...form, required_skills: [...form.required_skills, skill] });
    setSkillInput('');
  };

  const removeSkill = (skill) => {
    setForm({
      ...form,
      required_skills: form.required_skills.filter((s) => s !== skill),
    });
  };

  const handleSkillKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addSkill();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.required_skills.length === 0) {
      toast.error('Ajoutez au moins une compétence requise.');
      return;
    }
    setLoading(true);
    try {
      const res = await jobsAPI.create(form);
      toast.success('Offre créée avec succès !');
      navigate(`/jobs/${res.data.id}`);
    } catch (err) {
      toast.error('Erreur lors de la création.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      {/* Header */}
      <div style={styles.header}>
        <button onClick={() => navigate('/jobs')} style={styles.backBtn}>
          ← Retour
        </button>
        <h1 style={styles.title}>Nouvelle offre d'emploi</h1>
      </div>

      <form onSubmit={handleSubmit} style={styles.form}>
        <div style={styles.grid}>

          {/* Colonne gauche */}
          <div style={styles.column}>
            <div style={styles.card}>
              <h2 style={styles.cardTitle}>📋 Informations générales</h2>

              <div style={styles.field}>
                <label style={styles.label}>Titre du poste *</label>
                <input
                  name="title"
                  value={form.title}
                  onChange={handleChange}
                  placeholder="Ex: Développeur Full Stack React/Node.js"
                  required
                  style={styles.input}
                />
              </div>

              <div style={styles.field}>
                <label style={styles.label}>Description du poste *</label>
                <textarea
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  placeholder="Décrivez le poste, les missions, le contexte..."
                  required
                  rows={6}
                  style={styles.textarea}
                />
              </div>

              <div style={styles.row}>
                <div style={styles.field}>
                  <label style={styles.label}>Expérience requise</label>
                  <select
                    name="required_experience"
                    value={form.required_experience}
                    onChange={handleChange}
                    style={styles.select}
                  >
                    {[0,1,2,3,5,7,10].map((n) => (
                      <option key={n} value={n}>
                        {n === 0 ? 'Débutant accepté' : `${n} an(s) minimum`}
                      </option>
                    ))}
                  </select>
                </div>

                <div style={styles.field}>
                  <label style={styles.label}>Niveau d'études</label>
                  <select
                    name="required_education"
                    value={form.required_education}
                    onChange={handleChange}
                    style={styles.select}
                  >
                    {EDUCATION_LEVELS.map((level) => (
                      <option key={level} value={level}>{level}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div style={styles.field}>
                <label style={styles.label}>Statut de l'offre</label>
                <select
                  name="status"
                  value={form.status}
                  onChange={handleChange}
                  style={styles.select}
                >
                  <option value="active">Active</option>
                  <option value="draft">Brouillon</option>
                </select>
              </div>
            </div>
          </div>

          {/* Colonne droite */}
          <div style={styles.column}>
            <div style={styles.card}>
              <h2 style={styles.cardTitle}>🛠️ Compétences requises</h2>
              <p style={styles.hint}>
                Appuyez sur Entrée ou cliquez sur + pour ajouter une compétence
              </p>

              <div style={styles.skillInputRow}>
                <input
                  value={skillInput}
                  onChange={(e) => setSkillInput(e.target.value)}
                  onKeyDown={handleSkillKeyDown}
                  placeholder="Ex: Python, React, SQL..."
                  style={{ ...styles.input, flex: 1 }}
                />
                <button
                  type="button"
                  onClick={addSkill}
                  style={styles.addSkillBtn}
                >
                  +
                </button>
              </div>

              {/* Tags compétences */}
              <div style={styles.skillTags}>
                {form.required_skills.length === 0 ? (
                  <p style={styles.noSkills}>
                    Aucune compétence ajoutée pour l'instant
                  </p>
                ) : (
                  form.required_skills.map((skill) => (
                    <span key={skill} style={styles.skillTag}>
                      {skill}
                      <button
                        type="button"
                        onClick={() => removeSkill(skill)}
                        style={styles.removeSkill}
                      >
                        ×
                      </button>
                    </span>
                  ))
                )}
              </div>
            </div>

            {/* Récapitulatif */}
            <div style={styles.card}>
              <h2 style={styles.cardTitle}>📊 Récapitulatif</h2>
              <div style={styles.recap}>
                <div style={styles.recapItem}>
                  <span style={styles.recapLabel}>Poste</span>
                  <span style={styles.recapValue}>
                    {form.title || '—'}
                  </span>
                </div>
                <div style={styles.recapItem}>
                  <span style={styles.recapLabel}>Expérience</span>
                  <span style={styles.recapValue}>
                    {form.required_experience === 0
                      ? 'Débutant accepté'
                      : `${form.required_experience} an(s)`}
                  </span>
                </div>
                <div style={styles.recapItem}>
                  <span style={styles.recapLabel}>Formation</span>
                  <span style={styles.recapValue}>{form.required_education}</span>
                </div>
                <div style={styles.recapItem}>
                  <span style={styles.recapLabel}>Compétences</span>
                  <span style={styles.recapValue}>
                    {form.required_skills.length} ajoutée(s)
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Boutons */}
        <div style={styles.formActions}>
          <button
            type="button"
            onClick={() => navigate('/jobs')}
            style={styles.cancelBtn}
          >
            Annuler
          </button>
          <button
            type="submit"
            disabled={loading}
            style={{ ...styles.submitBtn, opacity: loading ? 0.7 : 1 }}
          >
            {loading ? 'Création en cours...' : '✅ Créer l\'offre'}
          </button>
        </div>
      </form>
    </div>
  );
}

const styles = {
  header: { display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '28px' },
  backBtn: {
    padding: '8px 14px', background: '#F3F4F6',
    border: 'none', borderRadius: '8px',
    fontSize: '14px', cursor: 'pointer', color: '#374151',
  },
  title: { fontSize: '22px', fontWeight: '700', color: '#1F2937' },
  form: { display: 'flex', flexDirection: 'column', gap: '24px' },
  grid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' },
  column: { display: 'flex', flexDirection: 'column', gap: '20px' },
  card: {
    background: '#fff', borderRadius: '12px',
    padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
    display: 'flex', flexDirection: 'column', gap: '16px',
  },
  cardTitle: { fontSize: '16px', fontWeight: '700', color: '#1F2937' },
  field: { display: 'flex', flexDirection: 'column', gap: '6px' },
  label: { fontSize: '13px', fontWeight: '600', color: '#374151' },
  input: {
    padding: '10px 12px', border: '1.5px solid #E5E7EB',
    borderRadius: '8px', fontSize: '14px', outline: 'none',
    color: '#1F2937',
  },
  textarea: {
    padding: '10px 12px', border: '1.5px solid #E5E7EB',
    borderRadius: '8px', fontSize: '14px', outline: 'none',
    resize: 'vertical', color: '#1F2937', fontFamily: 'inherit',
  },
  select: {
    padding: '10px 12px', border: '1.5px solid #E5E7EB',
    borderRadius: '8px', fontSize: '14px', outline: 'none',
    background: '#fff', color: '#1F2937',
  },
  row: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' },
  hint: { fontSize: '12px', color: '#9CA3AF', marginTop: '-8px' },
  skillInputRow: { display: 'flex', gap: '8px' },
  addSkillBtn: {
    padding: '10px 16px', background: '#4F46E5',
    color: '#fff', border: 'none', borderRadius: '8px',
    fontSize: '18px', cursor: 'pointer', fontWeight: '700',
  },
  skillTags: {
    display: 'flex', flexWrap: 'wrap', gap: '8px',
    minHeight: '40px',
  },
  skillTag: {
    display: 'flex', alignItems: 'center', gap: '6px',
    padding: '5px 12px', background: '#EEF2FF',
    color: '#4F46E5', borderRadius: '20px',
    fontSize: '13px', fontWeight: '500',
  },
  removeSkill: {
    background: 'none', border: 'none',
    color: '#4F46E5', cursor: 'pointer',
    fontSize: '16px', lineHeight: 1, padding: 0,
  },
  noSkills: { fontSize: '13px', color: '#9CA3AF', fontStyle: 'italic' },
  recap: { display: 'flex', flexDirection: 'column', gap: '10px' },
  recapItem: {
    display: 'flex', justifyContent: 'space-between',
    padding: '8px 0', borderBottom: '1px solid #F3F4F6',
  },
  recapLabel: { fontSize: '13px', color: '#6B7280' },
  recapValue: { fontSize: '13px', fontWeight: '600', color: '#1F2937' },
  formActions: {
    display: 'flex', justifyContent: 'flex-end',
    gap: '12px',
  },
  cancelBtn: {
    padding: '11px 24px', background: '#F3F4F6',
    border: 'none', borderRadius: '8px',
    fontSize: '14px', fontWeight: '600', cursor: 'pointer',
  },
  submitBtn: {
    padding: '11px 28px',
    background: 'linear-gradient(135deg, #4F46E5, #7C3AED)',
    color: '#fff', border: 'none', borderRadius: '8px',
    fontSize: '14px', fontWeight: '600', cursor: 'pointer',
  },
};