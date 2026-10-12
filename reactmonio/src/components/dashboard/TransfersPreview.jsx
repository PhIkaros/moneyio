import { Link } from 'react-router-dom';
import { Plus } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTranslation } from 'react-i18next';

const safeAmount = (val) => parseFloat(val) || 0;
const TX_COLORS = ['#3d8fc4', '#5aa04a', '#f58c2a', '#2a9d8f', '#9b59b6', '#239dca'];

const TransfersPreview = ({ transfers, onAdd }) => {
	const { user } = useAuth();
	const { t } = useTranslation();
	const currency = user?.currency || 'MAD';

	const getIcon = (fromCompteName, toCompteName, idx) => ({
		bg: `${TX_COLORS[idx % TX_COLORS.length]}18`,
		color: TX_COLORS[idx % TX_COLORS.length],
		letter: (toCompteName || 'T')[0]?.toUpperCase(),
	});

	return (
		<div className="rounded-2xl p-5 shadow-sm" style={{ background: 'var(--card)' }}>
			<div className="flex items-center justify-between mb-4">
				<h3 className="text-base font-bold" style={{ color: 'var(--text)' }}>Transfers</h3>
				<div className="flex items-center gap-2">
					<button onClick={onAdd}
						className="w-6 h-6 rounded-full flex items-center justify-center cursor-pointer border-none"
						style={{ background: 'var(--input-bg)' }}>
						<Plus size={12} style={{ color: 'var(--primary-light)' }} />
					</button>
					<Link to="/ledger" className="text-sm font-medium hover:underline" style={{ color: 'var(--primary-light)' }}>
						View All &gt;
					</Link>
				</div>
			</div>
			{transfers.length === 0 ? (
				<p className="text-xs text-center py-4" style={{ color: 'var(--text-muted)' }}>No transfers yet.</p>
			) : (
				<div className="flex flex-col gap-3">
					{transfers.slice(0, 3).map((item, idx) => {
						const fromName = item.from_compte?.name || item.from_compte_id || 'Unknown';
						const toName = item.to_compte?.name || item.to_compte_id || 'Unknown';
						const icon = getIcon(fromName, toName, idx);
						return (
							<div key={item.id} className="flex items-center gap-3">
								<div className="w-9 h-9 rounded-xl flex items-center justify-center font-bold text-sm shrink-0"
									style={{ background: icon.bg, color: icon.color }}>
									{icon.letter}
								</div>
								<div className="flex-1 min-w-0">
									<strong className="text-sm truncate block" style={{ color: 'var(--text)' }}>
										{item.description || 'Transfer'}
									</strong>
									<span className="text-[10px]" style={{ color: 'var(--text-muted)' }}>{item.date}</span>
								</div>
								<span className="text-sm font-semibold text-[var(--primary)] whitespace-nowrap">
									{safeAmount(item.amount).toLocaleString('en-US', { minimumFractionDigits: 2 })} {currency}
								</span>
							</div>
						);
					})}
				</div>
			)}
		</div>
	);
};

export default TransfersPreview;
