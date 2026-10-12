import { useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { getBudgets } from '../services/budgetService';
import {
	PieChart, Pie, Cell, Tooltip, ResponsiveContainer,
	AreaChart, Area, XAxis, YAxis, CartesianGrid,
	BarChart, Bar, Legend,
} from 'recharts';

const COLORS = ['#1a6b60', '#ea580c', '#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b', '#06b6d4', '#6daf5f', '#e05252', '#c2410c'];

const safeAmount = (v) => parseFloat(v) || 0;

const Statistics = () => {
	const { t } = useTranslation();
	const { user } = useAuth();
	const currency = user?.currency || 'MAD';
	const [incomes, setIncomes] = useState([]);
	const [outcomes, setOutcomes] = useState([]);
	const [budgets, setBudgets] = useState([]);
	const [loading, setLoading] = useState(true);
	const [timeFilter, setTimeFilter] = useState('year'); // 'year', 'prev', 'all'

	useEffect(() => {
		Promise.all([
			api.get('/incomes'),
			api.get('/outcomes'),
			getBudgets(),
		]).then(([iR, oR, bData]) => {
			setIncomes(iR.data);
			setOutcomes(oR.data);
			setBudgets(bData);
		}).catch(console.error)
			.finally(() => setLoading(false));
	}, []);

	const filteredOutcomes = useMemo(() => {
		const now = new Date();
		return outcomes.filter(o => {
			const d = new Date(o.date);
			if (timeFilter === 'year') return d.getFullYear() === now.getFullYear();
			if (timeFilter === 'prev') return d.getFullYear() === now.getFullYear() - 1;
			return true;
		});
	}, [outcomes, timeFilter]);

	const filteredIncomes = useMemo(() => {
		const now = new Date();
		return incomes.filter(i => {
			const d = new Date(i.date);
			if (timeFilter === 'year') return d.getFullYear() === now.getFullYear();
			if (timeFilter === 'prev') return d.getFullYear() === now.getFullYear() - 1;
			return true;
		});
	}, [incomes, timeFilter]);

	// Spending by category
	const categoryData = useMemo(() => {
		const map = {};
		filteredOutcomes.forEach(o => {
			const cat = o.sous_categ?.name || o.description || 'Other';
			map[cat] = (map[cat] || 0) + safeAmount(o.amount);
		});
		return Object.entries(map)
			.map(([name, value]) => ({ name, value: Math.round(value * 100) / 100 }))
			.sort((a, b) => b.value - a.value);
	}, [filteredOutcomes]);

	// Income vs Expenses over last 12 months (ignores global timeFilter as it is a fixed 12-month trend)
	const monthlyTrend = useMemo(() => {
		const now = new Date();
		return Array.from({ length: 12 }, (_, i) => {
			const monthIdx = (now.getMonth() - 11 + i + 12) % 12;
			const yearOffset = now.getMonth() - 11 + i < 0 ? now.getFullYear() - 1 : now.getFullYear();
			const label = new Date(yearOffset, monthIdx).toLocaleString('en-US', { month: 'short' });

			const inc = incomes.filter(x => {
				const d = new Date(x.date);
				return d.getMonth() === monthIdx && d.getFullYear() === yearOffset;
			}).reduce((s, x) => s + safeAmount(x.amount), 0);

			const exp = outcomes.filter(x => {
				const d = new Date(x.date);
				return d.getMonth() === monthIdx && d.getFullYear() === yearOffset;
			}).reduce((s, x) => s + safeAmount(x.amount), 0);

			return { name: label, income: Math.round(inc), expenses: Math.round(exp) };
		});
	}, [incomes, outcomes]);

	// Monthly breakdown (based on timeFilter)
	const monthlyBreakdown = useMemo(() => {
		const yr = timeFilter === 'prev' ? new Date().getFullYear() - 1 : new Date().getFullYear();
		return Array.from({ length: 12 }, (_, i) => {
			const label = new Date(yr, i).toLocaleString('en-US', { month: 'short' });
			const inc = incomes.filter(x => { const d = new Date(x.date); return d.getMonth() === i && d.getFullYear() === yr; })
				.reduce((s, x) => s + safeAmount(x.amount), 0);
			const exp = outcomes.filter(x => { const d = new Date(x.date); return d.getMonth() === i && d.getFullYear() === yr; })
				.reduce((s, x) => s + safeAmount(x.amount), 0);
			return { name: label, income: Math.round(inc), expenses: Math.round(exp) };
		});
	}, [incomes, outcomes, timeFilter]);

	// Budget usage
	const budgetUsage = useMemo(() => {
		const now = new Date();
		const currentMonth = now.getMonth() + 1;
		const currentYear = now.getFullYear();

		return budgets
			.filter(b => Number(b.month) === currentMonth && Number(b.year) === currentYear)
			.map(b => {
				const catName = b.categorie_id === null ? 'Total' : (b.category?.name || 'Unknown');
				const spent = b.categorie_id === null
					? outcomes.filter(o => {
						const d = new Date(o.date); return d.getMonth() + 1 === currentMonth && d.getFullYear() === currentYear;
					}).reduce((s, o) => s + safeAmount(o.amount), 0)
					: outcomes.filter(o => {
						const d = new Date(o.date);
						return d.getMonth() + 1 === currentMonth && d.getFullYear() === currentYear &&
							(o.sous_categ?.categorie_id === b.categorie_id || o.sous_categ?.category?.id === b.categorie_id);
					}).reduce((s, o) => s + safeAmount(o.amount), 0);
				const budget = safeAmount(b.amount);
				return { name: catName, spent: Math.round(spent), budget: Math.round(budget), pct: budget > 0 ? Math.round(spent / budget * 100) : 0 };
			});
	}, [budgets, outcomes]);

	const cardStyle = {
		background: 'var(--card)', borderRadius: 20, padding: 24,
		border: '1px solid var(--border)', boxShadow: 'var(--shadow-soft)',
	};

	if (loading) return (
		<div className="flex items-center justify-center h-64">
			<div className="w-9 h-9 border-[3px] rounded-full animate-spin" style={{ borderColor: 'var(--border)', borderTopColor: 'var(--primary-light)' }} />
		</div>
	);

	return (
		<div className="max-w-6xl mx-auto px-4 py-6">
			<div className="flex items-center justify-between mb-6">
				<h1 className="text-2xl sm:text-3xl font-bold tracking-tight" style={{ color: 'var(--text)' }}>
					{t('statistics.title')}
				</h1>
				<select
					value={timeFilter}
					onChange={(e) => setTimeFilter(e.target.value)}
					className="text-sm font-semibold px-3 py-1.5 rounded-lg cursor-pointer outline-none border border-[var(--border)] bg-[var(--input-bg)] text-[var(--text)]"
				>
					<option value="year">This Year</option>
					<option value="prev">Last Year</option>
					<option value="all">All Time</option>
				</select>
			</div>
			{outcomes.length === 0 && incomes.length === 0 ? (
				<div className="text-center py-20 text-sm" style={{ color: 'var(--text-muted)' }}>{t('statistics.noData')}</div>
			) : (
				<div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
					{/* Spending by Category */}
					<div style={cardStyle}>
						<h2 className="text-sm font-bold mb-4" style={{ color: 'var(--text)' }}>{t('statistics.spendingByCategory')}</h2>
						{categoryData.length > 0 ? (
							<ResponsiveContainer width="100%" height={280}>
								<PieChart>
									<Pie data={categoryData.slice(0, 8)} cx="50%" cy="50%" outerRadius={100} innerRadius={50}
										dataKey="value" paddingAngle={2} stroke="none">
										{categoryData.slice(0, 8).map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
									</Pie>
									<Tooltip 
										formatter={v => `${v.toLocaleString()} ${currency}`} 
										contentStyle={{ borderRadius: 10, border: '1px solid var(--border)', background: 'var(--card)', color: 'var(--text)' }} 
										itemStyle={{ color: 'var(--text)' }} 
									/>
								</PieChart>
							</ResponsiveContainer>
						) : <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{t('statistics.noData')}</p>}
						<div className="flex flex-wrap gap-2 mt-3">
							{categoryData.slice(0, 8).map((c, i) => (
								<div key={c.name} className="flex items-center gap-1.5 text-xs" style={{ color: 'var(--text-soft)' }}>
									<span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: COLORS[i % COLORS.length] }} />
									{c.name}
								</div>
							))}
						</div>
					</div>

					{/* Income vs Expenses */}
					<div style={cardStyle}>
						<h2 className="text-sm font-bold mb-4" style={{ color: 'var(--text)' }}>{t('statistics.incomeVsExpenses')}</h2>
						<ResponsiveContainer width="100%" height={280}>
							<AreaChart data={monthlyTrend}>
								<defs>
									<linearGradient id="gInc" x1="0" y1="0" x2="0" y2="1">
										<stop offset="5%" stopColor="#6daf5f" stopOpacity={0.3} />
										<stop offset="95%" stopColor="#6daf5f" stopOpacity={0} />
									</linearGradient>
									<linearGradient id="gExp" x1="0" y1="0" x2="0" y2="1">
										<stop offset="5%" stopColor="#e05252" stopOpacity={0.3} />
										<stop offset="95%" stopColor="#e05252" stopOpacity={0} />
									</linearGradient>
								</defs>
								<CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
								<XAxis dataKey="name" tick={{ fontSize: 11, fill: 'var(--text-muted)' }} />
								<YAxis tick={{ fontSize: 11, fill: 'var(--text-muted)' }} width={50} />
								<Tooltip 
									contentStyle={{ borderRadius: 10, border: '1px solid var(--border)', background: 'var(--card)', color: 'var(--text)' }} 
									itemStyle={{ color: 'var(--text)' }} 
								/>
								<Area type="monotone" dataKey="income" stroke="#6daf5f" fill="url(#gInc)" strokeWidth={2} name={t('statistics.income')} />
								<Area type="monotone" dataKey="expenses" stroke="#e05252" fill="url(#gExp)" strokeWidth={2} name={t('statistics.expenses')} />
							</AreaChart>
						</ResponsiveContainer>
					</div>

					{/* Monthly Breakdown */}
					<div style={cardStyle}>
						<h2 className="text-sm font-bold mb-4" style={{ color: 'var(--text)' }}>{t('statistics.monthlyBreakdown')}</h2>
						<ResponsiveContainer width="100%" height={280}>
							<BarChart data={monthlyBreakdown}>
								<CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
								<XAxis dataKey="name" tick={{ fontSize: 11, fill: 'var(--text-muted)' }} />
								<YAxis tick={{ fontSize: 11, fill: 'var(--text-muted)' }} width={50} />
								<Tooltip 
									contentStyle={{ borderRadius: 10, border: '1px solid var(--border)', background: 'var(--card)', color: 'var(--text)' }} 
									itemStyle={{ color: 'var(--text)' }} 
								/>
								<Legend />
								<Bar dataKey="income" fill="#6daf5f" radius={[4, 4, 0, 0]} name={t('statistics.income')} />
								<Bar dataKey="expenses" fill="#e05252" radius={[4, 4, 0, 0]} name={t('statistics.expenses')} />
							</BarChart>
						</ResponsiveContainer>
					</div>

					{/* Budget Usage */}
					<div style={cardStyle}>
						<h2 className="text-sm font-bold mb-4" style={{ color: 'var(--text)' }}>{t('statistics.budgetUsage')}</h2>
						{budgetUsage.length > 0 ? (
							<div className="flex flex-col gap-4">
								{budgetUsage.map(b => {
									const remaining = b.budget - b.spent;
									const isExceeded = remaining < 0;
									const displayRemaining = isExceeded 
										? `−${Math.abs(remaining).toLocaleString('en-US', { minimumFractionDigits: 2 })}` 
										: `${remaining.toLocaleString('en-US', { minimumFractionDigits: 2 })}`;
										
									const textColor = b.pct >= 90 ? '#dc2626' : b.pct >= 70 ? '#b45309' : '#166534';
									const barColor = b.pct >= 90 ? '#ef4444' : b.pct >= 70 ? '#f59e0b' : '#22c55e';
									
									return (
										<div key={b.name}>
											<div className="flex justify-between text-xs mb-1">
												<span className="font-semibold" style={{ color: 'var(--text)' }}>{b.name}</span>
												<span style={{ color: textColor, fontWeight: 'bold' }}>
													{b.pct}%
												</span>
											</div>
											<div className="w-full h-2.5 rounded-full" style={{ background: 'var(--border)' }}>
												<div className="h-2.5 rounded-full transition-all duration-500"
													style={{
														width: `${Math.min(b.pct, 100)}%`,
														background: barColor,
													}} />
											</div>
											<div className="text-xs mt-1" style={{ color: 'var(--text-soft)' }}>
												{isExceeded 
													? `Limit exceeded by ${displayRemaining} ${currency}` 
													: `${displayRemaining} ${currency} left of ${b.budget.toLocaleString('en-US')} ${currency}`}
											</div>
										</div>
									);
								})}
							</div>
						) : <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{t('statistics.noData')}</p>}
					</div>

					{/* Top Categories */}
					<div style={{ ...cardStyle }} className="lg:col-span-2">
						<h2 className="text-sm font-bold mb-4" style={{ color: 'var(--text)' }}>{t('statistics.topCategories')}</h2>
						<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
							{categoryData.slice(0, 6).map((c, i) => {
								const total = categoryData.reduce((s, x) => s + x.value, 0);
								const pct = total > 0 ? Math.round(c.value / total * 100) : 0;
								return (
									<div key={c.name} className="rounded-xl px-4 py-3 flex items-center gap-3"
										style={{ background: 'var(--input-bg)', border: '1px solid var(--border)' }}>
										<div className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-xs font-bold shrink-0"
											style={{ background: COLORS[i % COLORS.length] }}>
											#{i + 1}
										</div>
										<div className="flex-1 min-w-0">
											<p className="text-sm font-semibold truncate" style={{ color: 'var(--text)' }}>{c.name}</p>
											<p className="text-xs" style={{ color: 'var(--text-soft)' }}>{c.value.toLocaleString()} {currency} · {pct}%</p>
										</div>
									</div>
								);
							})}
						</div>
					</div>
				</div>
			)}
		</div>
	);
};

export default Statistics;
