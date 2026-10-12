import { useState, useEffect, useMemo } from 'react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from 'react-i18next';
import CardStack from '../components/dashboard/CardStack';
import FilterPills from '../components/dashboard/FilterPills';
import RevenueChart from '../components/dashboard/RevenueChart';
import RecentActivity from '../components/dashboard/RecentActivity';
import StatCard from '../components/dashboard/StatCard';
import TransfersPreview from '../components/dashboard/TransfersPreview';
import FinancialInsights from '../components/dashboard/FinancialInsights';
import ChecklistCard from '../components/dashboard/ChecklistCard';
import TransactionModal from '../components/modals/TransactionModal';
import AccountDrawer from '../components/drawers/AccountDrawer';
import { getBudgets } from '../services/budgetService';
import { useBudgetAlerts } from '../hooks/useBudgetAlerts';
import BudgetAlerts from '../components/dashboard/BudgetAlerts';
import BudgetModal from '../components/modals/BudgetModal';

const API_BASE = 'http://127.0.0.1:8000';
const safeAmount = (val) => parseFloat(val) || 0;

const Dashboard = () => {
	const { user } = useAuth();
	const { t } = useTranslation();

	const [comptes, setComptes] = useState([]);
	const [activeIndex, setActiveIndex] = useState(-1);
	const [outcomes, setOutcomes] = useState([]);
	const [incomes, setIncomes] = useState([]);
	const [budgets, setBudgets] = useState([]);
	const [transferts, setTransferts] = useState([]);
	const [pinnedNotes, setPinnedNotes] = useState([]);
	const [loading, setLoading] = useState(true);
	const [activeFilter, setActiveFilter] = useState('All');
	const [timeFilter, setTimeFilter] = useState('6m');
	const [modalOpen, setModalOpen] = useState(false);
	const [modalType, setModalType] = useState('outcome');
	const [drawerOpen, setDrawerOpen] = useState(false);
	const [dropdownOpen, setDropdownOpen] = useState(false);
	const [budgetModalOpen, setBudgetModalOpen] = useState(false);

	const openModal = (type) => { setModalType(type); setModalOpen(true); };

	useEffect(() => {
		Promise.all([
			api.get('/comptes'),
			api.get('/outcomes'),
			api.get('/incomes'),
			api.get('/notes'),
			getBudgets(),
			api.get('/transferts'),
		]).then(([cR, oR, iR, nR, budgetsData, tR]) => {
			setComptes(cR.data);
			setOutcomes(oR.data);
			setIncomes(iR.data);
			setPinnedNotes(nR.data.filter(n => n.pinned_dashboard).slice(0, 2));
			setBudgets(budgetsData);
			setTransferts(tR.data);
		}).catch(console.error).finally(() => setLoading(false));
	}, []);

	const handleSuccess = (newItem, type) => {
		if (type === 'income') setIncomes(prev => [newItem, ...prev]);
		else if (type === 'transfer') setTransferts(prev => [newItem, ...prev]);
		else setOutcomes(prev => [newItem, ...prev]);
	};

	const handleAccountCreated = (newCompte) => {
		setComptes(prev => {
			const updated = [...prev, newCompte];
			setActiveIndex(updated.length - 1);
			return updated;
		});
	};

	const handleBudgetSuccess = (newBudget, isEdit) => {
		setBudgets(prev =>
			isEdit
				? prev.map(b => b.id === newBudget.id ? newBudget : b)
				: [newBudget, ...prev]
		);
	};

	const isAll = activeIndex === -1;
	const activeCompte = isAll ? null : comptes[activeIndex];

	const filteredIncomes = useMemo(() =>
		isAll ? incomes : incomes.filter(i => i.compte_id === activeCompte?.id),
		[incomes, isAll, activeCompte]
	);
	const filteredOutcomes = useMemo(() =>
		isAll ? outcomes : outcomes.filter(o => o.compte_id === activeCompte?.id),
		[outcomes, isAll, activeCompte]
	);

	const filteredTransfers = useMemo(() =>
		isAll ? transferts : transferts.filter(t => t.from_compte_id === activeCompte?.id || t.to_compte_id === activeCompte?.id),
		[transferts, isAll, activeCompte]
	);

	const totalIncome = filteredIncomes.reduce((s, i) => s + safeAmount(i.amount), 0);
	const totalOutcome = filteredOutcomes.reduce((s, o) => s + safeAmount(o.amount), 0);

	const now = new Date();
	const ofMonth = (arr, m) => arr.filter(i => i.date && new Date(i.date).getMonth() === m);

	const incomePct = (() => {
		const last = ofMonth(filteredIncomes, now.getMonth() - 1).reduce((s, i) => s + safeAmount(i.amount), 0);
		const curr = ofMonth(filteredIncomes, now.getMonth()).reduce((s, i) => s + safeAmount(i.amount), 0);
		return last ? Math.round((curr / last - 1) * 100) : null;
	})();

	const outcomePct = (() => {
		const last = ofMonth(filteredOutcomes, now.getMonth() - 1).reduce((s, o) => s + safeAmount(o.amount), 0);
		const curr = ofMonth(filteredOutcomes, now.getMonth()).reduce((s, o) => s + safeAmount(o.amount), 0);
		return last ? Math.round((curr / last - 1) * 100) : null;
	})();

	const alerts = useBudgetAlerts(budgets, filteredOutcomes);

	const chartData = useMemo(() => {
		if (timeFilter === '6m') {
			return Array.from({ length: 6 }, (_, i) => {
				const monthIndex = (now.getMonth() - 5 + i + 12) % 12;
				const label = new Date(now.getFullYear(), monthIndex).toLocaleString('en-US', { month: 'short' });
				const income = ofMonth(filteredIncomes, monthIndex).reduce((s, x) => s + safeAmount(x.amount), 0);
				const expense = ofMonth(filteredOutcomes, monthIndex).reduce((s, x) => s + safeAmount(x.amount), 0);
				return { name: label, income, expense, highlight: monthIndex === now.getMonth() };
			});
		} else if (timeFilter === 'year') {
			const yr = now.getFullYear();
			return Array.from({ length: 12 }, (_, i) => {
				const label = new Date(yr, i).toLocaleString('en-US', { month: 'short' });
				const income = filteredIncomes.filter(x => { const d = new Date(x.date); return d.getMonth() === i && d.getFullYear() === yr; }).reduce((s, x) => s + safeAmount(x.amount), 0);
				const expense = filteredOutcomes.filter(x => { const d = new Date(x.date); return d.getMonth() === i && d.getFullYear() === yr; }).reduce((s, x) => s + safeAmount(x.amount), 0);
				return { name: label, income, expense, highlight: i === now.getMonth() };
			});
		} else if (timeFilter === 'prev') {
			const prevYr = now.getFullYear() - 1;
			return Array.from({ length: 12 }, (_, i) => {
				const label = new Date(prevYr, i).toLocaleString('en-US', { month: 'short' });
				const income = filteredIncomes.filter(x => { const d = new Date(x.date); return d.getMonth() === i && d.getFullYear() === prevYr; }).reduce((s, x) => s + safeAmount(x.amount), 0);
				const expense = filteredOutcomes.filter(x => { const d = new Date(x.date); return d.getMonth() === i && d.getFullYear() === prevYr; }).reduce((s, x) => s + safeAmount(x.amount), 0);
				return { name: label, income, expense, highlight: false };
			});
		}
		return [];
	}, [timeFilter, filteredIncomes, filteredOutcomes]);

	const recentActivity = [
		...filteredOutcomes.slice(0, 4).map(o => ({ ...o, _type: 'outcome' })),
		...filteredIncomes.slice(0, 4).map(i => ({ ...i, _type: 'income' })),
		...filteredTransfers.slice(0, 4).map(t => ({ ...t, _type: 'transfer' })),
	].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 6);

	const avatarUrl = user?.avatar ? `${API_BASE}/storage/${user.avatar}` : null;

	if (loading) return (
		<div className="flex items-center justify-center h-screen">
			<div className="w-9 h-9 border-[3px] rounded-full animate-spin"
				style={{ borderColor: 'var(--border)', borderTopColor: 'var(--primary-light)' }} />
		</div>
	);

	return (
		<div className="font-sans">
			<main>
				{/* Header — no search bar */}
				<header className="flex items-center justify-between mb-5 sm:mb-7">
					<h1 className="text-xl sm:text-3xl font-bold tracking-tight" style={{ color: 'var(--text)' }}>
						{t('dashboard.title')}
					</h1>
					<div className="flex items-center gap-3 text-[15px] font-medium" style={{ color: 'var(--text)' }}>
						<span>{t('dashboard.hi')} {user?.name || 'User'}</span>
					</div>
				</header>

				{/* Responsive grid: 2 cols on desktop, single column on mobile */}
				<div className="grid grid-cols-1 lg:grid-cols-[1fr_310px] gap-5 items-start">

					{/* LEFT */}
					<div className="flex flex-col gap-5">
						<RevenueChart data={chartData} timeFilter={timeFilter} setTimeFilter={setTimeFilter} />

						<div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
							<RecentActivity items={recentActivity} />
							<div className="flex flex-col gap-3.5">
								<StatCard
									title={t('dashboard.income')}
									amount={totalIncome}
									percent={incomePct}
									color="#6daf5f"
									bg="#edf7e6"
									onAdd={() => openModal('income')}
								/>
								<StatCard
									title={t('dashboard.expense')}
									amount={totalOutcome}
									percent={outcomePct}
									color="#239dca"
									bg="#e0f4f8"
									onAdd={() => openModal('outcome')}
								/>
							</div>
						</div>

						<FinancialInsights />
					</div>

					{/* RIGHT */}
					<div className="flex flex-col gap-4">
						{comptes.length > 0 ? (
							<CardStack
								comptes={comptes}
								activeIndex={activeIndex}
								onSelect={setActiveIndex}
								onAdd={() => openModal('outcome')}
								onNewAccount={() => setDrawerOpen(true)}
								dropdownOpen={dropdownOpen}
								setDropdownOpen={setDropdownOpen}
							/>
						) : (
							<div className="rounded-2xl p-5 shadow-sm text-center" style={{ background: 'var(--card)' }}>
								<p className="text-xs mb-3" style={{ color: 'var(--text-muted)' }}>{t('dashboard.noAccounts')}</p>
								<button onClick={() => setDrawerOpen(true)}
									className="px-4 py-2 rounded-xl text-sm font-semibold text-white cursor-pointer border-none"
									style={{ background: 'var(--primary)' }}>
									{t('dashboard.addAccount')}
								</button>
							</div>
						)}

						<div className="flex items-center justify-between px-1">
							<span className="text-xs font-semibold" style={{ color: 'var(--text-muted)' }}>{t('dashboard.budgets')}</span>
							<button onClick={() => setBudgetModalOpen(true)}
								className="text-xs font-semibold border-none bg-transparent cursor-pointer"
								style={{ color: 'var(--primary)' }}>
								{t('dashboard.setBudget')}
							</button>
						</div>

						<BudgetAlerts alerts={alerts} />
						<TransfersPreview
							transfers={filteredTransfers}
							onAdd={() => openModal('transfer')}
						/>

						{pinnedNotes.length > 0
							? pinnedNotes.map(note => <ChecklistCard key={note.id} note={note} />)
							: (
								<div className="rounded-[18px] p-4 shadow-sm text-center" style={{ background: 'var(--card)' }}>
									<p className="text-xs" style={{ color: 'var(--text-muted)' }}>
										{t('dashboard.pinNotes')}
									</p>
								</div>
							)}
					</div>
				</div>
			</main>

			<TransactionModal
				isOpen={modalOpen}
				onClose={() => setModalOpen(false)}
				defaultType={modalType}
				onSuccess={handleSuccess}
			/>
			<AccountDrawer
				isOpen={drawerOpen}
				onClose={() => setDrawerOpen(false)}
				onSuccess={handleAccountCreated}
			/>
			<BudgetModal
				isOpen={budgetModalOpen}
				onClose={() => setBudgetModalOpen(false)}
				onSuccess={handleBudgetSuccess}
			/>
		</div>
	);
};

export default Dashboard;