import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import api from '../../api/axios';
import { createBudget, updateBudget } from '../../services/budgetService';

const BudgetModal = ({ isOpen, onClose, onSuccess, editBudget = null }) => {
	const [categories, setCategories] = useState([]);
	const [scope, setScope] = useState('global');
	const [form, setForm] = useState({
		categorie_id: '',
		amount: '',
		month: new Date().getMonth() + 1,
		year: new Date().getFullYear(),
	});
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState('');

	useEffect(() => {
		if (!isOpen) return;
		api.get('/categories').then(r => setCategories(r.data)).catch(console.error);
	}, [isOpen]);

	useEffect(() => {
		setScope(editBudget ? (editBudget.categorie_id ? 'category' : 'global') : 'global'); // ← add this line
		if (editBudget) {
			setForm({
				categorie_id: editBudget.categorie_id,
				amount: editBudget.amount,
				month: editBudget.month,
				year: editBudget.year,
			});
		} else {
			setForm({
				categorie_id: '',
				amount: '',
				month: new Date().getMonth() + 1,
				year: new Date().getFullYear(),
			});
		}
		setError('');
	}, [editBudget, isOpen]);

	const handleSubmit = async () => {
		if (scope === 'category' && !form.categorie_id) {
			setError('Please select a category.');
			return;
		}
		if (!form.amount) {
			setError('Amount is required.');
			return;
		
		}
		setLoading(true);
		try {
			const  result =  editBudget
				? await updateBudget(editBudget.id, { amount: form.amount })
				: await createBudget({
					...form,
					categorie_id: scope === 'global' ? null : form.categorie_id,
				});
			onSuccess(result, !!editBudget);
			onClose();
		} catch (e) {
			setError('Something went wrong.');
		} finally {
			setLoading(false);
		}
	};

	if (!isOpen) return null;

	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center"
			style={{ background: 'rgba(0,0,0,0.3)' }}
			onClick={onClose}>
			<div className="rounded-2xl p-6 w-full max-w-sm shadow-xl flex flex-col gap-4"
				style={{ background: 'var(--card)', color: 'var(--text)' }}
				onClick={e => e.stopPropagation()}>

				<div className="flex items-center justify-between">
					<h2 className="text-base font-semibold">
						{editBudget ? 'Edit Budget' : 'Set Budget'}
					</h2>
					<button onClick={onClose} className="cursor-pointer border-none bg-transparent"
						style={{ color: 'var(--text-muted)' }}>
						<X size={18} />
					</button>
				</div>

				{error && (
					<p className="text-xs px-3 py-2 rounded-xl"
						style={{ background: '#fff1f1', color: '#dc2626' }}>
						{error}
					</p>
				)}
				<div className="flex gap-2">
					{['global', 'category'].map(s => (
						<button
							key={s}
							type="button"
							onClick={() => setScope(s)}
							className="flex-1 py-2 rounded-xl text-xs font-semibold border-none cursor-pointer"
							style={{
								background: scope === s ? 'var(--primary)' : 'var(--bg)',
								color: scope === s ? '#fff' : 'var(--text-muted)',
							}}>
							{s === 'global' ? '🌐 All Spending' : '🗂 By Category'}
						</button>
					))}
				</div>

				{scope === 'category' && (
					<select
						disabled={!!editBudget}
						value={form.categorie_id}
						onChange={e => setForm(f => ({ ...f, categorie_id: e.target.value }))}
						className="w-full rounded-xl px-3 py-2.5 text-sm outline-none border"
						style={{
							background: 'var(--bg)',
							color: 'var(--text)',
							borderColor: 'var(--border)',
							opacity: editBudget ? 0.5 : 1,
						}}>
						<option value="">Select category</option>
						{categories.map(c => (
							<option key={c.id} value={c.id}>{c.name}</option>
						))}
					</select>
				)}
				<div className="flex flex-col gap-3">
				
					<input
						type="number"
						placeholder="Budget amount"
						value={form.amount}
						onChange={e => setForm(f => ({ ...f, amount: e.target.value }))}
						className="w-full rounded-xl px-3 py-2.5 text-sm outline-none border"
						style={{
							background: 'var(--bg)',
							color: 'var(--text)',
							borderColor: 'var(--border)',
						}}
					/>

					{!editBudget && (
						<div className="grid grid-cols-2 gap-2">
							<select
								value={form.month}
								onChange={e => setForm(f => ({ ...f, month: +e.target.value }))}
								className="rounded-xl px-3 py-2.5 text-sm outline-none border"
								style={{
									background: 'var(--bg)',
									color: 'var(--text)',
									borderColor: 'var(--border)',
								}}>
								{Array.from({ length: 12 }, (_, i) => (
									<option key={i + 1} value={i + 1}>
										{new Date(0, i).toLocaleString('en-US', { month: 'long' })}
									</option>
								))}
							</select>

							<input
								type="number"
								placeholder="Year"
								value={form.year}
								onChange={e => setForm(f => ({ ...f, year: +e.target.value }))}
								className="rounded-xl px-3 py-2.5 text-sm outline-none border"
								style={{
									background: 'var(--bg)',
									color: 'var(--text)',
									borderColor: 'var(--border)',
								}}
							/>
						</div>
					)}
				</div>

				<button
					onClick={handleSubmit}
					disabled={loading}
					className="w-full py-2.5 rounded-xl text-sm font-semibold text-white border-none cursor-pointer"
					style={{
						background: loading ? 'var(--border)' : 'var(--primary)',
						cursor: loading ? 'not-allowed' : 'pointer',
					}}>
					{loading ? 'Saving...' : editBudget ? 'Update' : 'Set Budget'}
				</button>
			</div>
		</div>
	);
};

export default BudgetModal;