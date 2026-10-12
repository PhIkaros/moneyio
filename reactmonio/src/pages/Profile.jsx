import { useState, useRef, useEffect } from 'react';
import { X, User, Lock, Camera, Palette, Check, ChevronRight, Globe, Wallet } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useTranslation } from 'react-i18next';
import api from '../api/axios';
import { createBudget, getBudgets, updateBudget } from '../services/budgetService';

const API_BASE = 'http://127.0.0.1:8000';

const Profile = () => {
	const navigate = useNavigate();
	const { user, updateUser } = useAuth();
	const { theme, setTheme, THEMES } = useTheme();
	const { t, i18n } = useTranslation();
	const fileRef = useRef(null);

	const [tab, setTab] = useState('profile');
	const [name, setName] = useState(user?.name ?? '');
	const [email, setEmail] = useState(user?.email ?? '');
	const [currentPw, setCurrentPw] = useState('');
	const [newPw, setNewPw] = useState('');
	const [confirmPw, setConfirmPw] = useState('');
	const [globalBudget, setGlobalBudget] = useState('');
	const [currentBudgetObj, setCurrentBudgetObj] = useState(null);
	const [saving, setSaving] = useState(false);
	const [msg, setMsg] = useState('');

	const avatarUrl = user?.avatar ? `${API_BASE}/storage/${user.avatar}` : null;

	useEffect(() => {
		getBudgets().then(data => {
			if (data && data.length > 0) {
				setCurrentBudgetObj(data[0]);
			}
		}).catch(console.error);
	}, []);

	const flash = (m) => { setMsg(m); setTimeout(() => setMsg(''), 3000); };

	const handleSaveProfile = async () => {
		setSaving(true);
		try {
			const res = await api.put('/profile', { name, email });
			updateUser(res.data);
			flash(t('profile.saved'));
		} catch (e) { flash(e?.response?.data?.message || t('common.error')); }
		finally { setSaving(false); }
	};

	const handleSavePassword = async () => {
		if (newPw !== confirmPw) { flash('Passwords do not match.'); return; }
		setSaving(true);
		try {
			await api.put('/profile/password', {
				current_password: currentPw,
				password: newPw,
				password_confirmation: confirmPw,
			});
			setCurrentPw(''); setNewPw(''); setConfirmPw('');
			flash(t('profile.passwordUpdated'));
		} catch (e) { flash(e?.response?.data?.message || t('common.error')); }
		finally { setSaving(false); }
	};

	const handleAvatarUpload = async (e) => {
		const file = e.target.files?.[0];
		if (!file) return;
		const fd = new FormData();
		fd.append('avatar', file);
		try {
			const res = await api.post('/profile/avatar', fd, {
				headers: { 'Content-Type': 'multipart/form-data' },
			});
			updateUser(res.data.user);
			flash(t('profile.avatarUploaded'));
		} catch (e) { flash(e?.response?.data?.message || t('common.error')); }
	};

	const handleSaveBudget = async () => {
		if (!globalBudget) return;
		setSaving(true);
		try {
			if (currentBudgetObj) {
				const res = await updateBudget(currentBudgetObj.id, { amount: globalBudget });
				setCurrentBudgetObj(res);
			} else {
				const now = new Date();
				const res = await createBudget({
					categorie_id: null,
					amount: globalBudget,
					month: now.getMonth() + 1,
					year: now.getFullYear(),
				});
				setCurrentBudgetObj(res);
			}
			setGlobalBudget('');
			flash(t('profile.saved'));
		} catch { flash(t('common.error')); }
		finally { setSaving(false); }
	};

	const handleLang = (lng) => {
		i18n.changeLanguage(lng);
		localStorage.setItem('locale', lng);
		api.put('/profile', { locale: lng }).catch(() => { });
	};

	const handleThemeChange = (id) => {
		setTheme(id);
		api.put('/profile', { theme: id }).catch(() => { });
	};

	const s = {
		card: { background: 'var(--card)', borderRadius: 20, padding: 24, border: '1px solid var(--border)' },
		input: {
			padding: '12px 16px', borderRadius: 14, border: '1px solid var(--border)',
			background: 'var(--input-bg)', color: 'var(--text)', fontSize: 14, outline: 'none',
			width: '100%', boxSizing: 'border-box',
		},
		label: { fontSize: 12, fontWeight: 700, color: 'var(--text-soft)', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: 6 },
		btn: {
			padding: '10px 20px', borderRadius: 20, background: 'var(--primary)', color: '#fff',
			fontSize: 13, fontWeight: 600, border: 'none', cursor: 'pointer',
			display: 'inline-flex', alignItems: 'center', gap: 6, opacity: saving ? 0.7 : 1,
		},
	};

	return (
		<div className="max-w-3xl mx-auto px-4 py-6">
			{/* Header */}
			<div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
				<div className="flex items-center gap-3">
					<button onClick={() => navigate(-1)}
						className="w-9 h-9 rounded-full flex items-center justify-center cursor-pointer"
						style={{ border: '1px solid var(--border)', background: 'var(--card)', color: 'var(--text)' }}>
						<X size={16} />
					</button>
					<div className="flex items-center gap-2 px-4 py-1.5 rounded-full" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
						<span className="text-sm font-medium" style={{ color: 'var(--text-soft)' }}>{t('profile.settings')}</span>
						<ChevronRight size={14} style={{ color: 'var(--text-muted)' }} />
						<span className="text-sm font-bold" style={{ color: 'var(--text)' }}>{t('profile.title')}</span>
					</div>
				</div>

				<div className="flex gap-2">
					{[
						{ id: 'profile', icon: User, label: t('profile.title') },
						{ id: 'prefs', icon: Wallet, label: t('profile.preferences') },
					].map(tb => (
						<button key={tb.id} onClick={() => setTab(tb.id)}
							className="px-4 py-2 rounded-full text-xs font-semibold flex items-center gap-1.5 border-none cursor-pointer transition-all"
							style={{
								background: tab === tb.id ? 'var(--primary)' : 'var(--card)',
								color: tab === tb.id ? '#fff' : 'var(--text)',
								border: tab === tb.id ? 'none' : '1px solid var(--border)',
							}}>
							<tb.icon size={14} /> {tb.label}
						</button>
					))}
				</div>
			</div>

			{/* Toast */}
			{msg && (
				<div className="mb-4 px-4 py-2.5 rounded-xl text-sm font-medium animate-[slideUp_0.2s_ease-out]"
					style={{ background: msg.includes('!') ? '#edf7e6' : '#fdecea', color: msg.includes('!') ? '#2d6b1a' : '#e05252' }}>
					{msg}
				</div>
			)}

			{tab === 'profile' && (
				<div className="flex flex-col gap-8">
					{/* Avatar */}
					<div className="grid grid-cols-1 md:grid-cols-[200px_1fr] gap-6">
						<div>
							<p className="text-lg font-bold" style={{ color: 'var(--text)' }}>{t('profile.profilePicture')}</p>
							<p className="text-xs mt-1" style={{ color: 'var(--text-soft)' }}>{t('profile.profilePictureDesc')}</p>
						</div>
						<div style={s.card} className="flex items-center gap-6 flex-wrap">
							<div className="w-20 h-20 rounded-full overflow-hidden flex items-center justify-center shrink-0"
								style={{ background: avatarUrl ? 'transparent' : 'var(--primary)', color: '#fff', fontSize: 28, fontWeight: 700 }}>
								{avatarUrl
									? <img src={avatarUrl} alt="" className="w-full h-full object-cover" />
									: (user?.name?.[0]?.toUpperCase() ?? 'U')}
							</div>
							<div className="flex gap-2">
								<input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload} />
								<button onClick={() => fileRef.current?.click()} style={s.btn}>
									<Camera size={14} /> {t('profile.uploadPhoto')}
								</button>
							</div>
						</div>
					</div>

					{/* Account */}
					<div className="grid grid-cols-1 md:grid-cols-[200px_1fr] gap-6">
						<div>
							<p className="text-lg font-bold" style={{ color: 'var(--text)' }}>{t('profile.accountDetails')}</p>
							<p className="text-xs mt-1" style={{ color: 'var(--text-soft)' }}>{t('profile.accountDesc')}</p>
						</div>
						<div style={s.card}>
							<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
								<div>
									<label style={s.label}>{t('profile.username')}</label>
									<input style={s.input} value={name} onChange={e => setName(e.target.value)} />
								</div>
								<div>
									<label style={s.label}>{t('profile.email')}</label>
									<input style={s.input} type="email" value={email} onChange={e => setEmail(e.target.value)} />
								</div>
							</div>
							<button onClick={handleSaveProfile} style={{ ...s.btn, marginTop: 20 }} disabled={saving}>
								<Check size={14} /> {t('profile.saveChanges')}
							</button>
						</div>
					</div>

					{/* Password */}
					<div className="grid grid-cols-1 md:grid-cols-[200px_1fr] gap-6">
						<div>
							<p className="text-lg font-bold" style={{ color: 'var(--text)' }}>{t('profile.security')}</p>
							<p className="text-xs mt-1" style={{ color: 'var(--text-soft)' }}>{t('profile.securityDesc')}</p>
						</div>
						<div style={s.card}>
							<div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
								<div>
									<label style={s.label}>{t('profile.currentPassword')}</label>
									<input style={s.input} type="password" value={currentPw} onChange={e => setCurrentPw(e.target.value)} placeholder="••••••••" />
								</div>
								<div>
									<label style={s.label}>{t('profile.newPassword')}</label>
									<input style={s.input} type="password" value={newPw} onChange={e => setNewPw(e.target.value)} placeholder="••••••••" />
								</div>
								<div>
									<label style={s.label}>{t('profile.confirmPassword')}</label>
									<input style={s.input} type="password" value={confirmPw} onChange={e => setConfirmPw(e.target.value)} placeholder="••••••••" />
								</div>
							</div>
							<button onClick={handleSavePassword} style={{ ...s.btn, marginTop: 20 }} disabled={saving}>
								<Lock size={14} /> {t('profile.updatePassword')}
							</button>
						</div>
					</div>
				</div>
			)}

			{tab === 'prefs' && (
				<div className="flex flex-col gap-8">
					{/* Budget */}
					<div className="grid grid-cols-1 md:grid-cols-[200px_1fr] gap-6">
						<div>
							<p className="text-lg font-bold" style={{ color: 'var(--text)' }}>{t('profile.budgetSettings')}</p>
							<p className="text-xs mt-1" style={{ color: 'var(--text-soft)' }}>{t('profile.budgetDesc')}</p>
						</div>
						<div style={s.card}>
							<div style={{ maxWidth: 300 }}>
								<label style={s.label}>{t('profile.globalBudget')}</label>
								<input style={s.input} type="number" value={globalBudget} onChange={e => setGlobalBudget(e.target.value)} placeholder="e.g. 3000" />
								{currentBudgetObj && (
									<p className="text-[11px] mt-2 font-medium" style={{ color: 'var(--text-soft)' }}>
										{t('profile.currentBudgetIs', { amount: `${currentBudgetObj.amount} ${user?.currency || '$'}` })}
									</p>
								)}
							</div>
							<button onClick={handleSaveBudget} style={{ ...s.btn, marginTop: 20 }} disabled={saving}>
								<Check size={14} /> {t('profile.saveBudget')}
							</button>
						</div>
					</div>

					{/* Currency */}
					<div className="grid grid-cols-1 md:grid-cols-[200px_1fr] gap-6">
						<div>
							<p className="text-lg font-bold" style={{ color: 'var(--text)' }}>Currency</p>
							<p className="text-xs mt-1" style={{ color: 'var(--text-soft)' }}>Choose your preferred currency</p>
						</div>
						<div style={s.card}>
							<div className="flex gap-3">
								{['MAD', 'USD', 'EUR', 'GBP'].map(c => (
									<button key={c} onClick={() => {
										api.put('/profile', { currency: c }).then(res => {
											updateUser(res.data);
											flash('Currency updated');
										}).catch(() => flash('Failed to update currency'));
									}}
										className="px-5 py-2.5 rounded-xl text-sm font-semibold cursor-pointer transition-all"
										style={{
											background: user?.currency === c ? 'var(--primary)' : 'var(--input-bg)',
											color: user?.currency === c ? '#fff' : 'var(--text)',
											border: user?.currency === c ? 'none' : '1px solid var(--border)',
										}}>
										{c}
									</button>
								))}
							</div>
						</div>
					</div>

					{/* Theme */}
					<div className="grid grid-cols-1 md:grid-cols-[200px_1fr] gap-6">
						<div>
							<p className="text-lg font-bold" style={{ color: 'var(--text)' }}>{t('profile.appearance')}</p>
							<p className="text-xs mt-1" style={{ color: 'var(--text-soft)' }}>{t('profile.appearanceDesc')}</p>
						</div>
						<div style={s.card}>
							<div className="flex flex-wrap gap-3">
								{THEMES.map(t_ => (
									<button key={t_.id} onClick={() => handleThemeChange(t_.id)}
										className="flex flex-col items-center gap-2 p-3 rounded-2xl cursor-pointer transition-all"
										style={{
											border: theme === t_.id ? '2px solid var(--primary)' : '2px solid var(--border)',
											background: theme === t_.id ? 'var(--input-bg)' : 'transparent',
											minWidth: 70,
										}}>
										<div className="w-10 h-7 rounded-lg relative overflow-hidden" style={{ background: '#f0f0f0', border: '1px solid rgba(0,0,0,0.06)' }}>
											<div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: '40%', background: t_.color }} />
										</div>
										<span className="text-xs font-bold" style={{ color: 'var(--text)' }}>{t_.label}</span>
									</button>
								))}
							</div>
						</div>
					</div>

					{/* Language */}
					<div className="grid grid-cols-1 md:grid-cols-[200px_1fr] gap-6">
						<div>
							<p className="text-lg font-bold" style={{ color: 'var(--text)' }}>{t('profile.language')}</p>
							<p className="text-xs mt-1" style={{ color: 'var(--text-soft)' }}>{t('profile.languageDesc')}</p>
						</div>
						<div style={s.card}>
							<div className="flex gap-3">
								{[{ code: 'en', label: '🇬🇧 English' }, { code: 'fr', label: '🇫🇷 Français' }].map(lng => (
									<button key={lng.code} onClick={() => handleLang(lng.code)}
										className="px-5 py-2.5 rounded-xl text-sm font-semibold cursor-pointer transition-all"
										style={{
											background: i18n.language === lng.code ? 'var(--primary)' : 'var(--input-bg)',
											color: i18n.language === lng.code ? '#fff' : 'var(--text)',
											border: i18n.language === lng.code ? 'none' : '1px solid var(--border)',
										}}>
										{lng.label}
									</button>
								))}
							</div>
						</div>
					</div>
				</div>
			)}

			<style>{`@keyframes slideUp { from { opacity:0; transform:translateY(8px) } to { opacity:1; transform:translateY(0) } }`}</style>
		</div>
	);
};

export default Profile;