import { useState, useRef, useEffect } from 'react';
import { ChevronLeft, ChevronRight, ChevronDown, Plus, Layers } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const ACCOUNT_THEMES = {
	bank: { from: '#1a6b60', to: '#2a9d8f', accent: '#8CC850', label: 'Bank' },
	cash: { from: '#2d6a4f', to: '#52b788', accent: '#b7e4c7', label: 'Cash' },
	savings: { from: '#184e77', to: '#1e96c8', accent: '#90e0ef', label: 'Savings' },
	default: { from: '#3d405b', to: '#606274', accent: '#e2c275', label: 'Account' },
};
const getTheme = (type) => ACCOUNT_THEMES[type?.toLowerCase()] || ACCOUNT_THEMES.default;

const safeAmount = (val) => parseFloat(val) || 0;

const CardStack = ({ comptes, activeIndex, onSelect, onAdd, onNewAccount, dropdownOpen, setDropdownOpen }) => {
	const { user } = useAuth();
	const currency = user?.currency || 'MAD';
	const [animDir, setAnimDir] = useState(null);
	const [isAnimating, setIsAnimating] = useState(false);
	const timeoutRef = useRef(null);

	const isAll = activeIndex === -1;
	const count = comptes.length;

	const navigate = (dir) => {
		if (isAnimating) return;
		setAnimDir(dir);
		setIsAnimating(true);
		timeoutRef.current = setTimeout(() => {
			if (dir === 'right') {
				if (activeIndex === -1) onSelect(0);
				else if (activeIndex === count - 1) onSelect(-1);
				else onSelect(activeIndex + 1);
			} else {
				if (activeIndex === -1) onSelect(count - 1);
				else if (activeIndex === 0) onSelect(-1);
				else onSelect(activeIndex - 1);
			}
			setAnimDir(null);
			setIsAnimating(false);
		}, 280);
	};

	useEffect(() => () => clearTimeout(timeoutRef.current), []);

	const active = isAll ? null : comptes[activeIndex];
	const theme = active ? getTheme(active.type) : { from: '#1a3830', to: '#2a9d8f', accent: '#8CC850' };

	const peekCards = comptes.filter((_, i) => !isAll && i !== activeIndex).slice(0, 2);

	return (
		<div className="rounded-2xl p-5 shadow-sm" style={{ background: 'var(--card)' }}>

			{/* Header */}
			<div className="flex items-center justify-between mb-3">
				<div className="relative">
					<button
						onClick={() => setDropdownOpen(v => !v)}
						className="flex items-center gap-1.5 cursor-pointer border-none bg-transparent p-0 group"
					>
						<h3 className="text-base font-bold group-hover:text-[var(--primary-light)] transition-colors"
							style={{ color: 'var(--text)' }}>
							{isAll ? 'All Accounts' : (comptes[activeIndex]?.name || 'My Card')}
						</h3>
						<ChevronDown size={14} style={{ color: 'var(--text-muted)' }}
							className="transition-transform duration-200"
							style={{ transform: dropdownOpen ? 'rotate(180deg)' : 'rotate(0deg)', color: 'var(--text-muted)' }} />
					</button>

					{/* Dropdown */}
					{dropdownOpen && (
						<div className="absolute top-full left-0 mt-2 rounded-xl shadow-xl z-20 min-w-[180px] py-1 overflow-hidden"
							style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>

							<button
								onClick={() => { onSelect(-1); setDropdownOpen(false); }}
								className="w-full flex items-center gap-2.5 px-3 py-2.5 text-left text-sm transition-colors cursor-pointer border-none"
								style={{
									background: isAll ? 'var(--input-bg)' : 'transparent',
									color: isAll ? 'var(--primary)' : 'var(--text-soft)',
									fontWeight: isAll ? 600 : 500,
								}}>
								<Layers size={13} className="shrink-0" />
								All Accounts
							</button>

							{comptes.map((c, i) => {
								const t = getTheme(c.type);
								const isActive = activeIndex === i;
								return (
									<button key={c.id}
										onClick={() => { onSelect(i); setDropdownOpen(false); }}
										className="w-full flex items-center gap-2.5 px-3 py-2.5 text-left text-sm transition-colors cursor-pointer border-none"
										style={{
											background: isActive ? 'var(--input-bg)' : 'transparent',
											color: isActive ? t.from : 'var(--text-soft)',
											fontWeight: isActive ? 600 : 500,
										}}>
										<div className="w-2 h-2 rounded-full shrink-0" style={{ background: t.from }} />
										{c.name}
									</button>
								);
							})}

							<div style={{ borderTop: '1px solid var(--border)' }} className="mt-1 pt-1">
								<button
									onClick={() => { onNewAccount(); setDropdownOpen(false); }}
									className="w-full flex items-center gap-2.5 px-3 py-2.5 text-left text-sm font-medium transition-colors cursor-pointer border-none"
									style={{ color: 'var(--primary-light)', background: 'transparent' }}>
									<Plus size={13} />
									New Account
								</button>
							</div>
						</div>
					)}
				</div>

				<button onClick={onNewAccount}
					className="flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold transition-colors cursor-pointer border-none"
					style={{ color: 'var(--primary-light)', background: 'var(--input-bg)' }}>
					<Plus size={10} /> New
				</button>
			</div>

			{/* Card stack */}
			<div className="relative" style={{ height: '148px' }}>

				{/* Peek cards behind */}
				{!isAll && peekCards.map((_, i) => (
					<div key={i}
						className="absolute inset-x-0 rounded-[18px] transition-all duration-300"
						style={{
							height: '112px',
							top: `${(peekCards.length - i) * 6}px`,
							left: `${(peekCards.length - i) * 5}px`,
							right: `${(peekCards.length - i) * 5}px`,
							background: i === 0 ? '#c5e0db' : '#dceee9',
							opacity: 0.6 - i * 0.15,
							zIndex: i,
						}}
					/>
				))}

				{/* Main card */}
				<div
					className="absolute inset-x-0 top-0 rounded-[18px] overflow-hidden flex flex-col justify-between p-4"
					style={{
						height: '112px',
						zIndex: 10,
						background: `linear-gradient(135deg, ${theme.from}, ${theme.to})`,
						transform: animDir === 'left'
							? 'translateX(-18px) scale(0.97)'
							: animDir === 'right'
								? 'translateX(18px) scale(0.97)'
								: 'translateX(0) scale(1)',
						opacity: isAnimating ? 0.7 : 1,
						transition: 'transform 0.28s cubic-bezier(.4,0,.2,1), opacity 0.28s',
					}}
				>
					{/* Decorative circles */}
					<div className="absolute -right-6 -top-6 w-32 h-32 rounded-full pointer-events-none"
						style={{ background: `${theme.accent}22` }} />
					<div className="absolute -right-2 top-8 w-16 h-16 rounded-full pointer-events-none"
						style={{ background: `${theme.accent}15` }} />

					{/* Top row */}
					<div className="flex items-start justify-between relative">
						{isAll
							? <div className="flex items-center gap-1.5">
								<Layers size={13} className="text-white/70" />
								<span className="text-[11px] text-white/70 font-medium">All Accounts</span>
							</div>
							: <span className="text-[11px] text-white/70 font-medium">Total Balance</span>
						}
						<button onClick={onAdd}
							className="w-8 h-8 rounded-full flex items-center justify-center shadow-lg cursor-pointer border-none"
							style={{ background: theme.accent }}>
							<Plus size={16} className="text-white" />
						</button>
					</div>

					{/* Balance */}
					<div className="relative">
						<h2 className="text-xl font-bold text-white tracking-tight">
							{isAll
								? `${comptes.reduce((s, c) => s + safeAmount(c.balance), 0).toLocaleString('en-US', { minimumFractionDigits: 2 })} ${currency}`
								: `${safeAmount(active?.balance).toLocaleString('en-US', { minimumFractionDigits: 2 })} ${currency}`
							}
						</h2>
						<div className="flex items-center justify-between mt-1">
							<span className="text-[11px] text-white/60 tracking-wide">
								{isAll ? `${count} account${count !== 1 ? 's' : ''}` : active?.name}
							</span>
							{!isAll && (
								<span className="text-[10px] px-2 py-0.5 rounded-full font-semibold"
									style={{ background: `${theme.accent}33`, color: theme.accent }}>
									{active?.type?.toUpperCase()}
								</span>
							)}
						</div>
					</div>
				</div>
			</div>

			{/* Nav row: dots + arrows */}
			<div className="flex items-center justify-between mt-3">
				<div className="flex items-center gap-1.5">
					{/* All dot */}
					<button onClick={() => onSelect(-1)}
						className="transition-all duration-200 rounded-full border-none cursor-pointer p-0"
						style={{
							width: activeIndex === -1 ? '20px' : '6px',
							height: '6px',
							background: activeIndex === -1 ? 'var(--primary)' : 'var(--border)',
						}} />
					{/* Per-account dots */}
					{comptes.map((c, i) => (
						<button key={c.id} onClick={() => onSelect(i)}
							className="transition-all duration-200 rounded-full border-none cursor-pointer p-0"
							style={{
								width: activeIndex === i ? '20px' : '6px',
								height: '6px',
								background: activeIndex === i ? getTheme(c.type).from : 'var(--border)',
							}} />
					))}
				</div>

				<div className="flex items-center gap-1">
					<button onClick={() => navigate('left')}
						className="w-7 h-7 rounded-full flex items-center justify-center cursor-pointer transition-colors border"
						style={{ background: 'var(--card)', borderColor: 'var(--border)' }}>
						<ChevronLeft size={14} style={{ color: 'var(--text-soft)' }} />
					</button>
					<button onClick={() => navigate('right')}
						className="w-7 h-7 rounded-full flex items-center justify-center cursor-pointer transition-colors border"
						style={{ background: 'var(--card)', borderColor: 'var(--border)' }}>
						<ChevronRight size={14} style={{ color: 'var(--text-soft)' }} />
					</button>
				</div>
			</div>
		</div>
	);
};

export default CardStack;