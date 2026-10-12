import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Users, ArrowUpRight, ArrowDownLeft, Activity, Trash2, Shield, ShieldOff, UserCheck, UserX } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const AdminDashboard = () => {
	const { t } = useTranslation();
	const { user } = useAuth();
	const currency = user?.currency || 'MAD';
	const [stats, setStats] = useState(null);
	const [users, setUsers] = useState([]);
	const [loading, setLoading] = useState(true);
	const [delConfirm, setDelConfirm] = useState(null);

	useEffect(() => {
		Promise.all([
			api.get('/admin/dashboard'),
			api.get('/admin/users'),
		]).then(([sR, uR]) => {
			setStats(sR.data);
			setUsers(uR.data);
		}).catch(console.error)
			.finally(() => setLoading(false));
	}, []);

	const toggleRole = async (user) => {
		const newRole = user.role === 'admin' ? 'user' : 'admin';
		try {
			const res = await api.put(`/admin/users/${user.id}`, { role: newRole });
			setUsers(prev => prev.map(u => u.id === user.id ? { ...u, ...res.data } : u));
		} catch (e) { console.error(e); }
	};

	const toggleActive = async (user) => {
		try {
			const res = await api.put(`/admin/users/${user.id}`, { is_active: !user.is_active });
			setUsers(prev => prev.map(u => u.id === user.id ? { ...u, ...res.data } : u));
		} catch (e) { console.error(e); }
	};

	const deleteUser = async (id) => {
		try {
			await api.delete(`/admin/users/${id}`);
			setUsers(prev => prev.filter(u => u.id !== id));
			setDelConfirm(null);
		} catch (e) { console.error(e); }
	};

	const card = {
		background: 'var(--card)', borderRadius: 20, padding: 20,
		border: '1px solid var(--border)', boxShadow: 'var(--shadow-soft)',
	};

	if (loading) return (
		<div className="flex items-center justify-center h-64">
			<div className="w-9 h-9 border-[3px] rounded-full animate-spin"
				style={{ borderColor: 'var(--border)', borderTopColor: 'var(--primary-light)' }} />
		</div>
	);

	const statCards = [
		{ label: t('admin.totalUsers'), value: stats?.total_users ?? 0, icon: Users, color: '#3b82f6', bg: '#eff6ff' },
		{ label: t('admin.totalTransactions'), value: stats?.total_transactions ?? 0, icon: Activity, color: '#8b5cf6', bg: '#f5f3ff' },
		{ label: t('admin.totalIncome'), value: `${(stats?.total_income_amount ?? 0).toLocaleString()} ${currency}`, icon: ArrowDownLeft, color: '#6daf5f', bg: '#edf7e6' },
		{ label: t('admin.totalExpenses'), value: `${(stats?.total_expense_amount ?? 0).toLocaleString()} ${currency}`, icon: ArrowUpRight, color: '#e05252', bg: '#fdecea' },
	];

	return (
		<div className="max-w-6xl mx-auto px-4 py-6">
			<h1 className="text-2xl sm:text-3xl font-bold tracking-tight mb-6" style={{ color: 'var(--text)' }}>
				{t('admin.title')}
			</h1>

			{/* Stat Cards */}
			<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
				{statCards.map(s => (
					<div key={s.label} style={card} className="flex items-center gap-4">
						<div className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0" style={{ background: s.bg }}>
							<s.icon size={20} style={{ color: s.color }} />
						</div>
						<div>
							<p className="text-xs font-semibold" style={{ color: 'var(--text-soft)' }}>{s.label}</p>
							<p className="text-lg font-bold" style={{ color: 'var(--text)' }}>{s.value}</p>
						</div>
					</div>
				))}
			</div>

			<div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-6">
				{/* Signups Over Time */}
				<div style={card}>
					<h2 className="text-sm font-bold mb-4" style={{ color: 'var(--text)' }}>{t('admin.signupsOverTime')}</h2>
					{stats?.signups_over_time?.length > 0 ? (
						<ResponsiveContainer width="100%" height={220}>
							<BarChart data={stats.signups_over_time}>
								<CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
								<XAxis dataKey="month" tick={{ fontSize: 10, fill: 'var(--text-muted)' }} />
								<YAxis tick={{ fontSize: 10, fill: 'var(--text-muted)' }} width={30} allowDecimals={false} />
								<Tooltip 
									contentStyle={{ borderRadius: 10, border: '1px solid var(--border)', background: 'var(--card)', color: 'var(--text)' }} 
									itemStyle={{ color: 'var(--text)' }} 
								/>
								<Bar dataKey="count" fill="var(--primary)" radius={[4, 4, 0, 0]} name="Signups" />
							</BarChart>
						</ResponsiveContainer>
					) : <p className="text-xs" style={{ color: 'var(--text-muted)' }}>No data yet.</p>}
				</div>

				{/* Most Active Users */}
				<div style={card}>
					<h2 className="text-sm font-bold mb-4" style={{ color: 'var(--text)' }}>{t('admin.mostActiveUsers')}</h2>
					<div className="flex flex-col gap-2">
						{(stats?.most_active_users || []).map((u, i) => (
							<div key={u.id} className="flex items-center gap-3 px-3 py-2 rounded-xl" style={{ background: 'var(--input-bg)' }}>
								<span className="w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0"
									style={{ background: 'var(--primary)' }}>
									{i + 1}
								</span>
								<div className="flex-1 min-w-0">
									<p className="text-sm font-semibold truncate" style={{ color: 'var(--text)' }}>{u.name}</p>
									<p className="text-xs truncate" style={{ color: 'var(--text-soft)' }}>{u.email}</p>
								</div>
								<span className="text-xs font-bold shrink-0" style={{ color: 'var(--primary)' }}>
									{u.transaction_count} txns
								</span>
							</div>
						))}
					</div>
				</div>
			</div>

			{/* User Management */}
			<div style={card}>
				<h2 className="text-sm font-bold mb-4" style={{ color: 'var(--text)' }}>{t('admin.userManagement')}</h2>

				{/* Desktop table */}
				<div className="hidden md:block overflow-x-auto">
					<table className="w-full text-left" style={{ borderCollapse: 'separate', borderSpacing: '0 4px' }}>
						<thead>
							<tr className="text-xs font-bold uppercase" style={{ color: 'var(--text-soft)' }}>
								<th className="px-4 py-2">{t('admin.name')}</th>
								<th className="px-4 py-2">{t('admin.email')}</th>
								<th className="px-4 py-2">{t('admin.role')}</th>
								<th className="px-4 py-2">{t('admin.status')}</th>
								<th className="px-4 py-2">{t('admin.joined')}</th>
								<th className="px-4 py-2 text-right">{t('admin.actions')}</th>
							</tr>
						</thead>
						<tbody>
							{users.map(u => (
								<tr key={u.id} className="rounded-xl" style={{ background: 'var(--input-bg)' }}>
									<td className="px-4 py-3 text-sm font-semibold rounded-l-xl" style={{ color: 'var(--text)' }}>{u.name}</td>
									<td className="px-4 py-3 text-xs" style={{ color: 'var(--text-soft)' }}>{u.email}</td>
									<td className="px-4 py-3">
										<span className="px-2.5 py-1 rounded-full text-xs font-bold"
											style={{
												background: u.role === 'admin' ? '#f5f3ff' : '#eff6ff',
												color: u.role === 'admin' ? '#6d28d9' : '#1e40af',
											}}>
											{u.role}
										</span>
									</td>
									<td className="px-4 py-3">
										<span className="px-2.5 py-1 rounded-full text-xs font-bold"
											style={{
												background: u.is_active ? '#edf7e6' : '#fdecea',
												color: u.is_active ? '#2d6b1a' : '#e05252',
											}}>
											{u.is_active ? t('admin.active') : t('admin.inactive')}
										</span>
									</td>
									<td className="px-4 py-3 text-xs" style={{ color: 'var(--text-soft)' }}>
										{new Date(u.created_at).toLocaleDateString()}
									</td>
									<td className="px-4 py-3 rounded-r-xl">
										<div className="flex items-center justify-end gap-1.5">
											<button onClick={() => toggleRole(u)} title={u.role === 'admin' ? t('admin.makeUser') : t('admin.makeAdmin')}
												className="w-7 h-7 rounded-lg flex items-center justify-center border-none cursor-pointer transition-colors"
												style={{ background: '#f5f3ff', color: '#6d28d9' }}>
												{u.role === 'admin' ? <ShieldOff size={13} /> : <Shield size={13} />}
											</button>
											<button onClick={() => toggleActive(u)} title={u.is_active ? t('admin.deactivate') : t('admin.activate')}
												className="w-7 h-7 rounded-lg flex items-center justify-center border-none cursor-pointer transition-colors"
												style={{ background: u.is_active ? '#fdecea' : '#edf7e6', color: u.is_active ? '#e05252' : '#2d6b1a' }}>
												{u.is_active ? <UserX size={13} /> : <UserCheck size={13} />}
											</button>
											{delConfirm === u.id ? (
												<div className="flex items-center gap-1">
													<button onClick={() => deleteUser(u.id)}
														className="px-2 py-1 rounded-lg text-xs font-bold text-white border-none cursor-pointer"
														style={{ background: '#e05252' }}>Yes</button>
													<button onClick={() => setDelConfirm(null)}
														className="px-2 py-1 rounded-lg text-xs font-bold border-none cursor-pointer"
														style={{ background: 'var(--border)', color: 'var(--text)' }}>No</button>
												</div>
											) : (
												<button onClick={() => setDelConfirm(u.id)}
													className="w-7 h-7 rounded-lg flex items-center justify-center border-none cursor-pointer transition-colors"
													style={{ background: '#fdecea', color: '#e05252' }}>
													<Trash2 size={13} />
												</button>
											)}
										</div>
									</td>
								</tr>
							))}
						</tbody>
					</table>
				</div>

				{/* Mobile cards */}
				<div className="flex flex-col gap-3 md:hidden">
					{users.map(u => (
						<div key={u.id} className="rounded-xl p-4" style={{ background: 'var(--input-bg)', border: '1px solid var(--border)' }}>
							<div className="flex items-start justify-between mb-2">
								<div>
									<p className="text-sm font-bold" style={{ color: 'var(--text)' }}>{u.name}</p>
									<p className="text-xs" style={{ color: 'var(--text-soft)' }}>{u.email}</p>
								</div>
								<div className="flex gap-1.5">
									<span className="px-2 py-0.5 rounded-full text-[10px] font-bold"
										style={{ background: u.role === 'admin' ? '#f5f3ff' : '#eff6ff', color: u.role === 'admin' ? '#6d28d9' : '#1e40af' }}>
										{u.role}
									</span>
									<span className="px-2 py-0.5 rounded-full text-[10px] font-bold"
										style={{ background: u.is_active ? '#edf7e6' : '#fdecea', color: u.is_active ? '#2d6b1a' : '#e05252' }}>
										{u.is_active ? t('admin.active') : t('admin.inactive')}
									</span>
								</div>
							</div>
							<div className="flex items-center gap-2 mt-3">
								<button onClick={() => toggleRole(u)}
									className="flex-1 py-1.5 rounded-lg text-xs font-semibold border-none cursor-pointer"
									style={{ background: '#f5f3ff', color: '#6d28d9' }}>
									{u.role === 'admin' ? t('admin.makeUser') : t('admin.makeAdmin')}
								</button>
								<button onClick={() => toggleActive(u)}
									className="flex-1 py-1.5 rounded-lg text-xs font-semibold border-none cursor-pointer"
									style={{ background: u.is_active ? '#fdecea' : '#edf7e6', color: u.is_active ? '#e05252' : '#2d6b1a' }}>
									{u.is_active ? t('admin.deactivate') : t('admin.activate')}
								</button>
								<button onClick={() => delConfirm === u.id ? deleteUser(u.id) : setDelConfirm(u.id)}
									className="w-8 h-8 rounded-lg flex items-center justify-center border-none cursor-pointer shrink-0"
									style={{ background: '#fdecea', color: '#e05252' }}>
									<Trash2 size={14} />
								</button>
							</div>
						</div>
					))}
				</div>
			</div>
		</div>
	);
};

export default AdminDashboard;
