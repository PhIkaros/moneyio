import { useState, useEffect } from 'react';
import { X, ArrowDownLeft, ArrowUpRight, ArrowLeftRight } from 'lucide-react';
import api from '../../api/axios';

const TYPE_CONFIG = {
	income: {
		label: 'New Income',
		icon: ArrowDownLeft,
		accent: '#6daf5f',
		lightBg: '#edf7e6',
		endpoint: '/incomes',
	},
	outcome: {
		label: 'New Expense',
		icon: ArrowUpRight,
		accent: '#239dca',
		lightBg: '#e0f4f8',
		endpoint: '/outcomes',
	},
	transfer: {
		label: 'New Transfer',
		icon: ArrowLeftRight,
		accent: '#2a9d8f',
		lightBg: '#e8f5f1',
		endpoint: '/transferts',
	},
};

const TransactionModal = ({ isOpen, onClose, defaultType = 'outcome', onSuccess }) => {
	const [type, setType] = useState(defaultType);
	const [comptes, setComptes] = useState([]);
	const [categories, setCategories] = useState([]);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState('');

	const [form, setForm] = useState({
		compte_id: '',
		from_compte_id: '',
		to_compte_id: '',
		category_id: '',
		sous_categ_id: '',
		amount: '',
		description: '',
		date: new Date().toISOString().split('T')[0],
	});

	useEffect(() => {
		if (!isOpen) return;
		setType(defaultType);
		setError('');
		setForm({
			compte_id: '',
			from_compte_id: '',
			to_compte_id: '',
			category_id: '',
			sous_categ_id: '',
			amount: '',
			description: '',
			date: new Date().toISOString().split('T')[0],
		});
		const fetchOptions = async () => {
			try {
				const [comptesRes, categoriesRes] = await Promise.all([
					api.get('/comptes'),
					api.get('/categories'),
				]);
				setComptes(comptesRes.data);
				setCategories(categoriesRes.data);
			} catch (e) {
				console.error(e);
			}
		};
		fetchOptions();
	}, [isOpen, defaultType]);

	const config = TYPE_CONFIG[type];
	const Icon = config.icon;

	const set = (field, value) => setForm(prev => ({ ...prev, [field]: value }));

	const handleSubmit = async () => {
		setError('');
		if (!form.amount || parseFloat(form.amount) <= 0) {
			setError('Please enter a valid amount.');
			return;
		}
		if (type !== 'transfer' && !form.compte_id) {
			setError('Please select an account.');
			return;
		}
		if (type === 'transfer' && (!form.from_compte_id || !form.to_compte_id)) {
			setError('Please select both accounts.');
			return;
		}

		const payload =
			type === 'transfer'
				? {
					from_compte_id: form.from_compte_id,
					to_compte_id: form.to_compte_id,
					amount: form.amount,
					description: form.description,
					date: form.date,
				}
				: {
					compte_id: form.compte_id,
					sous_categ_id: form.sous_categ_id || undefined,
					amount: form.amount,
					description: form.description,
					date: form.date,
				};

		try {
			setLoading(true);
			const res = await api.post(config.endpoint, payload);
			onSuccess?.(res.data, type);
			onClose();
		} catch (e) {
			setError(e?.response?.data?.message || 'Something went wrong.');
		} finally {
			setLoading(false);
		}
	};

	if (!isOpen) return null;

	return (
		<>
			{/* Backdrop */}
			<div
				className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40"
				onClick={onClose}
			/>

			{/* Modal */}
			<div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
				<div
					className="bg-white rounded-3xl shadow-2xl w-full max-w-md pointer-events-auto
            animate-[slideUp_0.25s_ease-out]"
					style={{ boxShadow: `0 25px 60px ${config.accent}22` }}
				>
					{/* Header */}
					<div className="flex items-center justify-between p-6 pb-4">
						<div className="flex items-center gap-3">
							<div
								className="w-10 h-10 rounded-2xl flex items-center justify-center"
								style={{ background: config.lightBg }}
							>
								<Icon size={18} style={{ color: config.accent }} />
							</div>
							<h2 className="text-lg font-bold text-[#1a3830]">{config.label}</h2>
						</div>
						<button
							onClick={onClose}
							className="w-8 h-8 rounded-full bg-[#f0f7f5] flex items-center justify-center
                hover:bg-[#e0edea] transition-colors cursor-pointer border-none"
						>
							<X size={15} className="text-[#5a8880]" />
						</button>
					</div>

					{/* Type switcher */}
					<div className="flex gap-2 px-6 mb-5">
						{['income', 'outcome', 'transfer'].map(t => (
							<button
								key={t}
								onClick={() => setType(t)}
								className="flex-1 py-2 rounded-xl text-xs font-semibold capitalize transition-all cursor-pointer border-none"
								style={
									type === t
										? { background: TYPE_CONFIG[t].accent, color: '#fff' }
										: { background: '#f0f7f5', color: '#5a8880' }
								}
							>
								{t}
							</button>
						))}
					</div>

					{/* Fields */}
					<div className="px-6 flex flex-col gap-3.5">

						{/* Amount */}
						<div>
							<label className="text-xs font-semibold text-[#5a8880] mb-1.5 block">Amount</label>
							<div className="relative">
								<span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-bold text-[#afc8c3]">$</span>
								<input
									type="number"
									min="0"
									step="0.01"
									value={form.amount}
									onChange={e => set('amount', e.target.value)}
									placeholder="0.00"
									className="w-full pl-8 pr-4 py-3 rounded-xl bg-[#f5faf9] border border-[#e0edea]
                    text-[#1a3830] font-semibold text-sm outline-none
                    focus:border-[#2a9d8f] focus:ring-2 focus:ring-[#2a9d8f]/10 transition-all"
								/>
							</div>
						</div>

						{/* Account(s) */}
						{type === 'transfer' ? (
							<div className="grid grid-cols-2 gap-3">
								<div>
									<label className="text-xs font-semibold text-[#5a8880] mb-1.5 block">From</label>
									<select
										value={form.from_compte_id}
										onChange={e => set('from_compte_id', e.target.value)}
										className="w-full px-3 py-3 rounded-xl bg-[#f5faf9] border border-[#e0edea]
                      text-[#1a3830] text-sm outline-none focus:border-[#2a9d8f] transition-all cursor-pointer"
									>
										<option value="">Account</option>
										{comptes.map(c => (
											<option key={c.id} value={c.id}>{c.name}</option>
										))}
									</select>
								</div>
								<div>
									<label className="text-xs font-semibold text-[#5a8880] mb-1.5 block">To</label>
									<select
										value={form.to_compte_id}
										onChange={e => set('to_compte_id', e.target.value)}
										className="w-full px-3 py-3 rounded-xl bg-[#f5faf9] border border-[#e0edea]
                      text-[#1a3830] text-sm outline-none focus:border-[#2a9d8f] transition-all cursor-pointer"
									>
										<option value="">Account</option>
										{comptes.filter(c => c.id !== parseInt(form.from_compte_id)).map(c => (
											<option key={c.id} value={c.id}>{c.name}</option>
										))}
									</select>
								</div>
							</div>
						) : (
							<div>
								<label className="text-xs font-semibold text-[#5a8880] mb-1.5 block">Account</label>
								<select
									value={form.compte_id}
									onChange={e => set('compte_id', e.target.value)}
									className="w-full px-3 py-3 rounded-xl bg-[#f5faf9] border border-[#e0edea]
                    text-[#1a3830] text-sm outline-none focus:border-[#2a9d8f] transition-all cursor-pointer"
								>
									<option value="">Select account</option>
									{comptes.map(c => (
										<option key={c.id} value={c.id}>{c.name} — ${parseFloat(c.balance).toFixed(2)}</option>
									))}
								</select>
							</div>
						)}

						{/* Category & Sous-Catégorie */}
						{type !== 'transfer' && (
							<div className="grid grid-cols-2 gap-3">
								<div>
									<label className="text-xs font-semibold text-[#5a8880] mb-1.5 block">
										Category <span className="text-[#c8ddd9] font-normal">(optional)</span>
									</label>
									<select
										value={form.category_id}
										onChange={e => {
											set('category_id', e.target.value);
											set('sous_categ_id', ''); // Reset sous-categ when category changes
										}}
										className="w-full px-3 py-3 rounded-xl bg-[#f5faf9] border border-[#e0edea]
                    text-[#1a3830] text-sm outline-none focus:border-[#2a9d8f] transition-all cursor-pointer"
									>
										<option value="">Select category</option>
										{categories.filter(c => c.type === type).map(c => (
											<option key={c.id} value={c.id}>{c.name}</option>
										))}
									</select>
								</div>
								<div>
									<label className="text-xs font-semibold text-[#5a8880] mb-1.5 block">
										Sub-category <span className="text-[#c8ddd9] font-normal">(optional)</span>
									</label>
									<select
										value={form.sous_categ_id}
										onChange={e => set('sous_categ_id', e.target.value)}
										disabled={!form.category_id}
										className="w-full px-3 py-3 rounded-xl bg-[#f5faf9] border border-[#e0edea]
                    text-[#1a3830] text-sm outline-none focus:border-[#2a9d8f] transition-all cursor-pointer disabled:opacity-50"
									>
										<option value="">Select sub-category</option>
										{categories.find(c => c.id === parseInt(form.category_id))?.sous_categories?.map(s => (
											<option key={s.id} value={s.id}>{s.name}</option>
										))}
									</select>
								</div>
							</div>
						)}

						{/* Description */}
						<div>
							<label className="text-xs font-semibold text-[#5a8880] mb-1.5 block">
								Description <span className="text-[#c8ddd9] font-normal">(optional)</span>
							</label>
							<input
								type="text"
								value={form.description}
								onChange={e => set('description', e.target.value)}
								placeholder="e.g. Netflix subscription"
								className="w-full px-4 py-3 rounded-xl bg-[#f5faf9] border border-[#e0edea]
                  text-[#1a3830] text-sm outline-none focus:border-[#2a9d8f]
                  focus:ring-2 focus:ring-[#2a9d8f]/10 transition-all placeholder-[#c8ddd9]"
							/>
						</div>

						{/* Date */}
						<div>
							<label className="text-xs font-semibold text-[#5a8880] mb-1.5 block">Date</label>
							<input
								type="date"
								value={form.date}
								onChange={e => set('date', e.target.value)}
								className="w-full px-4 py-3 rounded-xl bg-[#f5faf9] border border-[#e0edea]
                  text-[#1a3830] text-sm outline-none focus:border-[#2a9d8f] transition-all cursor-pointer"
							/>
						</div>

						{/* Error */}
						{error && (
							<p className="text-xs text-[#e05252] bg-[#fdecea] px-4 py-2.5 rounded-xl">{error}</p>
						)}
					</div>

					{/* Footer */}
					<div className="flex gap-3 p-6 pt-5">
						<button
							onClick={onClose}
							className="flex-1 py-3 rounded-xl text-sm font-semibold text-[#5a8880]
                bg-[#f0f7f5] hover:bg-[#e0edea] transition-colors cursor-pointer border-none"
						>
							Cancel
						</button>
						<button
							onClick={handleSubmit}
							disabled={loading}
							className="flex-2 px-8 py-3 rounded-xl text-sm font-semibold text-white
                transition-all cursor-pointer border-none disabled:opacity-60"
							style={{ background: config.accent, flex: 2 }}
						>
							{loading ? 'Saving…' : `Add ${type}`}
						</button>
					</div>
				</div>
			</div>

			<style>{`
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(16px) scale(0.98); }
          to   { opacity: 1; transform: translateY(0)    scale(1);    }
        }
      `}</style>
		</>
	);
};

export default TransactionModal;