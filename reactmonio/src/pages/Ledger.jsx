import { useState, useEffect, useMemo } from 'react';
import { Search, ArrowDownLeft, ArrowUpRight, ArrowLeftRight, Pencil, Trash2, X, Check, Download } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';

const TYPE_META = {
	income: { label: 'Income', icon: ArrowDownLeft, accent: '#6daf5f', bg: '#edf7e6', border: '#6daf5f' },
	outcome: { label: 'Expense', icon: ArrowUpRight, accent: '#e05252', bg: '#fdecea', border: '#e05252' },
	transfer: { label: 'Transfer', icon: ArrowLeftRight, accent: '#3b82f6', bg: '#eff6ff', border: '#3b82f6' },
};

const safeAmount = (val) => parseFloat(val) || 0;

// ── Inline edit modal ──
const EditModal = ({ item, comptes, sousCategs, onClose, onSave }) => {
	const { t } = useTranslation();
	const [form, setForm] = useState({
		amount: item.amount,
		description: item.description || '',
		date: item.date,
		compte_id: item.compte_id || item.from_compte_id || '',
		to_compte_id: item.to_compte_id || '',
		sous_categ_id: item.sous_categ_id || '',
	});
	const [saving, setSaving] = useState(false);
	const [error, setError] = useState('');
	const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

	const handleSave = async () => {
		if (!form.amount || parseFloat(form.amount) <= 0) { setError('Enter a valid amount.'); return; }
		setSaving(true);
		const endpoint = { income: '/incomes', outcome: '/outcomes', transfer: '/transferts' }[item._type];
		const payload = item._type === 'transfer'
			? { from_compte_id: form.compte_id, to_compte_id: form.to_compte_id, amount: form.amount, description: form.description, date: form.date }
			: { compte_id: form.compte_id, sous_categ_id: form.sous_categ_id || undefined, amount: form.amount, description: form.description, date: form.date };
		const updatedItem = {
			...item, ...payload,
			compte: comptes.find(c => c.id === parseInt(form.compte_id)) || item.compte,
			sous_categ: sousCategs.find(s => s.id === parseInt(form.sous_categ_id)) || null,
			from_compte: comptes.find(c => c.id === parseInt(form.compte_id)) || item.from_compte,
			to_compte: comptes.find(c => c.id === parseInt(form.to_compte_id)) || item.to_compte,
		};
		onSave(updatedItem);
		onClose();
		try { await api.put(`${endpoint}/${item.id}`, payload); }
		catch (e) { onSave(item); setError(e?.response?.data?.message || 'Something went wrong.'); }
		finally { setSaving(false); }
	};

	const meta = TYPE_META[item._type];
	return (
		<>
			<div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40" onClick={onClose} />
			<div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
				<div className="bg-[var(--card)] rounded-3xl shadow-2xl w-full max-w-sm pointer-events-auto animate-[slideUp_0.22s_ease-out]"
					style={{ border: '1px solid var(--border)' }}>
					<div className="flex items-center justify-between p-5 pb-3">
						<div className="flex items-center gap-3">
							<div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: meta.bg }}>
								<meta.icon size={16} style={{ color: meta.accent }} />
							</div>
							<h2 className="text-base font-bold" style={{ color: 'var(--text)' }}>{t('common.edit')} {meta.label}</h2>
						</div>
						<button onClick={onClose} className="w-7 h-7 rounded-full flex items-center justify-center border-none cursor-pointer"
							style={{ background: 'var(--input-bg)', color: 'var(--text-soft)' }}>
							<X size={13} />
						</button>
					</div>
					<div className="px-5 flex flex-col gap-3">
						<div>
							<label className="text-xs font-semibold block mb-1" style={{ color: 'var(--text-soft)' }}>{t('common.amount')}</label>
							<input type="number" min="0" step="0.01" value={form.amount} onChange={e => set('amount', e.target.value)}
								className="w-full pl-3 pr-3 py-2.5 rounded-xl text-sm font-semibold outline-none transition-all"
								style={{ background: 'var(--input-bg)', border: '1px solid var(--border)', color: 'var(--text)' }} />
						</div>
						{item._type === 'transfer' ? (
							<div className="grid grid-cols-2 gap-2">
								<div>
									<label className="text-xs font-semibold block mb-1" style={{ color: 'var(--text-soft)' }}>{t('common.from')}</label>
									<select value={form.compte_id} onChange={e => set('compte_id', e.target.value)}
										className="w-full px-3 py-2.5 rounded-xl text-sm outline-none cursor-pointer"
										style={{ background: 'var(--input-bg)', border: '1px solid var(--border)', color: 'var(--text)' }}>
										{comptes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
									</select>
								</div>
								<div>
									<label className="text-xs font-semibold block mb-1" style={{ color: 'var(--text-soft)' }}>{t('common.to')}</label>
									<select value={form.to_compte_id} onChange={e => set('to_compte_id', e.target.value)}
										className="w-full px-3 py-2.5 rounded-xl text-sm outline-none cursor-pointer"
										style={{ background: 'var(--input-bg)', border: '1px solid var(--border)', color: 'var(--text)' }}>
										{comptes.filter(c => c.id !== parseInt(form.compte_id)).map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
									</select>
								</div>
							</div>
						) : (
							<div>
								<label className="text-xs font-semibold block mb-1" style={{ color: 'var(--text-soft)' }}>{t('common.account')}</label>
								<select value={form.compte_id} onChange={e => set('compte_id', e.target.value)}
									className="w-full px-3 py-2.5 rounded-xl text-sm outline-none cursor-pointer"
									style={{ background: 'var(--input-bg)', border: '1px solid var(--border)', color: 'var(--text)' }}>
									{comptes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
								</select>
							</div>
						)}
						{item._type !== 'transfer' && (
							<div>
								<label className="text-xs font-semibold block mb-1" style={{ color: 'var(--text-soft)' }}>{t('common.category')}</label>
								<select value={form.sous_categ_id} onChange={e => set('sous_categ_id', e.target.value)}
									className="w-full px-3 py-2.5 rounded-xl text-sm outline-none cursor-pointer"
									style={{ background: 'var(--input-bg)', border: '1px solid var(--border)', color: 'var(--text)' }}>
									<option value="">{t('common.noCategory')}</option>
									{sousCategs.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
								</select>
							</div>
						)}
						<div>
							<label className="text-xs font-semibold block mb-1" style={{ color: 'var(--text-soft)' }}>{t('common.description')}</label>
							<input type="text" value={form.description} onChange={e => set('description', e.target.value)}
								className="w-full px-3 py-2.5 rounded-xl text-sm outline-none transition-all"
								style={{ background: 'var(--input-bg)', border: '1px solid var(--border)', color: 'var(--text)' }} placeholder="e.g. Netflix" />
						</div>
						<div>
							<label className="text-xs font-semibold block mb-1" style={{ color: 'var(--text-soft)' }}>{t('common.date')}</label>
							<input type="date" value={form.date} onChange={e => set('date', e.target.value)}
								className="w-full px-3 py-2.5 rounded-xl text-sm outline-none cursor-pointer"
								style={{ background: 'var(--input-bg)', border: '1px solid var(--border)', color: 'var(--text)' }} />
						</div>
						{error && <p className="text-xs px-3 py-2 rounded-xl" style={{ background: '#fdecea', color: '#e05252' }}>{error}</p>}
					</div>
					<div className="flex gap-3 p-5 pt-4">
						<button onClick={onClose} className="flex-1 py-2.5 rounded-xl text-sm font-semibold cursor-pointer border-none transition-colors"
							style={{ background: 'var(--input-bg)', color: 'var(--text-soft)' }}>{t('common.cancel')}</button>
						<button onClick={handleSave} disabled={saving}
							className="flex-[2] py-2.5 rounded-xl text-sm font-semibold text-white cursor-pointer border-none disabled:opacity-60"
							style={{ background: meta.accent }}>{saving ? 'Saving…' : t('common.save')}</button>
					</div>
				</div>
			</div>
			<style>{`@keyframes slideUp { from { opacity:0; transform:translateY(14px) scale(.98) } to { opacity:1; transform:translateY(0) scale(1) } }`}</style>
		</>
	);
};

const DeleteConfirm = ({ onCancel, onConfirm, loading }) => (
	<div className="flex items-center gap-2 animate-[slideUp_0.15s_ease-out]">
		<span className="text-xs font-medium" style={{ color: '#e05252' }}>Delete?</span>
		<button onClick={onConfirm} disabled={loading}
			className="w-6 h-6 rounded-lg flex items-center justify-center border-none cursor-pointer"
			style={{ background: '#e05252', color: '#fff' }}><Check size={12} /></button>
		<button onClick={onCancel}
			className="w-6 h-6 rounded-lg flex items-center justify-center border-none cursor-pointer"
			style={{ background: 'var(--input-bg)', color: 'var(--text-soft)' }}><X size={12} /></button>
	</div>
);

// ── Main Ledger ──
const Ledger = () => {
	const { t } = useTranslation();
	const { user } = useAuth();
	const currency = user?.currency || 'MAD';
	const [incomes, setIncomes] = useState([]);
	const [outcomes, setOutcomes] = useState([]);
	const [transfers, setTransfers] = useState([]);
	const [comptes, setComptes] = useState([]);
	const [sousCategs, setSousCategs] = useState([]);
	const [loading, setLoading] = useState(true);
	const [filter, setFilter] = useState('all');
	const [search, setSearch] = useState('');
	const [month, setMonth] = useState('');
	const [editItem, setEditItem] = useState(null);
	const [deleteId, setDeleteId] = useState(null);
	const [deleting, setDeleting] = useState(false);

	useEffect(() => {
		Promise.all([
			api.get('/incomes'), api.get('/outcomes'), api.get('/transferts'),
			api.get('/comptes'), api.get('/sous-categs'),
		]).then(([iR, oR, tR, cR, sR]) => {
			setIncomes(iR.data); setOutcomes(oR.data); setTransfers(tR.data);
			setComptes(cR.data); setSousCategs(sR.data);
		}).catch(console.error).finally(() => setLoading(false));
	}, []);

	const handleSave = (updatedItem) => {
		const { _type, ...data } = updatedItem;
		if (_type === 'income') setIncomes(prev => prev.map(i => i.id === data.id ? data : i));
		else if (_type === 'outcome') setOutcomes(prev => prev.map(o => o.id === data.id ? data : o));
		else setTransfers(prev => prev.map(t => t.id === data.id ? data : t));
		setEditItem(null);
	};

	const handleDelete = async () => {
		if (!deleteId) return;
		setDeleting(true);
		const { id, type } = deleteId;
		const endpoint = { income: '/incomes', outcome: '/outcomes', transfer: '/transferts' }[type];
		const snapshot = { incomes: [...incomes], outcomes: [...outcomes], transfers: [...transfers] };
		if (type === 'income') setIncomes(prev => prev.filter(i => i.id !== id));
		else if (type === 'outcome') setOutcomes(prev => prev.filter(o => o.id !== id));
		else setTransfers(prev => prev.filter(t => t.id !== id));
		setDeleteId(null);
		try { await api.delete(`${endpoint}/${id}`); }
		catch { setIncomes(snapshot.incomes); setOutcomes(snapshot.outcomes); setTransfers(snapshot.transfers); }
		finally { setDeleting(false); }
	};

	const allItems = useMemo(() => [
		...incomes.map(i => ({ ...i, _type: 'income' })),
		...outcomes.map(o => ({ ...o, _type: 'outcome' })),
		...transfers.map(t => ({ ...t, _type: 'transfer' })),
	].sort((a, b) => new Date(b.date) - new Date(a.date)), [incomes, outcomes, transfers]);

	const filtered = useMemo(() => allItems.filter(item => {
		if (filter !== 'all' && item._type !== filter) return false;
		if (month && !item.date?.startsWith(month)) return false;
		if (search) {
			const q = search.toLowerCase();
			if (!item.description?.toLowerCase().includes(q) && !item.amount?.toString().includes(q)) return false;
		}
		return true;
	}), [allItems, filter, search, month]);

	const totalIncome = filtered.filter(i => i._type === 'income').reduce((s, i) => s + safeAmount(i.amount), 0);
	const totalOutcome = filtered.filter(i => i._type === 'outcome').reduce((s, i) => s + safeAmount(i.amount), 0);
	const net = totalIncome - totalOutcome;

	const grouped = useMemo(() => {
		const map = {};
		filtered.forEach(item => { const d = item.date?.split('T')[0] || 'Unknown'; if (!map[d]) map[d] = []; map[d].push(item); });
		return Object.entries(map).sort((a, b) => new Date(b[0]) - new Date(a[0]));
	}, [filtered]);

	const formatDateLabel = (dateStr) => {
		if (dateStr === 'Unknown') return dateStr;
		const d = new Date(dateStr + 'T00:00:00');
		const today = new Date(); const yesterday = new Date(); yesterday.setDate(today.getDate() - 1);
		if (d.toDateString() === today.toDateString()) return t('ledger.today');
		if (d.toDateString() === yesterday.toDateString()) return t('ledger.yesterday');
		return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
	};

	const getAccountName = (item) => {
		if (item._type === 'transfer') {
			const from = item.from_compte?.name || comptes.find(c => c.id === item.from_compte_id)?.name || '?';
			const to = item.to_compte?.name || comptes.find(c => c.id === item.to_compte_id)?.name || '?';
			return `${from} → ${to}`;
		}
		return item.compte?.name || comptes.find(c => c.id === item.compte_id)?.name || '—';
	};

	const getCategoryName = (item) =>
		item.sous_categ?.name || sousCategs.find(s => s.id === item.sous_categ_id)?.name || null;

	const exportCSV = () => {
		const headers = ['Date', 'Type', 'Amount', 'Description', 'Account', 'Category'];
		const rows = filtered.map(item => [
			item.date?.split('T')[0] || '', item._type, safeAmount(item.amount).toFixed(2),
			item.description || '', getAccountName(item), getCategoryName(item) || '',
		]);
		const csv = [headers, ...rows].map(r => r.map(c => `"${c}"`).join(',')).join('\n');
		const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
		const url = URL.createObjectURL(blob);
		const a = document.createElement('a');
		a.href = url; a.download = `moneyio-ledger-${new Date().toISOString().slice(0, 10)}.csv`;
		a.click(); URL.revokeObjectURL(url);
	};

	if (loading) return (
		<div className="flex items-center justify-center h-64">
			<div className="w-9 h-9 border-[3px] rounded-full animate-spin"
				style={{ borderColor: 'var(--border)', borderTopColor: 'var(--primary-light)' }} />
		</div>
	);

	return (
		<div className="flex-1 min-h-screen font-sans" >
			<main className="p-4 sm:p-8 max-w-4xl mx-auto">
				<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
					<h1 className="text-2xl sm:text-3xl font-bold tracking-tight" style={{ color: 'var(--text)' }}>{t('ledger.title')}</h1>
					<button onClick={exportCSV}
						className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold cursor-pointer border-none transition-all self-start"
						style={{ background: 'var(--primary)', color: '#fff' }}>
						<Download size={14} /> {t('ledger.exportCsv')}
					</button>
				</div>

				{/* Stat cards */}
				<div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-5">
					{[
						{ label: t('ledger.income'), value: totalIncome, accent: '#6daf5f', bg: '#edf7e6', sign: '+' },
						{ label: t('ledger.expense'), value: totalOutcome, accent: '#e05252', bg: '#fdecea', sign: '-' },
						{ label: t('ledger.all') === 'All' ? 'Net' : 'Net', value: Math.abs(net), accent: net >= 0 ? 'var(--primary)' : '#e05252', bg: net >= 0 ? 'var(--input-bg)' : '#fdecea', sign: net >= 0 ? '+' : '-' },
					].map(s => (
						<div key={s.label} className="rounded-2xl p-4 shadow-sm" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
							<span className="text-xs font-semibold block mb-1" style={{ color: 'var(--text-soft)' }}>{s.label}</span>
							<span className="text-lg sm:text-xl font-bold tracking-tight" style={{ color: s.accent }}>
								{s.sign}{s.value.toLocaleString('en-US', { minimumFractionDigits: 2 })} {currency}
							</span>
						</div>
					))}
				</div>

				{/* Filters */}
				<div className="rounded-2xl p-3 sm:p-4 shadow-sm mb-5 flex flex-wrap gap-2 sm:gap-3 items-center"
					style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
					<div className="flex gap-1.5 flex-wrap">
						{['all', 'income', 'outcome', 'transfer'].map(f => (
							<button key={f} onClick={() => setFilter(f)}
								className="px-3 sm:px-4 py-1.5 rounded-full text-xs font-semibold capitalize transition-all cursor-pointer border-none"
								style={filter === f
									? { background: f === 'all' ? 'var(--primary)' : TYPE_META[f]?.accent, color: '#fff' }
									: { background: 'var(--input-bg)', color: 'var(--text-soft)' }}>
								{f === 'all' ? t('ledger.all') : TYPE_META[f].label}
							</button>
						))}
					</div>
					<div className="w-px h-5 hidden sm:block" style={{ background: 'var(--border)' }} />
					<input type="month" value={month} onChange={e => setMonth(e.target.value)}
						className="px-3 py-1.5 rounded-xl text-xs outline-none cursor-pointer"
						style={{ background: 'var(--input-bg)', border: '1px solid var(--border)', color: 'var(--text)' }} />
					{month && <button onClick={() => setMonth('')} className="text-xs cursor-pointer bg-transparent border-none"
						style={{ color: '#e05252' }}>{t('ledger.clear')}</button>}
					<div className="flex items-center gap-2 rounded-xl px-3 py-1.5 sm:ml-auto"
						style={{ background: 'var(--input-bg)', border: '1px solid var(--border)' }}>
						<Search size={13} style={{ color: 'var(--text-muted)' }} />
						<input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder={t('ledger.search')}
							className="bg-transparent outline-none text-xs w-24 sm:w-32" style={{ color: 'var(--text)' }} />
					</div>
				</div>

				{/* Grouped list */}
				{grouped.length === 0 ? (
					<div className="text-center py-20 text-sm" style={{ color: 'var(--text-muted)' }}>{t('ledger.noTransactions')}</div>
				) : (
					<div className="flex flex-col gap-5">
						{grouped.map(([date, items]) => (
							<div key={date}>
								<div className="flex items-center gap-3 mb-2.5">
									<span className="text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--text-soft)' }}>{formatDateLabel(date)}</span>
									<div className="flex-1 h-px" style={{ background: 'var(--border)' }} />
									<span className="text-xs" style={{ color: 'var(--text-muted)' }}>
										{items.length} {items.length !== 1 ? t('ledger.items') : t('ledger.item')}
									</span>
								</div>
								<div className="flex flex-col gap-2">
									{items.map(item => {
										const meta = TYPE_META[item._type];
										const TypeIcon = meta.icon;
										const catName = getCategoryName(item);
										const accName = getAccountName(item);
										const isDeleting = deleteId?.id === item.id && deleteId?.type === item._type;
										return (
											<div key={`${item._type}-${item.id}`}
												className="rounded-2xl px-4 sm:px-5 py-3 shadow-sm flex items-center gap-3 sm:gap-4 hover:shadow-md transition-shadow group"
												style={{
													background: 'var(--card)',
													borderLeft: `3px solid ${meta.border}`,
													border: '1px solid var(--border)',
													borderLeftWidth: 3,
													borderLeftColor: meta.border,
												}}>
												<div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" style={{ background: meta.bg }}>
													<TypeIcon size={15} style={{ color: meta.accent }} />
												</div>
												<div className="flex-1 min-w-0">
													<p className="text-sm font-semibold truncate" style={{ color: 'var(--text)' }}>{item.description || '—'}</p>
													<div className="flex items-center gap-2 mt-0.5 flex-wrap">
														<span className="text-[10px]" style={{ color: 'var(--text-muted)' }}>{accName}</span>
														{catName && (
															<>
																<span className="w-1 h-1 rounded-full" style={{ background: 'var(--border)' }} />
																<span className="text-[10px] px-2 py-0.5 rounded-full font-medium" style={{ background: meta.bg, color: meta.accent }}>{catName}</span>
															</>
														)}
													</div>
												</div>
												<span className="text-sm font-bold whitespace-nowrap" style={{ color: meta.accent }}>
													{item._type === 'income' ? '+' : item._type === 'outcome' ? '-' : ''}
													{safeAmount(item.amount).toLocaleString('en-US', { minimumFractionDigits: 2 })}
												</span>
												<div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
													{isDeleting ? (
														<DeleteConfirm onCancel={() => setDeleteId(null)} onConfirm={handleDelete} loading={deleting} />
													) : (
														<>
															<button onClick={() => setEditItem(item)}
																className="w-7 h-7 rounded-lg flex items-center justify-center border-none cursor-pointer transition-colors"
																style={{ background: 'var(--input-bg)', color: 'var(--text-soft)' }}><Pencil size={12} /></button>
															<button onClick={() => setDeleteId({ id: item.id, type: item._type })}
																className="w-7 h-7 rounded-lg flex items-center justify-center border-none cursor-pointer transition-colors"
																style={{ background: '#fdecea', color: '#e05252' }}><Trash2 size={12} /></button>
														</>
													)}
												</div>
											</div>
										);
									})}
								</div>
							</div>
						))}
					</div>
				)}
			</main>
			{editItem && <EditModal item={editItem} comptes={comptes} sousCategs={sousCategs} onClose={() => setEditItem(null)} onSave={handleSave} />}
		</div>
	);
};

export default Ledger;