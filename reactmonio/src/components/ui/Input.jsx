// components/ui/Input.jsx
// Usage:
// <Input placeholder="Title" value={title} onChange={e => setTitle(e.target.value)} />
// <Input prefix="$" type="number" value={amount} onChange={...} />
// <Input as="textarea" rows={3} value={content} onChange={...} />

const Input = ({
	as = 'input',   // 'input' | 'textarea'
	type = 'text',
	value,
	onChange,
	onKeyDown,
	placeholder = '',
	prefix,                  // e.g. "$" shown on left
	rows = 3,
	disabled = false,
	autoFocus = false,
	className = '',
	style = {},
}) => {
	const base = `w-full bg-transparent outline-none text-sm transition-all placeholder-[#c8ddd9]`;
	const boxed = `px-3 py-2.5 rounded-xl border`; // use when inside a field box

	const sharedProps = {
		value,
		onChange,
		onKeyDown,
		placeholder,
		disabled,
		autoFocus,
		className: `${base} ${className}`,
		style: {
			color: 'var(--text)',
			...style,
		},
	};

	if (prefix) {
		return (
			<div className="relative">
				<span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-bold"
					style={{ color: 'var(--text-muted)' }}>
					{prefix}
				</span>
				<input
					{...sharedProps}
					type={type}
					className={`${base} pl-7 pr-3 py-2.5 rounded-xl border ${className}`}
					style={{
						color: 'var(--text)',
						background: 'var(--input-bg)',
						borderColor: 'var(--border)',
						...style,
					}}
				/>
			</div>
		);
	}

	if (as === 'textarea') {
		return (
			<textarea
				{...sharedProps}
				rows={rows}
				className={`${base} resize-none ${className}`}
			/>
		);
	}

	return (
		<input
			{...sharedProps}
			type={type}
		/>
	);
};

export default Input;