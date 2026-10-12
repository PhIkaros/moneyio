import { Link } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { useAuth } from '../../context/AuthContext';

const RevenueChart = ({ data, timeFilter, setTimeFilter }) => {
	const { user } = useAuth();
	const currency = user?.currency || 'MAD';

	return (
	<div className="rounded-2xl p-6 shadow-sm" style={{ background: 'var(--card)' }}>
		<div className="flex items-center justify-between mb-2">
			<h3 className="text-base font-bold" style={{ color: 'var(--text)' }}>Cash Flow</h3>
			
			<div className="flex items-center gap-3">
				<select 
					value={timeFilter} 
					onChange={(e) => setTimeFilter(e.target.value)}
					className="text-xs font-semibold px-2 py-1 rounded-lg cursor-pointer outline-none border border-[var(--border)] bg-[var(--input-bg)] text-[var(--text)]"
				>
					<option value="6m">Last 6 Months</option>
					<option value="year">This Year</option>
					<option value="prev">Last Year</option>
				</select>
				<Link to="/ledger" className="text-sm font-medium hover:underline" style={{ color: 'var(--primary-light)' }}>
					View All &gt;
				</Link>
			</div>
		</div>
		<ResponsiveContainer width="100%" height={210}>
			<BarChart data={data} barCategoryGap="28%">
				<XAxis dataKey="name" axisLine={false} tickLine={false}
					tick={{ fill: 'var(--text-soft)', fontSize: 13 }} />
				<YAxis axisLine={false} tickLine={false}
					tick={{ fill: 'var(--text-soft)', fontSize: 12 }}
					tickFormatter={v => v === 0 ? '0' : `${(v / 1000).toFixed(1)}k ${currency}`} />
				<Tooltip cursor={{ fill: 'transparent' }}
					formatter={(v, name) => [`${v.toLocaleString()} ${currency}`, name === 'income' ? 'Income' : 'Expense']}
					contentStyle={{ borderRadius: 10, border: '1px solid var(--border)', boxShadow: '0 4px 20px rgba(0,0,0,0.1)', background: 'var(--card)', color: 'var(--text)' }} 
					itemStyle={{ color: 'var(--text)' }} />
				<Bar dataKey="income" radius={[12, 12, 12, 12]} barSize={20} minPointSize={3}>
					{data.map((entry, i) => (
						<Cell key={`inc-${i}`}
							fill={entry.highlight ? '#8CC850' : '#8CC85088'}
						/>
					))}
				</Bar>
				<Bar dataKey="expense" radius={[12, 12, 12, 12]} barSize={20} minPointSize={3}>
					{data.map((entry, i) => (
						<Cell key={`exp-${i}`}
							fill={entry.highlight ? '#e05252' : '#e0525288'}
						/>
					))}
				</Bar>
			</BarChart>
		</ResponsiveContainer>
	</div>
	);
};

export default RevenueChart;