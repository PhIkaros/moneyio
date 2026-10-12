const FILTERS = ['All', 'Withdrawal', 'Savings', 'Deposit'];

const FilterPills = ({ active, onChange }) => (
	<div className="flex gap-2.5 flex-wrap">
		{FILTERS.map(f => (
			<button key={f} onClick={() => onChange(f)}
				className={`px-5 py-2 rounded-full text-sm font-medium transition-all cursor-pointer
          ${active === f
						? 'text-white shadow-lg border-none'
						: 'border text-[var(--text-soft)] bg-transparent hover:border-[var(--primary-light)] hover:text-[var(--primary-light)]'
					}`}
				style={active === f ? { background: 'var(--primary)', borderColor: 'transparent' } : { borderColor: 'var(--border)' }}>
				{f}
			</button>
		))}
	</div>
);

export default FilterPills;