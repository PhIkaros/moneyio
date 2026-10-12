import { useState } from 'react';
import { X, Wallet, Building2, PiggyBank } from 'lucide-react';
import api from '../../api/axios';

const TYPES = [
	{ value: 'bank', label: 'Bank', icon: Building2, from: '#1a6b60', to: '#2a9d8f', accent: '#8CC850' },
	{ value: 'cash', label: 'Cash', icon: Wallet, from: '#2d6a4f', to: '#52b788', accent: '#b7e4c7' },
	{ value: 'savings', label: 'Savings', icon: PiggyBank, from: '#184e77', to: '#1e96c8', accent: '#90e0ef' },
];

const AccountDrawer = ({ isOpen, onClose, onSuccess }) => {
	const [form, setForm] = useState({ name: '', type: 'bank', balance: '' });
	const [saving, setSaving] = useState(false);
	const [error, setError] = useState('');

	const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

	const selectedType = TYPES.find(t => t.value === form.type);

	const handleSave = async () => {
		if (!form.name.trim()) { setError('Account name is required.'); return; }
		if (form.balance === '') { setError('Starting balance is required.'); return; }
		if (parseFloat(form.balance) < 0) { setError('Balance cannot be negative.'); return; }

		setSaving(true);
		setError('');
		try {
			const res = await api.post('/comptes', {
				name: form.name.trim(),
				type: form.type,
				balance: parseFloat(form.balance),
			});
			onSuccess(res.data);
			setForm({ name: '', type: 'bank', balance: '' });
			onClose();
		} catch (e) {
			setError(e?.response?.data?.message || 'Something went wrong.');
		} finally { setSaving(false); }
	};

	const handleClose = () => {
		setForm({ name: '', type: 'bank', balance: '' });
		setError('');
		onClose();
	};

	return (
		<>
			{/* Backdrop */}
			<div
				onClick={handleClose}
				className="fixed inset-0 bg-black/25 backdrop-blur-sm z-40 transition-opacity duration-300"
				style={{ opacity: isOpen ? 1 : 0, pointerEvents: isOpen ? 'auto' : 'none' }}
			/>

			{/* Drawer panel */}
			<div
				className="fixed top-0 right-0 h-full w-full max-w-sm z-50 flex flex-col shadow-2xl transition-transform duration-300 ease-[cubic-bezier(.4,0,.2,1)]"
				style={{
					background: 'var(--card)',
					transform: isOpen ? 'translateX(0)' : 'translateX(100%)',
				}}
			>
				{/* Header */}
				<div className="flex items-center justify-between px-6 py-5"
					style={{ borderBottom: '1px solid var(--border)' }}>
					<div>
						<h2 className="text-base font-bold" style={{ color: 'var(--text)' }}>New Account</h2>
						<p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>Add a bank, cash or savings account</p>
					</div>
					<button onClick={handleClose}
						className="w-8 h-8 rounded-full flex items-center justify-center border-none cursor-pointer transition-colors"
						style={{ background: 'var(--input-bg)' }}>
						<X size={14} style={{ color: 'var(--text-soft)' }} />
					</button>
				</div>

				{/* Card preview */}
				<div className="px-6 py-5">
					<div
						className="relative h-28 rounded-[18px] overflow-hidden flex flex-col justify-between p-4 transition-all duration-300"
						style={{ background: `linear-gradient(135deg, ${selectedType.from}, ${selectedType.to})` }}
					>
						<div className="absolute -right-6 -top-6 w-32 h-32 rounded-full pointer-events-none"
							style={{ background: `${selectedType.accent}22` }} />
						<div className="absolute -right-2 top-8 w-16 h-16 rounded-full pointer-events-none"
							style={{ background: `${selectedType.accent}15` }} />

						<div className="relative flex items-center justify-between">
							<span className="text-[11px] text-white/70 font-medium">
								{selectedType.label} Account
							</span>
							<selectedType.icon size={16} className="text-white/60" />
						</div>

						<div className="relative">
							<p className="text-xl font-bold text-white tracking-tight">
								{form.balance !== ''
									? `$${parseFloat(form.balance || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}`
									: '$0.00'}
							</p>
							<p className="text-[11px] text-white/60 mt-0.5">
								{form.name || 'Account name'}
							</p>
						</div>
					</div>
				</div>

				{/* Form */}
				<div className="flex-1 overflow-y-auto px-6 flex flex-col gap-5">

					{/* Account type */}
					<div>
						<label className="text-xs font-semibold block mb-2" style={{ color: 'var(--text-soft)' }}>
							Account Type
						</label>
						<div className="grid grid-cols-3 gap-2">
							{TYPES.map(t => {
								const Icon = t.icon;
								const active = form.type === t.value;
								return (
									<button key={t.value} onClick={() => set('type', t.value)}
										className="flex flex-col items-center gap-1.5 py-3 px-2 rounded-xl border-2 cursor-pointer transition-all"
										style={{
											borderColor: active ? t.from : 'var(--border)',
											background: active ? `${t.from}12` : 'var(--input-bg)',
										}}>
										<Icon size={18} style={{ color: active ? t.from : 'var(--text-muted)' }} />
										<span className="text-[11px] font-semibold"
											style={{ color: active ? t.from : 'var(--text-muted)' }}>
											{t.label}
										</span>
									</button>
								);
							})}
						</div>
					</div>

					{/* Name */}
					<div>
						<label className="text-xs font-semibold block mb-1.5" style={{ color: 'var(--text-soft)' }}>
							Account Name
						</label>
						<input
							type="text"
							value={form.name}
							onChange={e => set('name', e.target.value)}
							placeholder="e.g. CIH Bank, Cash Wallet…"
							className="w-full px-3 py-2.5 rounded-xl text-sm outline-none transition-all"
							style={{
								background: 'var(--input-bg)',
								border: '1px solid var(--border)',
								color: 'var(--text)',
							}}
						/>
					</div>

					{/* Balance */}
					<div>
						<label className="text-xs font-semibold block mb-1.5" style={{ color: 'var(--text-soft)' }}>
							Starting Balance
						</label>
						<div className="relative">
							<span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-bold"
								style={{ color: 'var(--text-muted)' }}>$</span>
							<input
								type="number"
								min="0"
								step="0.01"
								value={form.balance}
								onChange={e => set('balance', e.target.value)}
								placeholder="0.00"
								className="w-full pl-7 pr-3 py-2.5 rounded-xl text-sm font-semibold outline-none transition-all"
								style={{
									background: 'var(--input-bg)',
									border: '1px solid var(--border)',
									color: 'var(--text)',
								}}
							/>
						</div>
					</div>

					{error && (
						<p className="text-xs bg-[#fdecea] text-[#e05252] px-3 py-2 rounded-xl">{error}</p>
					)}
				</div>

				{/* Footer */}
				<div className="px-6 py-5 flex gap-3" style={{ borderTop: '1px solid var(--border)' }}>
					<button onClick={handleClose}
						className="flex-1 py-2.5 rounded-xl text-sm font-semibold cursor-pointer border-none transition-colors"
						style={{ background: 'var(--input-bg)', color: 'var(--text-soft)' }}>
						Cancel
					</button>
					<button onClick={handleSave} disabled={saving}
						className="flex-[2] py-2.5 rounded-xl text-sm font-semibold text-white cursor-pointer border-none disabled:opacity-60 transition-opacity"
						style={{ background: selectedType.from }}>
						{saving ? 'Creating…' : 'Create Account'}
					</button>
				</div>
			</div>
		</>
	);
};

export default AccountDrawer;