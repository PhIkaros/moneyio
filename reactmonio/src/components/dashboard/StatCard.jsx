import { Plus } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const StatCard = ({ title, amount, percent, color, bg, onAdd }) => {
	const { user } = useAuth();
	const currency = user?.currency || 'MAD';
	
	return (
	<div className="rounded-2xl p-5 shadow-sm flex-1" style={{ background: 'var(--card)' }}>
		<div className="flex items-center justify-between mb-2.5">
			<span className="text-sm font-semibold" style={{ color: 'var(--text-soft)' }}>{title}</span>
		</div>
		<div className="flex items-center justify-between">
			<div>
				<h2 className="text-2xl font-bold tracking-tight" style={{ color: 'var(--text)' }}>
					{amount.toLocaleString('en-US', { minimumFractionDigits: 2 })} {currency}
				</h2>
				<small className="text-[11px]" style={{ color: 'var(--text-muted)' }}>All time</small>
			</div>
			<div className="flex items-center gap-2">
				{percent !== null && (
					<span className="px-2.5 py-1 rounded-full text-xs font-bold"
						style={{ background: bg, color }}>
						{percent >= 0 ? '+' : ''}{percent}%
					</span>
				)}
				<button onClick={onAdd}
					className="w-6 h-6 rounded-full flex items-center justify-center cursor-pointer border-none"
					style={{ background: bg }}>
					<Plus size={12} style={{ color }} />
				</button>
			</div>
		</div>
	</div>
	);
};

export default StatCard;