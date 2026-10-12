// components/ui/Button.jsx
// Usage:
// <Button>Save</Button>
// <Button variant="ghost" size="sm">Cancel</Button>
// <Button variant="danger" loading={saving}>Delete</Button>
// <Button icon={<Plus size={13} />}>New</Button>

const Button = ({
	children,
	onClick,
	type = 'button',
	variant = 'primary',   // primary | secondary | ghost | danger | icon
	size = 'md',        // sm | md | lg | icon
	loading = false,
	disabled = false,
	icon = null,
	style = {},
	className = '',
	title,
}) => {
	const base = 'inline-flex items-center justify-center gap-1.5 font-semibold border-none cursor-pointer transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed';

	const sizes = {
		sm: 'px-3 py-1.5 text-[11px] rounded-lg',
		md: 'px-4 py-2 text-xs rounded-xl',
		lg: 'px-5 py-2.5 text-sm rounded-xl',
		icon: 'w-8 h-8 rounded-xl p-0 text-xs',
	};

	const variants = {
		primary: { background: 'var(--primary)', color: '#fff' },
		secondary: { background: 'var(--input-bg)', color: 'var(--text-soft)' },
		ghost: { background: 'transparent', color: 'var(--text-soft)' },
		danger: { background: '#fdecea', color: '#e05252' },
	};

	const variantStyle = variants[variant] || variants.primary;

	return (
		<button
			type={type}
			onClick={onClick}
			disabled={disabled || loading}
			title={title}
			className={`${base} ${sizes[size] || sizes.md} ${className}`}
			style={{ ...variantStyle, ...style }}
		>
			{loading ? (
				<span className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin" />
			) : (
				<>
					{icon && <span className="shrink-0">{icon}</span>}
					{children}
				</>
			)}
		</button>
	);
};

export default Button;