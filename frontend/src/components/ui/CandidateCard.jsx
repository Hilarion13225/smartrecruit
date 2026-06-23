import { resumesAPI } from '../../api/resumes'
import toast from 'react-hot-toast'

export default function CandidateCard({ resume, rank, onDelete }) {
  const analysis = resume.analysis;

  const recommendationConfig = {
    priority: { label: '⭐ Prioritaire', bg: '#D1FAE5', color: '#065F46' },
    possible: { label: '✅ Possible', bg: '#DBEAFE', color: '#1E40AF' },
    reserve: { label: '⚠️ Réserve', bg: '#FEF3C7', color: '#92400E' },
    rejected: { label: '❌ Rejeté', bg: '#FEE2E2', color: '#991B1B' },
  };

  const rec = analysis
    ? recommendationConfig[analysis.recommendation]
    : null;

  // ← AJOUTER cette fonction
  const handleDelete = async () => {
    if (!window.confirm(`Supprimer le CV de ${resume.candidate_name} ?`)) return
    try {
      await resumesAPI.delete(resume.id)
      toast.success('CV supprimé avec succès !')
      onDelete(resume.id) // ← informe le parent pour mettre à jour la liste
    } catch {
      toast.error('Erreur lors de la suppression.')
    }
  }

  const ScoreBar = ({ label, value, color }) => (
    <div style={styles.scoreBarItem}>
      <div style={styles.scoreBarHeader}>
        <span style={styles.scoreBarLabel}>{label}</span>
        <span style={styles.scoreBarValue}>{value?.toFixed(0)}%</span>
      </div>
      <div style={styles.scoreBarBg}>
        <div style={{
          ...styles.scoreBarFill,
          width: `${value || 0}%`,
          background: color,
        }} />
      </div>
    </div>
  );

  return (
    <div style={styles.card}>
      {/* Gauche : Rang + Nom */}
      <div style={styles.left}>
        <div style={styles.rank}>#{rank}</div>
        <div>
          <h3 style={styles.name}>{resume.candidate_name}</h3>
          {resume.candidate_email && (
            <p style={styles.email}>{resume.candidate_email}</p>
          )}
          <p style={styles.uploadDate}>
            Importé le {new Date(resume.uploaded_at).toLocaleDateString('fr-FR')}
          </p>
          {/* ← AJOUTER le bouton ici */}
          <button onClick={handleDelete} style={styles.deleteBtn}>
            🗑️ Supprimer
          </button>
        </div>
      </div>

      {/* Centre : Scores détaillés */}
      {analysis ? (
        <div style={styles.scores}>
          <ScoreBar label="Compétences" value={analysis.score_skills} color="#4F46E5" />
          <ScoreBar label="Expérience" value={analysis.score_experience} color="#10B981" />
          <ScoreBar label="Formation" value={analysis.score_education} color="#F59E0B" />
          <ScoreBar label="Sémantique" value={analysis.score_semantic} color="#8B5CF6" />
        </div>
      ) : (
        <div style={styles.noAnalysis}>
          {resume.status === 'analyzing'
            ? '⏳ Analyse en cours...'
            : '📋 En attente d\'analyse'}
        </div>
      )}

      {/* Droite : Score total + Recommandation */}
      <div style={styles.right}>
        {analysis ? (
          <>
            <div style={styles.totalScore}>
              <span style={styles.scoreNumber}>
                {analysis.score_total?.toFixed(0)}
              </span>
              <span style={styles.scoreMax}>/100</span>
            </div>
            {rec && (
              <span style={{
                ...styles.recBadge,
                background: rec.bg,
                color: rec.color,
              }}>
                {rec.label}
              </span>
            )}
            {analysis.missing_skills?.length > 0 && (
              <div style={styles.missing}>
                <p style={styles.missingTitle}>Manque :</p>
                <div style={styles.missingTags}>
                  {analysis.missing_skills.slice(0, 3).map((s) => (
                    <span key={s} style={styles.missingTag}>{s}</span>
                  ))}
                  {analysis.missing_skills.length > 3 && (
                    <span style={styles.missingTag}>
                      +{analysis.missing_skills.length - 3}
                    </span>
                  )}
                </div>
              </div>
            )}
          </>
        ) : (
          <div style={styles.statusBadge}>
            {resume.status === 'pending' ? '⏳ En attente' : '🔄 Analyse...'}
          </div>
        )}
      </div>
    </div>
  );
}

const styles = {
  card: {
    background: '#fff', borderRadius: '12px',
    padding: '20px', boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
    display: 'grid',
    gridTemplateColumns: '200px 1fr 160px',
    gap: '20px', alignItems: 'center',
    transition: 'box-shadow 0.2s',
  },
  left: { display: 'flex', alignItems: 'center', gap: '12px' },
  rank: {
    width: '36px', height: '36px', borderRadius: '50%',
    background: '#EEF2FF', color: '#4F46E5',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: '13px', fontWeight: '700', flexShrink: 0,
  },
  name: { fontSize: '14px', fontWeight: '700', color: '#1F2937' },
  email: { fontSize: '12px', color: '#6B7280', marginTop: '2px' },
  uploadDate: { fontSize: '11px', color: '#9CA3AF', marginTop: '2px' },
  // ← AJOUTER ce style
  deleteBtn: {
    marginTop: '6px', padding: '4px 10px',
    background: '#FEE2E2', color: '#991B1B',
    border: 'none', borderRadius: '6px',
    fontSize: '11px', fontWeight: '600',
    cursor: 'pointer',
  },
  scores: { display: 'flex', flexDirection: 'column', gap: '6px' },
  scoreBarItem: {},
  scoreBarHeader: {
    display: 'flex', justifyContent: 'space-between',
    marginBottom: '3px',
  },
  scoreBarLabel: { fontSize: '11px', color: '#6B7280' },
  scoreBarValue: { fontSize: '11px', fontWeight: '600', color: '#374151' },
  scoreBarBg: {
    height: '6px', background: '#F3F4F6',
    borderRadius: '10px', overflow: 'hidden',
  },
  scoreBarFill: {
    height: '100%', borderRadius: '10px',
    transition: 'width 0.5s ease',
  },
  noAnalysis: {
    textAlign: 'center', fontSize: '13px',
    color: '#9CA3AF', fontStyle: 'italic',
  },
  right: {
    display: 'flex', flexDirection: 'column',
    alignItems: 'center', gap: '8px',
  },
  totalScore: { display: 'flex', alignItems: 'baseline', gap: '2px' },
  scoreNumber: { fontSize: '36px', fontWeight: '800', color: '#1F2937' },
  scoreMax: { fontSize: '14px', color: '#9CA3AF' },
  recBadge: {
    padding: '4px 12px', borderRadius: '20px',
    fontSize: '12px', fontWeight: '600', textAlign: 'center',
  },
  missing: { width: '100%' },
  missingTitle: { fontSize: '11px', color: '#9CA3AF', marginBottom: '4px' },
  missingTags: { display: 'flex', flexWrap: 'wrap', gap: '4px' },
  missingTag: {
    padding: '2px 8px', background: '#FEE2E2',
    color: '#991B1B', borderRadius: '10px', fontSize: '11px',
  },
  statusBadge: { fontSize: '13px', color: '#9CA3AF', fontStyle: 'italic' },
};