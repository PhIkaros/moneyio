import { AlertCircle, AlertTriangle, CheckCircle2 } from 'lucide-react';

const BudgetAlerts = ({ alerts, currency }) => {
	if (!alerts.length) return null;

	return (
		<div className="flex flex-col gap-2">
			{alerts.map(alert => {
				const isExceeded = alert.remaining < 0;
				const displayRemaining = isExceeded 
					? `−${Math.abs(alert.remaining).toLocaleString('en-US', { minimumFractionDigits: 2 })}` 
					: `${alert.remaining.toLocaleString('en-US', { minimumFractionDigits: 2 })}`;
					
				const bgColor = alert.status === 'danger' ? '#fff1f1' : alert.status === 'warning' ? '#fffbe6' : '#f0fdf4';
				const borderColor = alert.status === 'danger' ? '#fca5a5' : alert.status === 'warning' ? '#fde68a' : '#bbf7d0';
				const textColor = alert.status === 'danger' ? '#dc2626' : alert.status === 'warning' ? '#b45309' : '#166534';
				const barColor = alert.status === 'danger' ? '#ef4444' : alert.status === 'warning' ? '#f59e0b' : '#22c55e';
				const Icon = alert.status === 'danger' ? AlertCircle : alert.status === 'warning' ? AlertTriangle : CheckCircle2;

				return (
					<div
						key={alert.id}
						className="rounded-2xl px-4 py-3 flex flex-col gap-1.5"
						style={{ background: bgColor, border: `1px solid ${borderColor}` }}
					>
						<div className="flex items-center justify-between">
							<span className="text-sm font-semibold flex items-center gap-1.5" style={{ color: textColor }}>
								<Icon size={16} /> {alert.categoryName}
							</span>
							<span className="text-xs font-medium" style={{ color: textColor }}>
								{Math.round(alert.ratio * 100)}%
							</span>
						</div>

						{/* progress bar */}
						<div className="w-full h-1.5 rounded-full" style={{ background: '#e5e7eb' }}>
							<div
								className="h-1.5 rounded-full transition-all duration-500"
								style={{
									width: `${Math.min(alert.ratio * 100, 100)}%`,
									background: barColor,
								}}
							/>
						</div>

						<p className="text-xs" style={{ color: '#6b7280' }}>
							{isExceeded
								? `Limit exceeded by ${displayRemaining} ${currency} (Spent ${alert.spent.toLocaleString('en-US', { minimumFractionDigits: 2 })})`
								: `${displayRemaining} ${currency} remaining of ${alert.budgetAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })} ${currency}`
							}
						</p>
					</div>
				);
			})}
		</div>
	);
};

export default BudgetAlerts;