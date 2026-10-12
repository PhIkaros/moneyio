import { useState } from 'react';
import { LayoutDashboard, BookOpen, CheckSquare, LogOut, BarChart3, Shield, Menu, X, BookMarked } from 'lucide-react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTranslation } from 'react-i18next';

const API_BASE = 'http://127.0.0.1:8000';

const FolderNavbar = () => {
	const { user, logout } = useAuth();
	const navigate = useNavigate();
	const { t } = useTranslation();
	const [mobileOpen, setMobileOpen] = useState(false);

	const navClass = ({ isActive }) =>
		`h-9 px-4 lg:px-5 rounded-full flex items-center gap-2 text-sm font-medium transition-all duration-200 whitespace-nowrap ${isActive
			? 'bg-[var(--primary)] text-white'
			: 'text-[var(--text-muted)] hover:bg-black/5'
		}`;

	const avatarUrl = user?.avatar
		? `${API_BASE}/storage/${user.avatar}`
		: null;

	const navLinks = (
		<>
			<NavLink to="/dashboard" className={navClass} onClick={() => setMobileOpen(false)}>
				<LayoutDashboard size={15} />
				<span>{t('nav.dashboard')}</span>
			</NavLink>
			<NavLink to="/ledger" className={navClass} onClick={() => setMobileOpen(false)}>
				<BookOpen size={15} />
				<span>{t('nav.ledger')}</span>
			</NavLink>
			<NavLink to="/checklists" className={navClass} onClick={() => setMobileOpen(false)}>
				<CheckSquare size={15} />
				<span>{t('nav.checklists')}</span>
			</NavLink>
			<NavLink to="/nikki" className={navClass} onClick={() => setMobileOpen(false)}>
				<BookMarked size={15} />
				<span>{t('nav.journal')}</span>
			</NavLink>
			<NavLink to="/statistics" className={navClass} onClick={() => setMobileOpen(false)}>
				<BarChart3 size={15} />
				<span>{t('nav.statistics')}</span>
			</NavLink>
			{user?.role === 'admin' && (
				<NavLink to="/admin" className={navClass} onClick={() => setMobileOpen(false)}>
					<Shield size={15} />
					<span>{t('nav.admin')}</span>
				</NavLink>
			)}
		</>
	);

	return (
		<div
			className="flex items-center justify-between w-full relative rounded-full px-4 py-2"
			style={{
				background: 'rgba(255,255,255,0.5)',
				backdropFilter: 'blur(16px)',
				border: '1px solid rgba(255,255,255,0.6)',
				boxShadow: '0 8px 24px rgba(20,73,63,0.06)',
			}}
		>

			{/* LEFT — Logo + Desktop Nav */}
			<div className="flex items-center gap-2">
				<div className="flex items-center gap-2.5 mr-4">
					<img src="/public/moneyiologo.png" width="64px" />
				</div>

				{/* Desktop nav */}
				<nav className="hidden md:flex items-center gap-1">
					{navLinks}
				</nav>
			</div>

			{/* RIGHT */}
			<div className="flex items-center gap-3">
				{/* Avatar */}
				<button
					onClick={() => { navigate('/profile'); setMobileOpen(false); }}
					className="w-9 h-9 rounded-full border-none cursor-pointer flex items-center justify-center overflow-hidden shrink-0"
					style={{
						background: avatarUrl ? 'transparent' : 'var(--primary)',
						color: 'white',
						fontWeight: 700,
						fontSize: '13px',
					}}
				>
					{avatarUrl ? (
						<img src={avatarUrl} alt="" className="w-full h-full object-cover" />
					) : (
						user?.name?.[0]?.toUpperCase() ?? 'U'
					)}
				</button>

				{/* Logout — desktop */}
				<button
					onClick={logout}
					className="hidden md:flex w-9 h-9 rounded-full items-center justify-center cursor-pointer"
					style={{
						background: 'rgba(255,255,255,0.6)',
						border: '1px solid rgba(255,255,255,0.7)',
					}}
					title={t('nav.logout')}
				>
					<LogOut size={14} style={{ color: 'var(--text-muted)' }} />
				</button>

				{/* Hamburger — mobile */}
				<button
					onClick={() => setMobileOpen(!mobileOpen)}
					className="md:hidden w-9 h-9 rounded-full flex items-center justify-center cursor-pointer"
					style={{
						background: 'rgba(255,255,255,0.6)',
						border: '1px solid rgba(255,255,255,0.7)',
					}}
				>
					{mobileOpen ? <X size={18} /> : <Menu size={18} />}
				</button>
			</div>

			{/* MOBILE MENU */}
			{mobileOpen && (
				<div
					className="absolute top-full left-0 right-0 mt-3 rounded-2xl p-4 flex flex-col gap-2 z-50 md:hidden"
					style={{
						background: 'var(--card)',
						border: '1px solid var(--border)',
						boxShadow: '0 16px 40px rgba(20,73,63,0.18)',
					}}
				>
					{navLinks}
					<div className="h-px my-1" style={{ background: 'var(--border)' }} />
					<button
						onClick={() => { logout(); setMobileOpen(false); }}
						className="h-10 px-5 rounded-full flex items-center gap-2 text-sm font-medium cursor-pointer border-none"
						style={{ background: '#fdecea', color: '#e05252' }}
					>
						<LogOut size={15} />
						<span>{t('nav.logout')}</span>
					</button>
				</div>
			)}
		</div>
	);
};

export default FolderNavbar;