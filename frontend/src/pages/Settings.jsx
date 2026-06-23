import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { authAPI } from '../api/auth';
import api from '../api/axios';
import toast from 'react-hot-toast';
import {
  User, Lock, Settings2, ShieldCheck, Bell,
  BarChart2, Save, KeyRound, Info, Eye, EyeOff,
} from 'lucide-react';

const css = `
  * { box-sizing: border-box; }

  .settings-header { margin-bottom: 28px; }
  .settings-title {
    font-size: 13px;
    font-weight: 700;
    color: #94A3B8;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    margin: 0 0 4px;
  }
  .settings-name {
    font-size: 24px;
    font-weight: 700;
    color: #1E2D45;
    margin: 0 0 2px;
  }
  .settings-sub {
    font-size: 13px;
    color: #94A3B8;
    margin: 0;
  }

  /* Profile hero card */
  .profile-hero {
    background: #fff;
    border-radius: 14px;
    border: 1px solid #F1F5F9;
    padding: 24px 28px;
    display: flex;
    align-items: center;
    gap: 20px;
    margin-bottom: 20px;
    flex-wrap: wrap;
  }
  .hero-avatar {
    width: 72px;
    height: 72px;
    border-radius: 14px;
    background: #1E2D45;
    color: #fff;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 28px;
    font-weight: 700;
    text-transform: uppercase;
    flex-shrink: 0;
  }
  .hero-info { flex: 1; min-width: 0; }
  .hero-name {
    font-size: 20px;
    font-weight: 700;
    color: #1E2D45;
    margin: 0 0 4px;
    letter-spacing: 0.01em;
  }
  .hero-meta {
    display: flex;
    align-items: center;
    gap: 10px;
    flex-wrap: wrap;
  }
  .hero-email {
    font-size: 13px;
    color: #64748B;
    display: flex;
    align-items: center;
    gap: 5px;
  }
  .hero-badge {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    padding: 3px 10px;
    border-radius: 20px;
    font-size: 11px;
    font-weight: 700;
    letter-spacing: 0.05em;
    background: #D1FAE5;
    color: #065F46;
    border: 1px solid #A7F3D0;
  }
  .hero-actions { margin-left: auto; }
  .hero-edit-btn {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 11px 22px;
    background: #4F46E5;
    color: #fff;
    border: none;
    border-radius: 10px;
    font-size: 13px;
    font-weight: 700;
    letter-spacing: 0.04em;
    text-transform: uppercase;
    cursor: pointer;
    transition: background 0.15s;
  }
  .hero-edit-btn:hover { background: #4338CA; }

  /* Layout */
  .settings-layout {
    display: grid;
    grid-template-columns: 200px 1fr;
    gap: 20px;
    align-items: start;
  }

  /* Tabs sidebar */
  .tabs-sidebar {
    background: #fff;
    border-radius: 14px;
    border: 1px solid #F1F5F9;
    padding: 12px;
    display: flex;
    flex-direction: column;
    gap: 4px;
  }
  .tab-section-label {
    font-size: 10px;
    font-weight: 700;
    color: #CBD5E1;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    padding: 8px 10px 4px;
  }
  .tab-btn {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 10px 12px;
    border: none;
    border-radius: 8px;
    background: transparent;
    color: #64748B;
    font-size: 13px;
    font-weight: 500;
    width: 100%;
    text-align: left;
    cursor: pointer;
    transition: background 0.15s, color 0.15s;
  }
  .tab-btn:hover { background: #F8FAFC; color: #1E2D45; }
  .tab-btn.active { background: #EEF2FF; color: #4F46E5; font-weight: 700; }

  /* Content card */
  .content-card {
    background: #fff;
    border-radius: 14px;
    border: 1px solid #F1F5F9;
    padding: 28px;
  }
  .card-section-label {
    font-size: 11px;
    font-weight: 700;
    color: #94A3B8;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    margin: 0 0 4px;
    display: flex;
    align-items: center;
    gap: 6px;
  }
  .card-title {
    font-size: 18px;
    font-weight: 700;
    color: #1E2D45;
    margin: 0 0 4px;
  }
  .card-subtitle {
    font-size: 13px;
    color: #94A3B8;
    margin: 0 0 24px;
  }
  .divider {
    height: 1px;
    background: #F1F5F9;
    margin: 24px 0;
  }

  /* Form */
  .form { display: flex; flex-direction: column; gap: 18px; }
  .grid2 { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
  .field { display: flex; flex-direction: column; gap: 6px; }
  .field-label {
    font-size: 11px;
    font-weight: 700;
    color: #64748B;
    letter-spacing: 0.08em;
    text-transform: uppercase;
  }
  .input-wrap {
    display: flex;
    align-items: center;
    border: 1.5px solid #E2E8F0;
    border-radius: 10px;
    background: #fff;
    padding: 0 14px;
    gap: 10px;
    transition: border-color 0.15s;
  }
  .input-wrap:focus-within { border-color: #4F46E5; }
  .input-wrap input {
    flex: 1;
    border: none;
    outline: none;
    padding: 11px 0;
    font-size: 14px;
    color: #1E2D45;
    background: transparent;
  }
  .input-wrap input::placeholder { color: #CBD5E1; }
  .toggle-eye { cursor: pointer; display: flex; align-items: center; }

  .info-box {
    display: flex;
    gap: 12px;
    align-items: flex-start;
    background: #F0F9FF;
    border: 1px solid #BAE6FD;
    border-radius: 10px;
    padding: 12px 16px;
  }
  .info-box-title { font-size: 13px; color: #0369A1; font-weight: 600; margin: 0 0 2px; }
  .info-box-text { font-size: 12px; color: #0284C7; margin: 0; }

  .form-footer { display: flex; justify-content: flex-end; margin-top: 8px; }
  .save-btn {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 11px 22px;
    background: #1E2D45;
    color: #fff;
    border: none;
    border-radius: 10px;
    font-size: 13px;
    font-weight: 700;
    letter-spacing: 0.04em;
    cursor: pointer;
    transition: background 0.15s;
  }
  .save-btn:hover:not(:disabled) { background: #2D4263; }
  .save-btn:disabled { opacity: 0.7; cursor: not-allowed; }

  /* Strength bar */
  .strength-bar { display: flex; align-items: center; gap: 10px; margin-top: 6px; }
  .strength-bg { flex: 1; height: 5px; background: #F1F5F9; border-radius: 10px; overflow: hidden; }
  .strength-fill { height: 100%; border-radius: 10px; transition: all 0.3s; }
  .strength-label { font-size: 11px; font-weight: 700; min-width: 68px; letter-spacing: 0.04em; }
  .error-text { font-size: 12px; color: #EF4444; margin-top: 4px; display: flex; align-items: center; gap: 4px; }
  .success-text { font-size: 12px; color: #10B981; margin-top: 4px; display: flex; align-items: center; gap: 4px; }
  .show-pw-toggle {
    display: flex; align-items: center; gap: 8px;
    font-size: 13px; color: #64748B; cursor: pointer;
    user-select: none;
  }

  /* Pref rows */
  .pref-section { display: flex; flex-direction: column; gap: 10px; }
  .pref-section-title {
    font-size: 11px;
    font-weight: 700;
    color: #94A3B8;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    margin: 0;
  }
  .pref-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 12px 14px;
    background: #F8FAFC;
    border-radius: 10px;
  }
  .pref-label { font-size: 13px; font-weight: 600; color: #1E2D45; }
  .pref-control { display: flex; align-items: center; gap: 8px; }
  .pref-hint { font-size: 12px; color: #94A3B8; }
  .pref-input {
    width: 60px;
    padding: 6px 8px;
    border: 1.5px solid #E2E8F0;
    border-radius: 8px;
    font-size: 13px;
    text-align: center;
    outline: none;
    color: #1E2D45;
  }
  .toggle-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 12px 14px;
    background: #F8FAFC;
    border-radius: 10px;
  }
  .toggle-label { font-size: 13px; font-weight: 600; color: #1E2D45; margin: 0 0 2px; }
  .toggle-desc { font-size: 12px; color: #94A3B8; margin: 0; }
  .toggle-track {
    width: 40px; height: 22px; background: #4F46E5;
    border-radius: 11px; position: relative; flex-shrink: 0;
  }
  .toggle-thumb {
    width: 18px; height: 18px; background: #fff;
    border-radius: 50%; position: absolute; top: 2px; right: 2px;
  }
  .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
  .info-item {
    display: flex; flex-direction: column; gap: 4px;
    padding: 12px; background: #F8FAFC; border-radius: 10px;
  }
  .info-item-label {
    font-size: 10px; font-weight: 700; color: #94A3B8;
    text-transform: uppercase; letter-spacing: 0.08em;
  }
  .info-item-value { font-size: 14px; font-weight: 600; color: #1E2D45; }

  @media (max-width: 1024px) {
    .settings-layout { grid-template-columns: 180px 1fr; }
  }
  @media (max-width: 768px) {
    .settings-layout { grid-template-columns: 1fr; }
    .tabs-sidebar { flex-direction: row; flex-wrap: wrap; padding: 8px; gap: 4px; }
    .tab-section-label { display: none; }
    .tab-btn { width: auto; flex: 1; justify-content: center; }
    .grid2 { grid-template-columns: 1fr; }
    .info-grid { grid-template-columns: 1fr; }
    .hero-actions { width: 100%; }
    .hero-edit-btn { width: 100%; justify-content: center; }
    .content-card { padding: 20px; }
  }
  @media (max-width: 480px) {
    .profile-hero { flex-direction: column; align-items: flex-start; gap: 14px; }
  }
`;

const TABS = [
  { key: 'profile',     icon: <User size={15} />,      label: 'Profil' },
  { key: 'security',    icon: <Lock size={15} />,      label: 'Sécurité' },
  { key: 'preferences', icon: <Settings2 size={15} />, label: 'Préférences' },
];

export default function Settings() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');
  const [editMode, setEditMode] = useState(false);

  const [profile, setProfile] = useState({
    first_name: user?.first_name || '',
    last_name:  user?.last_name  || '',
    email:      user?.email      || '',
    company:    user?.company    || '',
    phone:      user?.phone      || '',
  });
  const [savingProfile, setSavingProfile] = useState(false);

  const [passwords, setPasswords] = useState({ old_password: '', new_password: '', confirm_password: '' });
  const [savingPassword, setSavingPassword] = useState(false);
  const [showPasswords, setShowPasswords] = useState(false);

  const handleProfileChange  = (e) => setProfile({ ...profile, [e.target.name]: e.target.value });
  const handlePasswordChange = (e) => setPasswords({ ...passwords, [e.target.name]: e.target.value });

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setSavingProfile(true);
    try {
      await authAPI.updateProfile(profile);
      toast.success('Profil mis à jour !');
      setEditMode(false);
    } catch (err) {
      const errors = err.response?.data;
      if (errors) Object.values(errors).forEach((msg) => toast.error(msg[0]));
      else toast.error('Erreur lors de la mise à jour.');
    } finally { setSavingProfile(false); }
  };

  const handleSavePassword = async (e) => {
    e.preventDefault();
    if (passwords.new_password !== passwords.confirm_password) { toast.error('Les mots de passe ne correspondent pas.'); return; }
    if (passwords.new_password.length < 8) { toast.error('Minimum 8 caractères.'); return; }
    setSavingPassword(true);
    try {
      await api.post('/auth/change-password/', { old_password: passwords.old_password, new_password: passwords.new_password });
      toast.success('Mot de passe modifié !');
      setPasswords({ old_password: '', new_password: '', confirm_password: '' });
    } catch (err) {
      const msg = err.response?.data?.old_password;
      toast.error(msg ? msg[0] : 'Erreur lors du changement.');
    } finally { setSavingPassword(false); }
  };

  const getStrength = (pw) => {
    const score = (pw.length >= 8 ? 1 : 0)
      + (/[A-Z]/.test(pw) ? 1 : 0)
      + (/[0-9]/.test(pw) ? 1 : 0)
      + (/[^a-zA-Z0-9]/.test(pw) ? 1 : 0);
    return [
      { label: 'TRÈS FAIBLE', color: '#EF4444', width: '25%' },
      { label: 'FAIBLE',      color: '#F59E0B', width: '50%' },
      { label: 'MOYEN',       color: '#3B82F6', width: '75%' },
      { label: 'FORT',        color: '#10B981', width: '100%' },
    ][Math.max(0, score - 1)];
  };

  return (
    <>
      <style>{css}</style>

      {/* Header */}
      <div className="settings-header">
        <p className="settings-title">Compte</p>
        <h1 className="settings-name">Paramètres</h1>
        <p className="settings-sub">Gérez votre profil et vos préférences</p>
      </div>

      {/* Profile hero */}
      <div className="profile-hero">
        <div className="hero-avatar">
          {user?.first_name?.[0] || user?.username?.[0] || 'U'}
        </div>
        <div className="hero-info">
          <h2 className="hero-name">
            {(user?.first_name || '') + ' ' + (user?.last_name || '') || user?.username}
          </h2>
          <div className="hero-meta">
            <span className="hero-email">
              <Mail16 /> {user?.email}
            </span>
            <span className="hero-badge">
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#10B981', display: 'inline-block' }} />
              ACTIF
            </span>
          </div>
        </div>
        <div className="hero-actions">
          <button className="hero-edit-btn" onClick={() => { setActiveTab('profile'); setEditMode(true); }}>
            <User size={14} /> Modifier le profil
          </button>
        </div>
      </div>

      {/* Layout */}
      <div className="settings-layout">

        {/* Tabs */}
        <div className="tabs-sidebar">
          <p className="tab-section-label">Navigation</p>
          {TABS.map((t) => (
            <button
              key={t.key}
              className={`tab-btn${activeTab === t.key ? ' active' : ''}`}
              onClick={() => setActiveTab(t.key)}
            >
              {t.icon} {t.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="content-card">

          {/* ── PROFIL ── */}
          {activeTab === 'profile' && (
            <>
              <p className="card-section-label"><User size={13} /> Informations personnelles</p>
              <h2 className="card-title">Mon profil</h2>
              <p className="card-subtitle">Ces informations sont visibles sur votre compte recruteur.</p>

              <form className="form" onSubmit={handleSaveProfile}>
                <div className="grid2">
                  <div className="field">
                    <label className="field-label">Prénom</label>
                    <div className="input-wrap">
                      <User size={15} color="#CBD5E1" />
                      <input name="first_name" value={profile.first_name} onChange={handleProfileChange} placeholder="Votre prénom" readOnly={!editMode} />
                    </div>
                  </div>
                  <div className="field">
                    <label className="field-label">Nom</label>
                    <div className="input-wrap">
                      <User size={15} color="#CBD5E1" />
                      <input name="last_name" value={profile.last_name} onChange={handleProfileChange} placeholder="Votre nom" readOnly={!editMode} />
                    </div>
                  </div>
                </div>
                <div className="field">
                  <label className="field-label">Adresse email</label>
                  <div className="input-wrap">
                    <Mail16 color="#CBD5E1" />
                    <input name="email" type="email" value={profile.email} onChange={handleProfileChange} placeholder="votre@email.com" readOnly={!editMode} />
                  </div>
                </div>
                <div className="grid2">
                  <div className="field">
                    <label className="field-label">Entreprise</label>
                    <div className="input-wrap">
                      <ShieldCheck size={15} color="#CBD5E1" />
                      <input name="company" value={profile.company} onChange={handleProfileChange} placeholder="Votre entreprise" readOnly={!editMode} />
                    </div>
                  </div>
                  <div className="field">
                    <label className="field-label">Téléphone</label>
                    <div className="input-wrap">
                      <Phone16 color="#CBD5E1" />
                      <input name="phone" value={profile.phone} onChange={handleProfileChange} placeholder="+225 07 00 00 00" readOnly={!editMode} />
                    </div>
                  </div>
                </div>

                <div className="info-box">
                  <Info size={16} color="#0369A1" style={{ flexShrink: 0, marginTop: 1 }} />
                  <div>
                    <p className="info-box-title">Nom d'utilisateur : <strong>{user?.username}</strong></p>
                    <p className="info-box-text">Le nom d'utilisateur ne peut pas être modifié.</p>
                  </div>
                </div>

                {editMode && (
                  <div className="form-footer">
                    <button type="button" onClick={() => setEditMode(false)}
                      style={{ padding: '11px 18px', border: '1.5px solid #E2E8F0', borderRadius: 10, background: '#fff', color: '#64748B', fontSize: 13, fontWeight: 600, cursor: 'pointer', marginRight: 10 }}>
                      Annuler
                    </button>
                    <button type="submit" className="save-btn" disabled={savingProfile}>
                      <Save size={14} />
                      {savingProfile ? 'Sauvegarde...' : 'Sauvegarder'}
                    </button>
                  </div>
                )}
              </form>
            </>
          )}

          {/* ── SÉCURITÉ ── */}
          {activeTab === 'security' && (
            <>
              <p className="card-section-label"><Lock size={13} /> Sécurité & Accès</p>
              <h2 className="card-title">Changer le mot de passe</h2>
              <p className="card-subtitle">Utilisez un mot de passe fort d'au moins 8 caractères.</p>

              <form className="form" onSubmit={handleSavePassword}>
                <div className="field">
                  <label className="field-label">Mot de passe actuel</label>
                  <div className="input-wrap">
                    <Lock size={15} color="#CBD5E1" />
                    <input name="old_password" type={showPasswords ? 'text' : 'password'} value={passwords.old_password} onChange={handlePasswordChange} placeholder="••••••••" required />
                  </div>
                </div>

                <div className="field">
                  <label className="field-label">Nouveau mot de passe</label>
                  <div className="input-wrap">
                    <KeyRound size={15} color="#CBD5E1" />
                    <input name="new_password" type={showPasswords ? 'text' : 'password'} value={passwords.new_password} onChange={handlePasswordChange} placeholder="••••••••" required />
                  </div>
                  {passwords.new_password && (() => {
                    const lvl = getStrength(passwords.new_password);
                    return (
                      <div className="strength-bar">
                        <div className="strength-bg">
                          <div className="strength-fill" style={{ width: lvl.width, background: lvl.color }} />
                        </div>
                        <span className="strength-label" style={{ color: lvl.color }}>{lvl.label}</span>
                      </div>
                    );
                  })()}
                </div>

                <div className="field">
                  <label className="field-label">Confirmer le nouveau mot de passe</label>
                  <div className="input-wrap" style={{ borderColor: passwords.confirm_password && passwords.confirm_password !== passwords.new_password ? '#EF4444' : undefined }}>
                    <KeyRound size={15} color="#CBD5E1" />
                    <input name="confirm_password" type={showPasswords ? 'text' : 'password'} value={passwords.confirm_password} onChange={handlePasswordChange} placeholder="••••••••" required />
                  </div>
                  {passwords.confirm_password && passwords.confirm_password !== passwords.new_password && (
                    <span className="error-text">Les mots de passe ne correspondent pas</span>
                  )}
                  {passwords.confirm_password && passwords.confirm_password === passwords.new_password && (
                    <span className="success-text">Les mots de passe correspondent</span>
                  )}
                </div>

                <label className="show-pw-toggle">
                  <input type="checkbox" checked={showPasswords} onChange={() => setShowPasswords(!showPasswords)} />
                  Afficher les mots de passe
                </label>

                <div className="form-footer">
                  <button type="submit" className="save-btn" disabled={savingPassword}>
                    <Lock size={14} />
                    {savingPassword ? 'Modification...' : 'Changer le mot de passe'}
                  </button>
                </div>
              </form>
            </>
          )}

          {/* ── PRÉFÉRENCES ── */}
          {activeTab === 'preferences' && (
            <>
              <p className="card-section-label"><Settings2 size={13} /> Personnalisation</p>
              <h2 className="card-title">Préférences</h2>
              <p className="card-subtitle">Personnalisez votre expérience SmartRecruit.</p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>

                {/* Seuils */}
                <div className="pref-section">
                  <p className="pref-section-label"><BarChart2 size={12} style={{ display: 'inline', verticalAlign: 'middle', marginRight: 5 }} />Seuils de recommandation</p>
                  {[
                    { label: 'Prioritaire', key: 'priority', default: 75, color: '#10B981' },
                    { label: 'Possible',    key: 'possible', default: 55, color: '#4F46E5' },
                    { label: 'Réserve',     key: 'reserve',  default: 35, color: '#F59E0B' },
                  ].map((item) => (
                    <div key={item.key} className="pref-row">
                      <span className="pref-label" style={{ color: item.color }}>{item.label}</span>
                      <div className="pref-control">
                        <span className="pref-hint">Score ≥</span>
                        <input type="number" defaultValue={item.default} min="0" max="100" className="pref-input" />
                        <span className="pref-hint">/ 100</span>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="divider" />

                {/* Notifications */}
                <div className="pref-section">
                  <p className="pref-section-label"><Bell size={12} style={{ display: 'inline', verticalAlign: 'middle', marginRight: 5 }} />Notifications</p>
                  {[
                    { label: 'Analyse terminée',           desc: "Notifier quand l'IA finit une analyse" },
                    { label: 'Nouveau candidat prioritaire', desc: 'Alerte pour les scores > 75' },
                  ].map((item) => (
                    <div key={item.label} className="toggle-row">
                      <div>
                        <p className="toggle-label">{item.label}</p>
                        <p className="toggle-desc">{item.desc}</p>
                      </div>
                      <div className="toggle-track"><div className="toggle-thumb" /></div>
                    </div>
                  ))}
                </div>

                <div className="divider" />

                {/* Infos compte */}
                <div className="pref-section">
                  <p className="pref-section-label">Informations du compte</p>
                  <div className="info-grid">
                    {[
                      { label: 'Membre depuis', value: user?.created_at ? new Date(user.created_at).toLocaleDateString('fr-FR') : '-' },
                      { label: 'Rôle',          value: user?.role === 'admin' ? 'Administrateur' : 'Recruteur' },
                      { label: 'Statut',        value: 'Actif' },
                      { label: 'Version',       value: 'SmartRecruit v1.0' },
                    ].map((item) => (
                      <div key={item.label} className="info-item">
                        <span className="info-item-label">{item.label}</span>
                        <span className="info-item-value">{item.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="divider" />
              <div className="form-footer">
                <button className="save-btn" onClick={() => toast.success('Préférences sauvegardées !')}>
                  <Save size={14} /> Sauvegarder les préférences
                </button>
              </div>
            </>
          )}

        </div>
      </div>
    </>
  );
}

/* Mini icon helpers pour éviter des imports supplémentaires */
function Mail16({ color = '#64748B' }) {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="4" width="20" height="16" rx="2" /><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
    </svg>
  );
}
function Phone16({ color = '#64748B' }) {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.15 12a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.06 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" />
    </svg>
  );
}