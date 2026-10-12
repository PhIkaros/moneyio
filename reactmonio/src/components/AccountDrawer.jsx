import { useState, useEffect, useRef } from 'react';
import {
	X, CreditCard, Wallet, PiggyBank, Landmark, Bitcoin,
	Smartphone, Banknote, TrendingUp, Building2, CircleDollarSign,
	Layers, Plus, Check,
} from 'lucide-react';
import api from '../api/axios';

// ── Account type config (matches Dashboard themes) ────────────────────────────
const TYPE_OPTIONS = [
	{ value: 'bank', label: 'Bank', desc: 'PayPal, crypto, cards…', gradient: ['#1a6b60', '#2a9d8f'], accent: '#8CC850' },
	{ value: 'cash', label: 'Cash', desc: 'Pocket money, transport…', gradient: ['#2d6a4f', '#52b788'], accent: '#b7e4c7' },
	{ value: 'savings', label: 'Savings', desc: 'Emergency fund, goals…', gradient: ['#184e77', '#1e96c8'], accent: '#90e0ef' },
];

// ── Icon options (lucide-react, all finance-relevant) ─────────────────────────
const ICON_OPTIONS = [
	{ id: 'credit-card', Icon: CreditCard, label: 'Card' },
	{ id: 'wallet', Icon: Wallet, label: 'Wallet' },
	{ id: 'piggy-bank', Icon: PiggyBank, label: 'Savings' },
	{ id: 'landmark', Icon: Landmark, label: 'Bank' },
	{ id: 'bitcoin', Icon: Bitcoin, label: 'Crypto' },
	{ id: 'smartphone', Icon: Smartphone, label: 'Mobile' },
	{ id: 'banknote', Icon: Banknote, label: 'Cash' },
	{ id: 'trending-up', Icon: TrendingUp, label: 'Invest' },
	{ id: 'building', Icon: Building2, label: 'Business' },
	{ id: 'dollar-circle', Icon: CircleDollarSign, label: 'Dollar' },
];

const getTypeConfig = (type) => TYPE_OPTIONS.find(t => t.value === type) || TYPE_OPTIONS[0];
const getIconComponent = (id) => ICON_OPTIONS.find(i => i.id === id)?.Icon || CreditCard;

// ── Live Card Preview ─────────────────────────────────────────────────────────
const CardPreview = ({ name, type, iconId, balance }) => {
	const cfg = getTypeConfig(type);
	const IconComp = getIconComponent(iconId);
	const [from, to] = cfg.gradient;

	return (
		<div
			className="relative rounded-[20px] flex flex-col justify-between p-5 select-none"
			style={{
			//	height: '50%',
				background: `linear-gradient(135deg, ${from}, ${to})`,
				boxShadow: `0 12px 40px ${from}55`,
			}}
		>
			{/* Decorative circles */}
			<div className="absolute -right-6 -top-6 w-32 h-32 rounded-full pointer-events-none"
				style={{ background: `${cfg.accent}22` }} />
			<div className="absolute -right-2 top-10 w-16 h-16 rounded-full pointer-events-none"
				style={{ background: `${cfg.accent}18` }} />

			{/* Top row */}
			<div className="flex items-center justify-between relative">
				<div className="flex items-center gap-2">
					<div className="w-7 h-7 rounded-lg flex items-center justify-center"
						style={{ background: `${cfg.accent}30` }}>
						<IconComp size={14} style={{ color: cfg.accent }} />
					</div>
					<span className="text-[11px] font-semibold text-white/70">
						{name || 'Account name'}
					</span>
				</div>
				<span className="text-[10px] px-2 py-0.5 rounded-full font-bold"
					style={{ background: `${cfg.accent}30`, color: cfg.accent }}>
					{cfg.label.toUpperCase()}
				</span>
			</div>

			{/* Balance */}
			<div className="relative">
				<p className="text-[10px] text-white/50 mb-0.5">Opening balance</p>
				<h2 className="text-[22px] font-bold text-white tracking-tight leading-none">
					${parseFloat(balance || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}
				</h2>
			</div>
		</div>
	);
};

// ── AccountDrawer ─────────────────────────────────────────────────────────────
const AccountDrawer = ({ isOpen, onClose, onSuccess }) => {
	const [form, setForm] = useState({
		name: '',
		type: 'bank',
		icon: 'credit-card',
		balance: '',
	});
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState('');
	const [shake, setShake] = useState(false);

	const nameRef = useRef(null);

	// Focus name input when drawer opens
	useEffect(() => {
		if (isOpen) {
			setTimeout(() => nameRef.current?.focus(), 350);
			setError('');
		}
	}, [isOpen]);

	// Close on Escape
	useEffect(() => {
		const handler = (e) => { if (e.key === 'Escape') onClose(); };
		window.addEventListener('keydown', handler);
		return () => window.removeEventListener('keydown', handler);
	}, [onClose]);

	const set = (key, val) => setForm(f => ({ ...f, [key]: val }));

	const triggerShake = () => {
		setShake(true);
		setTimeout(() => setShake(false), 500);
	};

	const handleSubmit = async () => {
		if (!form.name.trim()) {
			setError('Account name is required.');
			triggerShake();
			nameRef.current?.focus();
			return;
		}
		if (form.balance === '' || isNaN(parseFloat(form.balance))) {
			setError('Please enter a valid opening balance.');
			triggerShake();
			return;
		}

		setLoading(true);
		setError('');
		try {
			const res = await api.post('/comptes', {
				name: form.name.trim(),
				type: form.type,
				balance: parseFloat(form.balance),
				icon: form.icon,           // stored in DB if your schema supports it
			});
			onSuccess(res.data);
			onClose();
			setForm({ name: '', type: 'bank', icon: 'credit-card', balance: '' });
		} catch (e) {
			console.error(e);
			setError(e?.response?.data?.message || 'Something went wrong.');
			triggerShake();
		} finally {
			setLoading(false);
		}
	};

	return (
		<>
			{/* Backdrop */}
			<div
				className="fixed inset-0 z-40 transition-all duration-300"
				style={{
					background: 'rgba(26,56,48,0.35)',
					backdropFilter: isOpen ? 'blur(4px)' : 'none',
					opacity: isOpen ? 1 : 0,
					pointerEvents: isOpen ? 'auto' : 'none',
				}}
				onClick={onClose}
			/>

			{/* Drawer */}
			<div
				className="fixed top-0 right-0 h-full z-50 flex flex-col bg-[#f4faf7] shadow-2xl"
				style={{
					width: '380px',
					transform: isOpen ? 'translateX(0)' : 'translateX(100%)',
					transition: 'transform 0.35s cubic-bezier(.4,0,.2,1)',
				}}
			>
				{/* Header */}
				<div className="flex items-center justify-between px-6 pt-7 pb-4 border-b border-[#e0eeea]">
					<div>
						<h2 className="text-[17px] font-bold text-[#1a3830]">New Account</h2>
						<p className="text-[11px] text-[#8aada6] mt-0.5">Add a bank, cash, or savings account</p>
					</div>
					<button onClick={onClose}
						className="w-8 h-8 rounded-full flex items-center justify-center bg-white border border-[#e0eeea] cursor-pointer hover:bg-[#e8f5f1] transition-colors">
						<X size={15} className="text-[#5a8880]" />
					</button>
				</div>

				{/* Scrollable body */}
				<div className="flex-1 overflow-y-auto px-6 py-5 flex flex-col gap-6">

					{/* Live preview */}
					<CardPreview
						name={form.name}
						type={form.type}
						iconId={form.icon}
						balance={form.balance}
					/>

					{/* Account name */}
					<div>
						<label className="text-[11px] font-semibold text-[#5a8880] uppercase tracking-wider mb-1.5 block">
							Account Name
						</label>
						<input
							ref={nameRef}
							type="text"
							value={form.name}
							onChange={e => set('name', e.target.value)}
							placeholder="e.g. PayPal, Pocket Money, CIH…"
							className="w-full bg-white border border-[#ddeee8] rounded-xl px-4 py-3 text-sm text-[#1a3830] placeholder-[#b0cbc5] outline-none focus:border-[#2a9d8f] focus:ring-2 focus:ring-[#2a9d8f]/15 transition-all"
						/>
					</div>

					{/* Account type */}
					<div>
						<label className="text-[11px] font-semibold text-[#5a8880] uppercase tracking-wider mb-1.5 block">
							Account Type
						</label>
						<div className="flex flex-col gap-2">
							{TYPE_OPTIONS.map(opt => {
								const active = form.type === opt.value;
								const [from] = opt.gradient;
								return (
									<button
										key={opt.value}
										onClick={() => set('type', opt.value)}
										className="flex items-center gap-3 px-4 py-3 rounded-xl border-2 text-left transition-all cursor-pointer w-full"
										style={{
											borderColor: active ? from : '#e0eeea',
											background: active ? `${from}10` : 'white',
										}}
									>
										<div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-all"
											style={{ background: active ? `${from}20` : '#f0f7f4' }}>
											<div className="w-2.5 h-2.5 rounded-full transition-all"
												style={{ background: active ? from : '#c8ddd9' }} />
										</div>
										<div className="flex-1">
											<p className="text-sm font-semibold transition-colors"
												style={{ color: active ? from : '#2d4a45' }}>
												{opt.label}
											</p>
											<p className="text-[10px] text-[#8aada6]">{opt.desc}</p>
										</div>
										{active && (
											<div className="w-5 h-5 rounded-full flex items-center justify-center"
												style={{ background: from }}>
												<Check size={11} className="text-white" />
											</div>
										)}
									</button>
								);
							})}
						</div>
					</div>

					{/* Icon picker */}
					<div>
						<label className="text-[11px] font-semibold text-[#5a8880] uppercase tracking-wider mb-1.5 block">
							Icon
						</label>
						<div className="grid grid-cols-5 gap-2">
							{ICON_OPTIONS.map(({ id, Icon, label }) => {
								const active = form.icon === id;
								const cfg = getTypeConfig(form.type);
								const [from] = cfg.gradient;
								return (
									<button
										key={id}
										onClick={() => set('icon', id)}
										title={label}
										className="flex flex-col items-center gap-1 py-2.5 rounded-xl border-2 transition-all cursor-pointer"
										style={{
											borderColor: active ? from : '#e0eeea',
											background: active ? `${from}12` : 'white',
										}}
									>
										<Icon size={18} style={{ color: active ? from : '#8aada6' }} />
										<span className="text-[9px] font-medium transition-colors"
											style={{ color: active ? from : '#afc8c3' }}>
											{label}
										</span>
									</button>
								);
							})}
						</div>
					</div>

					{/* Opening balance */}
					<div>
						<label className="text-[11px] font-semibold text-[#5a8880] uppercase tracking-wider mb-1.5 block">
							Opening Balance
						</label>
						<div className="relative">
							<span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-bold text-[#8aada6]">$</span>
							<input
								type="number"
								min="0"
								step="0.01"
								value={form.balance}
								onChange={e => set('balance', e.target.value)}
								placeholder="0.00"
								className="w-full bg-white border border-[#ddeee8] rounded-xl pl-8 pr-4 py-3 text-sm text-[#1a3830] placeholder-[#b0cbc5] outline-none focus:border-[#2a9d8f] focus:ring-2 focus:ring-[#2a9d8f]/15 transition-all"
							/>
						</div>
						<p className="text-[10px] text-[#afc8c3] mt-1.5 pl-1">
							Enter your current balance. You can always edit this later.
						</p>
					</div>

					{/* Error */}
					{error && (
						<div
							className="text-[12px] text-[#e05252] bg-[#fdecea] rounded-xl px-4 py-3 font-medium"
							style={{
								animation: shake ? 'shake 0.4s cubic-bezier(.36,.07,.19,.97)' : 'none',
							}}
						>
							{error}
						</div>
					)}
				</div>

				{/* Footer */}
				<div className="px-6 pb-7 pt-4 border-t border-[#e0eeea] flex gap-3">
					<button
						onClick={onClose}
						className="flex-1 py-3 rounded-xl border border-[#ddeee8] text-sm font-semibold text-[#5a8880] bg-white hover:bg-[#f0f7f4] transition-colors cursor-pointer">
						Cancel
					</button>
					<button
						onClick={handleSubmit}
						disabled={loading}
						className="flex-1 py-3 rounded-xl text-sm font-bold text-white transition-all cursor-pointer border-none flex items-center justify-center gap-2"
						style={{
							background: loading
								? '#8aada6'
								: `linear-gradient(135deg, ${getTypeConfig(form.type).gradient[0]}, ${getTypeConfig(form.type).gradient[1]})`,
							boxShadow: loading ? 'none' : `0 6px 20px ${getTypeConfig(form.type).gradient[0]}44`,
						}}
					>
						{loading
							? <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
							: <><Plus size={15} /> Add Account</>
						}
					</button>
				</div>
			</div>

			<style>{`
				@keyframes shake {
					10%, 90% { transform: translateX(-2px); }
					20%, 80% { transform: translateX(3px); }
					30%, 50%, 70% { transform: translateX(-4px); }
					40%, 60% { transform: translateX(4px); }
				}
			`}</style>
		</>
	);
};

export default AccountDrawer;