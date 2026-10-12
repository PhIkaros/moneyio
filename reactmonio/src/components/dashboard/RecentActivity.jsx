import { Link } from 'react-router-dom';
import { ArrowDownLeft, ArrowUpRight, ArrowRightLeft } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTranslation } from 'react-i18next';

const safeAmount = (val) => parseFloat(val) || 0;

const RecentActivity = ({ items }) => {
    const { user } = useAuth();
    const currency = user?.currency || 'MAD';
    const { t } = useTranslation();
    
    return (
	<div className="rounded-2xl p-5 shadow-sm" style={{ background: 'var(--card)' }}>
		<div className="flex items-center justify-between mb-4">
			<h3 className="text-base font-bold" style={{ color: 'var(--text)' }}>{t('dashboard.recentActivity', 'Recent Activity')}</h3>
			<Link to="/ledger" className="text-sm font-medium hover:underline" style={{ color: 'var(--primary-light)' }}>
				{t('dashboard.viewAll', 'View All >')}
			</Link>
		</div>
		{items.length === 0 ? (
			<p className="text-xs text-center py-6" style={{ color: 'var(--text-muted)' }}>{t('dashboard.noActivity', 'No activity yet.')}</p>
		) : (
			<div className="flex flex-col gap-2.5 max-h-[180px] overflow-y-auto pr-1">
				{items.map(item => (
					<div key={`${item._type}-${item.id}`} className="flex items-center gap-3">
						<div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${item._type === 'income' ? 'bg-[#e8f5db]' : item._type === 'transfer' ? 'bg-[#e0f4f8]' : 'bg-[#fdecea]'}`}>
							{item._type === 'income'
								? <ArrowDownLeft size={15} className="text-[#5a9c2a]" />
								: item._type === 'transfer'
									? <ArrowRightLeft size={15} className="text-[var(--primary)]" />
									: <ArrowUpRight size={15} className="text-[#e05252]" />}
						</div>
						<div className="flex-1 min-w-0">
							<p className="text-xs font-semibold truncate" style={{ color: 'var(--text)' }}>
								{item.description || (item._type === 'transfer' ? 'Transfer' : '—')}
							</p>
							<p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>{item.date}</p>
						</div>
						<span className={`text-xs font-bold whitespace-nowrap ${item._type === 'income' ? 'text-[#5a9c2a]' : item._type === 'transfer' ? 'text-[var(--primary)]' : 'text-[#e05252]'}`}>
							{item._type === 'income' ? '+' : item._type === 'transfer' ? '' : '-'}{safeAmount(item.amount).toFixed(2)} {currency}
						</span>
					</div>
				))}
			</div>
		)}
	</div>
)};

export default RecentActivity;