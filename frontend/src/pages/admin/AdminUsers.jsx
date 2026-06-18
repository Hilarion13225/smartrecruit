import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminAPI } from '../../api/admin';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const { user: currentUser } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (currentUser?.role !== 'admin') {
      navigate('/dashboard');
      return;
    }
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await adminAPI.getUsers();
      setUsers(res.data);
    } catch {
      toast.error('Erreur chargement utilisateurs.');
    } finally {
      setLoading(false);
    }
  };

  const toggleActive = async (userId, currentStatus) => {
    try {
      await adminAPI.updateUser(userId, { is_active: !currentStatus });
      setUsers(users.map((u) =>
        u.id === userId ? { ...u, is_active: !currentStatus } : u
      ));
      toast.success(
        currentStatus ? 'Utilisateur désactivé.' : 'Utilisateur activé.'
      );
    } catch (err) {
      toast.error(err.response?.data?.error || 'Erreur.');
    }
  };

  const changeRole = async (userId, newRole) => {
    try {
      await adminAPI.updateUser(userId, { role: newRole });
      setUsers(users.map((u) =>
        u.id === userId ? { ...u, role: newRole } : u
      ));
      toast.success('Rôle modifié.');
    } catch {
      toast.error('Erreur modification rôle.');
    }
  };

  const deleteUser = async (userId, username) => {
    if (!window.confirm(`Supprimer l'utilisateur "${username}" ?`)) return;
    try {
      await adminAPI.deleteUser(userId);
      setUsers(users.filter((u) => u.id !== userId));
      toast.success('Utilisateur supprimé.');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Erreur suppression.');
    }
  };

  const filtered = users.filter((u) =>
    u.username.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase()) ||
    (u.company || '').toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return <div style={styles.loading}>Chargement...</div>;

  return (
    <div>
      <div style={styles.header}>
        <div>
          <button onClick={() => navigate('/admin')} style={styles.backBtn}>
            ← Retour
          </button>
          <h1 style={styles.title}>👥 Gestion des utilisateurs</h1>
          <p style={styles.subtitle}>{users.length} utilisateur(s) au total</p>
        </div>
      </div>

      {/* Barre de recherche */}
      <div style={styles.searchBar}>
        <span>🔍</span>
        <input
          placeholder="Rechercher par nom, email, entreprise..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={styles.searchInput}
        />
      </div>

      {/* Tableau */}
      <div style={styles.tableCard}>
        <table style={styles.table}>
          <thead>
            <tr style={styles.thead}>
              <th style={styles.th}>Utilisateur</th>
              <th style={styles.th}>Entreprise</th>
              <th style={styles.th}>Rôle</th>
              <th style={styles.th}>Offres</th>
              <th style={styles.th}>CV</th>
              <th style={styles.th}>Statut</th>
              <th style={styles.th}>Inscription</th>
              <th style={styles.th}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((u) => (
              <tr key={u.id} style={styles.tr}>
                {/* Utilisateur */}
                <td style={styles.td}>
                  <div style={styles.userCell}>
                    <div style={styles.avatar}>
                      {u.first_name?.[0] || u.username?.[0] || 'U'}
                    </div>
                    <div>
                      <p style={styles.userName}>
                        {u.first_name} {u.last_name}
                      </p>
                      <p style={styles.userEmail}>{u.email}</p>
                    </div>
                  </div>
                </td>

                {/* Entreprise */}
                <td style={styles.td}>
                  <span style={styles.cellText}>
                    {u.company || '—'}
                  </span>
                </td>

                {/* Rôle */}
                <td style={styles.td}>
                  <select
                    value={u.role}
                    onChange={(e) => changeRole(u.id, e.target.value)}
                    disabled={u.id === currentUser?.id}
                    style={{
                      ...styles.roleSelect,
                      background: u.role === 'admin' ? '#EEF2FF' : '#F9FAFB',
                      color: u.role === 'admin' ? '#4F46E5' : '#374151',
                    }}
                  >
                    <option value="recruiter">Recruteur</option>
                    <option value="admin">Admin</option>
                  </select>
                </td>

                {/* Offres */}
                <td style={styles.td}>
                  <span style={styles.badge}>
                    {u.jobs_count || 0}
                  </span>
                </td>

                {/* CV */}
                <td style={styles.td}>
                  <span style={styles.badge}>
                    {u.resumes_count || 0}
                  </span>
                </td>

                {/* Statut */}
                <td style={styles.td}>
                  <span style={{
                    ...styles.statusBadge,
                    background: u.is_active ? '#D1FAE5' : '#FEE2E2',
                    color: u.is_active ? '#065F46' : '#991B1B',
                  }}>
                    {u.is_active ? '✅ Actif' : '❌ Inactif'}
                  </span>
                </td>

                {/* Date inscription */}
                <td style={styles.td}>
                  <span style={styles.cellText}>
                    {new Date(u.created_at).toLocaleDateString('fr-FR')}
                  </span>
                </td>

                {/* Actions */}
                <td style={styles.td}>
                  <div style={styles.actions}>
                    {u.id !== currentUser?.id && (
                      <>
                        <button
                          onClick={() => toggleActive(u.id, u.is_active)}
                          style={{
                            ...styles.actionBtn,
                            background: u.is_active ? '#FEF3C7' : '#D1FAE5',
                            color: u.is_active ? '#92400E' : '#065F46',
                          }}
                          title={u.is_active ? 'Désactiver' : 'Activer'}
                        >
                          {u.is_active ? '🔒' : '🔓'}
                        </button>
                        <button
                          onClick={() => deleteUser(u.id, u.username)}
                          style={{
                            ...styles.actionBtn,
                            background: '#FEE2E2',
                            color: '#991B1B',
                          }}
                          title="Supprimer"
                        >
                          🗑️
                        </button>
                      </>
                    )}
                    {u.id === currentUser?.id && (
                      <span style={styles.youBadge}>Vous</span>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filtered.length === 0 && (
          <div style={styles.empty}>
            Aucun utilisateur trouvé.
          </div>
        )}
      </div>
    </div>
  );
}

const styles = {
  loading: {
    display: 'flex', alignItems: 'center',
    justifyContent: 'center', minHeight: '60vh', color: '#6B7280',
  },
  header: { marginBottom: '24px' },
  backBtn: {
    padding: '6px 12px', background: '#F3F4F6',
    border: 'none', borderRadius: '6px',
    fontSize: '13px', cursor: 'pointer',
    color: '#374151', marginBottom: '8px',
  },
  title: { fontSize: '22px', fontWeight: '700', color: '#1F2937' },
  subtitle: { fontSize: '14px', color: '#6B7280', marginTop: '4px' },
  searchBar: {
    display: 'flex', alignItems: 'center', gap: '10px',
    background: '#fff', border: '1.5px solid #E5E7EB',
    borderRadius: '10px', padding: '10px 16px',
    marginBottom: '20px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
  },
  searchInput: {
    border: 'none', outline: 'none',
    fontSize: '14px', flex: 1, color: '#374151',
  },
  tableCard: {
    background: '#fff', borderRadius: '12px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
    overflow: 'hidden',
  },
  table: { width: '100%', borderCollapse: 'collapse' },
  thead: { background: '#F9FAFB' },
  th: {
    padding: '12px 16px', textAlign: 'left',
    fontSize: '12px', fontWeight: '600',
    color: '#6B7280', textTransform: 'uppercase',
    letterSpacing: '0.05em',
    borderBottom: '1px solid #E5E7EB',
  },
  tr: { borderBottom: '1px solid #F3F4F6' },
  td: { padding: '14px 16px', verticalAlign: 'middle' },
  userCell: { display: 'flex', alignItems: 'center', gap: '10px' },
  avatar: {
    width: '36px', height: '36px', borderRadius: '50%',
    background: '#EEF2FF', color: '#4F46E5',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: '13px', fontWeight: '700', textTransform: 'uppercase',
    flexShrink: 0,
  },
  userName: { fontSize: '13px', fontWeight: '600', color: '#1F2937' },
  userEmail: { fontSize: '11px', color: '#9CA3AF', marginTop: '2px' },
  cellText: { fontSize: '13px', color: '#6B7280' },
  roleSelect: {
    padding: '4px 8px', border: '1px solid #E5E7EB',
    borderRadius: '6px', fontSize: '12px',
    fontWeight: '600', outline: 'none', cursor: 'pointer',
  },
  badge: {
    display: 'inline-block',
    padding: '2px 10px', background: '#F3F4F6',
    borderRadius: '20px', fontSize: '12px',
    fontWeight: '600', color: '#374151',
  },
  statusBadge: {
    padding: '4px 10px', borderRadius: '20px',
    fontSize: '12px', fontWeight: '600',
  },
  actions: { display: 'flex', gap: '6px' },
  actionBtn: {
    padding: '6px 10px', border: 'none',
    borderRadius: '6px', cursor: 'pointer',
    fontSize: '14px',
  },
  youBadge: {
    padding: '4px 10px', background: '#EEF2FF',
    color: '#4F46E5', borderRadius: '20px',
    fontSize: '12px', fontWeight: '600',
  },
  empty: {
    textAlign: 'center', padding: '40px',
    color: '#9CA3AF', fontSize: '14px',
  },
};