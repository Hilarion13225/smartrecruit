import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { authAPI } from '../api/auth';
import api from '../api/axios';
import toast from 'react-hot-toast';

export default function Settings() {
  const { user, login } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');

  // ── Profil ──
  const [profile, setProfile] = useState({
    first_name: user?.first_name || '',
    last_name: user?.last_name || '',
    email: user?.email || '',
    company: user?.company || '',
    phone: user?.phone || '',
  });
  const [savingProfile, setSavingProfile] = useState(false);

  // ── Mot de passe ──
  const [passwords, setPasswords] = useState({
    old_password: '',
    new_password: '',
    confirm_password: '',
  });
  const [savingPassword, setSavingPassword] = useState(false);
  const [showPasswords, setShowPasswords] = useState(false);

  // ── Handlers profil ──
  const handleProfileChange = (e) => {
    setProfile({ ...profile, [e.target.name]: e.target.value });
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setSavingProfile(true);
    try {
      await authAPI.updateProfile(profile);
      toast.success('Profil mis à jour avec succès !');
    } catch (err) {
      const errors = err.response?.data;
      if (errors) {
        Object.values(errors).forEach((msg) => toast.error(msg[0]));
      } else {
        toast.error('Erreur lors de la mise à jour.');
      }
    } finally {
      setSavingProfile(false);
    }
  };

  // ── Handlers mot de passe ──
  const handlePasswordChange = (e) => {
    setPasswords({ ...passwords, [e.target.name]: e.target.value });
  };

  const handleSavePassword = async (e) => {
    e.preventDefault();
    if (passwords.new_password !== passwords.confirm_password) {
      toast.error('Les nouveaux mots de passe ne correspondent pas.');
      return;
    }
    if (passwords.new_password.length < 8) {
      toast.error('Le mot de passe doit contenir au moins 8 caractères.');
      return;
    }
    setSavingPassword(true);
    try {
      await api.post('/auth/change-password/', {
        old_password: passwords.old_password,
        new_password: passwords.new_password,
      });
      toast.success('Mot de passe modifié avec succès !');
      setPasswords({ old_password: '', new_password: '', confirm_password: '' });
    } catch (err) {
      const msg = err.response?.data?.old_password;
      toast.error(msg ? msg[0] : 'Erreur lors du changement.');
    } finally {
      setSavingPassword(false);
    }
  };

  const tabs = [
    { key: 'profile', icon: '👤', label: 'Profil' },
    { key: 'security', icon: '🔒', label: 'Sécurité' },
    { key: 'preferences', icon: '⚙️', label: 'Préférences' },
  ];

  return (
    <div>
      {/* Header */}
      <div style={styles.header}>
        <h1 style={styles.title}>Paramètres</h1>
        <p style={styles.subtitle}>Gérez votre compte et vos préférences</p>
      </div>

      <div style={styles.layout}>
        {/* Sidebar des onglets */}
        <div style={styles.tabsSidebar}>
          {/* Avatar */}
          <div style={styles.avatarSection}>
            <div style={styles.avatar}>
              {user?.first_name?.[0] || user?.username?.[0] || 'U'}
            </div>
            <p style={styles.avatarName}>
              {user?.first_name} {user?.last_name}
            </p>
            <p style={styles.avatarRole}>
              {user?.role === 'admin' ? '🛡️ Administrateur' : '💼 Recruteur'}
            </p>
          </div>

          {/* Onglets */}
          <nav style={styles.tabsNav}>
            {tabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                style={{
                  ...styles.tabBtn,
                  ...(activeTab === tab.key ? styles.tabBtnActive : {}),
                }}
              >
                <span>{tab.icon}</span>
                <span>{tab.label}</span>
              </button>
            ))}
          </nav>
        </div>

        {/* Contenu */}
        <div style={styles.content}>

          {/* ── Onglet Profil ── */}
          {activeTab === 'profile' && (
            <div style={styles.card}>
              <h2 style={styles.cardTitle}>👤 Informations personnelles</h2>
              <p style={styles.cardSubtitle}>
                Ces informations sont visibles sur votre compte recruteur.
              </p>

              <form onSubmit={handleSaveProfile} style={styles.form}>
                <div style={styles.grid2}>
                  <div style={styles.field}>
                    <label style={styles.label}>Prénom</label>
                    <input
                      name="first_name"
                      value={profile.first_name}
                      onChange={handleProfileChange}
                      placeholder="Votre prénom"
                      style={styles.input}
                    />
                  </div>
                  <div style={styles.field}>
                    <label style={styles.label}>Nom</label>
                    <input
                      name="last_name"
                      value={profile.last_name}
                      onChange={handleProfileChange}
                      placeholder="Votre nom"
                      style={styles.input}
                    />
                  </div>
                </div>

                <div style={styles.field}>
                  <label style={styles.label}>Adresse email</label>
                  <input
                    name="email"
                    type="email"
                    value={profile.email}
                    onChange={handleProfileChange}
                    placeholder="votre@email.com"
                    style={styles.input}
                  />
                </div>

                <div style={styles.grid2}>
                  <div style={styles.field}>
                    <label style={styles.label}>Entreprise</label>
                    <input
                      name="company"
                      value={profile.company}
                      onChange={handleProfileChange}
                      placeholder="Nom de votre entreprise"
                      style={styles.input}
                    />
                  </div>
                  <div style={styles.field}>
                    <label style={styles.label}>Téléphone</label>
                    <input
                      name="phone"
                      value={profile.phone}
                      onChange={handleProfileChange}
                      placeholder="+225 07 00 00 00 00"
                      style={styles.input}
                    />
                  </div>
                </div>

                {/* Info non modifiable */}
                <div style={styles.infoBox}>
                  <span style={styles.infoIcon}>ℹ️</span>
                  <div>
                    <p style={styles.infoTitle}>
                      Nom d'utilisateur : <strong>{user?.username}</strong>
                    </p>
                    <p style={styles.infoText}>
                      Le nom d'utilisateur ne peut pas être modifié.
                    </p>
                  </div>
                </div>

                <div style={styles.formFooter}>
                  <button
                    type="submit"
                    disabled={savingProfile}
                    style={{
                      ...styles.saveBtn,
                      opacity: savingProfile ? 0.7 : 1,
                    }}
                  >
                    {savingProfile ? '⏳ Sauvegarde...' : '✅ Sauvegarder'}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* ── Onglet Sécurité ── */}
          {activeTab === 'security' && (
            <div style={styles.card}>
              <h2 style={styles.cardTitle}>🔒 Changer le mot de passe</h2>
              <p style={styles.cardSubtitle}>
                Utilisez un mot de passe fort d'au moins 8 caractères.
              </p>

              <form onSubmit={handleSavePassword} style={styles.form}>
                <div style={styles.field}>
                  <label style={styles.label}>Mot de passe actuel</label>
                  <div style={styles.inputWrapper}>
                    <input
                      name="old_password"
                      type={showPasswords ? 'text' : 'password'}
                      value={passwords.old_password}
                      onChange={handlePasswordChange}
                      placeholder="••••••••"
                      required
                      style={styles.input}
                    />
                  </div>
                </div>

                <div style={styles.field}>
                  <label style={styles.label}>Nouveau mot de passe</label>
                  <input
                    name="new_password"
                    type={showPasswords ? 'text' : 'password'}
                    value={passwords.new_password}
                    onChange={handlePasswordChange}
                    placeholder="••••••••"
                    required
                    style={styles.input}
                  />
                  {/* Indicateur de force */}
                  {passwords.new_password && (
                    <div style={styles.strengthBar}>
                      {(() => {
                        const len = passwords.new_password.length;
                        const hasUpper = /[A-Z]/.test(passwords.new_password);
                        const hasNum = /[0-9]/.test(passwords.new_password);
                        const hasSpec = /[^a-zA-Z0-9]/.test(passwords.new_password);
                        const score = (len >= 8 ? 1 : 0) + (hasUpper ? 1 : 0)
                          + (hasNum ? 1 : 0) + (hasSpec ? 1 : 0);
                        const levels = [
                          { label: 'Très faible', color: '#EF4444', width: '25%' },
                          { label: 'Faible', color: '#F59E0B', width: '50%' },
                          { label: 'Moyen', color: '#3B82F6', width: '75%' },
                          { label: 'Fort', color: '#10B981', width: '100%' },
                        ];
                        const lvl = levels[Math.max(0, score - 1)];
                        return (
                          <>
                            <div style={styles.strengthBg}>
                              <div style={{
                                ...styles.strengthFill,
                                width: lvl.width,
                                background: lvl.color,
                              }} />
                            </div>
                            <span style={{
                              ...styles.strengthLabel,
                              color: lvl.color,
                            }}>
                              {lvl.label}
                            </span>
                          </>
                        );
                      })()}
                    </div>
                  )}
                </div>

                <div style={styles.field}>
                  <label style={styles.label}>Confirmer le nouveau mot de passe</label>
                  <input
                    name="confirm_password"
                    type={showPasswords ? 'text' : 'password'}
                    value={passwords.confirm_password}
                    onChange={handlePasswordChange}
                    placeholder="••••••••"
                    required
                    style={{
                      ...styles.input,
                      borderColor: passwords.confirm_password &&
                        passwords.confirm_password !== passwords.new_password
                        ? '#EF4444' : '#E5E7EB',
                    }}
                  />
                  {passwords.confirm_password &&
                    passwords.confirm_password !== passwords.new_password && (
                      <span style={styles.errorText}>
                        ❌ Les mots de passe ne correspondent pas
                      </span>
                    )}
                  {passwords.confirm_password &&
                    passwords.confirm_password === passwords.new_password && (
                      <span style={styles.successText}>
                        ✅ Les mots de passe correspondent
                      </span>
                    )}
                </div>

                {/* Toggle affichage */}
                <label style={styles.showPasswordToggle}>
                  <input
                    type="checkbox"
                    checked={showPasswords}
                    onChange={() => setShowPasswords(!showPasswords)}
                  />
                  <span>Afficher les mots de passe</span>
                </label>

                <div style={styles.formFooter}>
                  <button
                    type="submit"
                    disabled={savingPassword}
                    style={{
                      ...styles.saveBtn,
                      opacity: savingPassword ? 0.7 : 1,
                    }}
                  >
                    {savingPassword ? '⏳ Modification...' : '🔒 Changer le mot de passe'}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* ── Onglet Préférences ── */}
          {activeTab === 'preferences' && (
            <div style={styles.card}>
              <h2 style={styles.cardTitle}>⚙️ Préférences</h2>
              <p style={styles.cardSubtitle}>
                Personnalisez votre expérience SmartRecruit.
              </p>

              <div style={styles.prefList}>
                {/* Seuils de recommandation */}
                <div style={styles.prefSection}>
                  <h3 style={styles.prefSectionTitle}>
                    📊 Seuils de recommandation
                  </h3>
                  <p style={styles.prefSectionDesc}>
                    Définissez les seuils de score pour chaque niveau.
                  </p>

                  {[
                    { label: '⭐ Prioritaire', key: 'priority', default: 75, color: '#10B981' },
                    { label: '✅ Possible', key: 'possible', default: 55, color: '#4F46E5' },
                    { label: '⚠️ Réserve', key: 'reserve', default: 35, color: '#F59E0B' },
                  ].map((item) => (
                    <div key={item.key} style={styles.prefRow}>
                      <span style={{ ...styles.prefLabel, color: item.color }}>
                        {item.label}
                      </span>
                      <div style={styles.prefControl}>
                        <span style={styles.prefHint}>Score ≥</span>
                        <input
                          type="number"
                          defaultValue={item.default}
                          min="0" max="100"
                          style={styles.prefInput}
                        />
                        <span style={styles.prefHint}>/ 100</span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Notifications */}
                <div style={styles.prefSection}>
                  <h3 style={styles.prefSectionTitle}>🔔 Notifications</h3>

                  {[
                    { label: 'Analyse terminée', desc: 'Notifier quand l\'IA finit une analyse' },
                    { label: 'Nouveau candidat prioritaire', desc: 'Alerte pour les scores > 75' },
                  ].map((item) => (
                    <div key={item.label} style={styles.toggleRow}>
                      <div>
                        <p style={styles.toggleLabel}>{item.label}</p>
                        <p style={styles.toggleDesc}>{item.desc}</p>
                      </div>
                      <label style={styles.toggle}>
                        <input type="checkbox" defaultChecked style={{ display: 'none' }} />
                        <div style={styles.toggleTrack}>
                          <div style={styles.toggleThumb} />
                        </div>
                      </label>
                    </div>
                  ))}
                </div>

                {/* Infos compte */}
                <div style={styles.prefSection}>
                  <h3 style={styles.prefSectionTitle}>📋 Informations du compte</h3>
                  <div style={styles.infoGrid}>
                    {[
                      { label: 'Membre depuis', value: new Date(user?.created_at).toLocaleDateString('fr-FR') },
                      { label: 'Rôle', value: user?.role === 'admin' ? 'Administrateur' : 'Recruteur' },
                      { label: 'Statut', value: '✅ Actif' },
                      { label: 'Version', value: 'SmartRecruit v1.0' },
                    ].map((item) => (
                      <div key={item.label} style={styles.infoItem}>
                        <span style={styles.infoItemLabel}>{item.label}</span>
                        <span style={styles.infoItemValue}>{item.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div style={styles.formFooter}>
                <button
                  onClick={() => toast.success('Préférences sauvegardées !')}
                  style={styles.saveBtn}
                >
                  ✅ Sauvegarder les préférences
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

const styles = {
  header: { marginBottom: '28px' },
  title: { fontSize: '24px', fontWeight: '700', color: '#1F2937' },
  subtitle: { fontSize: '14px', color: '#6B7280', marginTop: '4px' },
  layout: {
    display: 'grid',
    gridTemplateColumns: '220px 1fr',
    gap: '24px',
    alignItems: 'start',
  },
  tabsSidebar: {
    background: '#fff', borderRadius: '12px',
    padding: '20px', boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
  },
  avatarSection: {
    textAlign: 'center', marginBottom: '20px',
    paddingBottom: '20px', borderBottom: '1px solid #F3F4F6',
  },
  avatar: {
    width: '64px', height: '64px', borderRadius: '50%',
    background: 'linear-gradient(135deg, #4F46E5, #7C3AED)',
    color: '#fff', display: 'flex', alignItems: 'center',
    justifyContent: 'center', fontSize: '24px', fontWeight: '700',
    margin: '0 auto 12px', textTransform: 'uppercase',
  },
  avatarName: { fontSize: '14px', fontWeight: '700', color: '#1F2937' },
  avatarRole: { fontSize: '12px', color: '#6B7280', marginTop: '4px' },
  tabsNav: { display: 'flex', flexDirection: 'column', gap: '4px' },
  tabBtn: {
    display: 'flex', alignItems: 'center', gap: '10px',
    padding: '10px 12px', border: 'none', borderRadius: '8px',
    background: 'transparent', color: '#6B7280',
    fontSize: '14px', fontWeight: '500', cursor: 'pointer',
    width: '100%', textAlign: 'left', transition: 'all 0.2s',
  },
  tabBtnActive: {
    background: '#EEF2FF', color: '#4F46E5', fontWeight: '600',
  },
  content: {},
  card: {
    background: '#fff', borderRadius: '12px',
    padding: '28px', boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
  },
  cardTitle: {
    fontSize: '18px', fontWeight: '700',
    color: '#1F2937', marginBottom: '4px',
  },
  cardSubtitle: {
    fontSize: '14px', color: '#6B7280', marginBottom: '24px',
  },
  form: { display: 'flex', flexDirection: 'column', gap: '18px' },
  grid2: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' },
  field: { display: 'flex', flexDirection: 'column', gap: '6px' },
  label: { fontSize: '13px', fontWeight: '600', color: '#374151' },
  input: {
    padding: '10px 14px', border: '1.5px solid #E5E7EB',
    borderRadius: '8px', fontSize: '14px', outline: 'none',
    color: '#1F2937', transition: 'border-color 0.2s',
  },
  inputWrapper: { position: 'relative' },
  infoBox: {
    display: 'flex', gap: '12px', alignItems: 'flex-start',
    background: '#F0F9FF', border: '1px solid #BAE6FD',
    borderRadius: '8px', padding: '12px 16px',
  },
  infoIcon: { fontSize: '18px', flexShrink: 0 },
  infoTitle: { fontSize: '13px', color: '#0369A1', fontWeight: '500' },
  infoText: { fontSize: '12px', color: '#0284C7', marginTop: '2px' },
  formFooter: { display: 'flex', justifyContent: 'flex-end', marginTop: '8px' },
  saveBtn: {
    padding: '11px 24px',
    background: 'linear-gradient(135deg, #4F46E5, #7C3AED)',
    color: '#fff', border: 'none', borderRadius: '8px',
    fontSize: '14px', fontWeight: '600', cursor: 'pointer',
  },
  strengthBar: { display: 'flex', alignItems: 'center', gap: '10px', marginTop: '6px' },
  strengthBg: {
    flex: 1, height: '6px', background: '#F3F4F6',
    borderRadius: '10px', overflow: 'hidden',
  },
  strengthFill: {
    height: '100%', borderRadius: '10px',
    transition: 'all 0.3s ease',
  },
  strengthLabel: { fontSize: '12px', fontWeight: '600', minWidth: '70px' },
  errorText: { fontSize: '12px', color: '#EF4444', marginTop: '4px' },
  successText: { fontSize: '12px', color: '#10B981', marginTop: '4px' },
  showPasswordToggle: {
    display: 'flex', alignItems: 'center', gap: '8px',
    fontSize: '13px', color: '#6B7280', cursor: 'pointer',
  },
  prefList: { display: 'flex', flexDirection: 'column', gap: '24px' },
  prefSection: { display: 'flex', flexDirection: 'column', gap: '12px' },
  prefSectionTitle: {
    fontSize: '15px', fontWeight: '700', color: '#1F2937',
  },
  prefSectionDesc: { fontSize: '13px', color: '#6B7280', marginTop: '-6px' },
  prefRow: {
    display: 'flex', justifyContent: 'space-between',
    alignItems: 'center', padding: '10px 14px',
    background: '#F9FAFB', borderRadius: '8px',
  },
  prefLabel: { fontSize: '13px', fontWeight: '600' },
  prefControl: { display: 'flex', alignItems: 'center', gap: '8px' },
  prefHint: { fontSize: '12px', color: '#9CA3AF' },
  prefInput: {
    width: '60px', padding: '6px 8px',
    border: '1.5px solid #E5E7EB', borderRadius: '6px',
    fontSize: '13px', textAlign: 'center', outline: 'none',
  },
  toggleRow: {
    display: 'flex', justifyContent: 'space-between',
    alignItems: 'center', padding: '12px 14px',
    background: '#F9FAFB', borderRadius: '8px',
  },
  toggleLabel: { fontSize: '13px', fontWeight: '600', color: '#1F2937' },
  toggleDesc: { fontSize: '12px', color: '#9CA3AF', marginTop: '2px' },
  toggle: { cursor: 'pointer' },
  toggleTrack: {
    width: '40px', height: '22px', background: '#4F46E5',
    borderRadius: '11px', position: 'relative',
  },
  toggleThumb: {
    width: '18px', height: '18px', background: '#fff',
    borderRadius: '50%', position: 'absolute',
    top: '2px', right: '2px',
  },
  infoGrid: {
    display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px',
  },
  infoItem: {
    display: 'flex', flexDirection: 'column', gap: '4px',
    padding: '12px', background: '#F9FAFB', borderRadius: '8px',
  },
  infoItemLabel: { fontSize: '11px', color: '#9CA3AF', textTransform: 'uppercase' },
  infoItemValue: { fontSize: '13px', fontWeight: '600', color: '#1F2937' },
};