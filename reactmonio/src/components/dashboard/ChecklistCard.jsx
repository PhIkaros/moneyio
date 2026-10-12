import { useState } from 'react';
import { CheckCircle2, Circle } from 'lucide-react';
import api from '../../api/axios';

const ChecklistCard = ({ note }) => {
	const [items, setItems] = useState(note.items || []);
	const done = items.filter(i => i.done).length;
	const total = items.length;

	const bg = note.color ? `${note.color}cc` : 'var(--card)';
	const text = note.color ? '#000000' : 'var(--text)';
	const textSoft = note.color ? '#1f2937' : 'var(--text-soft)';
	const textMuted = note.color ? '#374151' : 'var(--text-muted)';

	const toggle = async (idx) => {
		const newItems = items.map((it, i) => i === idx ? { ...it, done: !it.done } : it);
		setItems(newItems);
		try {
			await api.put(`/notes/${note.id}`, { items: newItems });
		} catch (e) {
			console.error(e);
			setItems(items);
		}
	};

	return (
		<div className="rounded-[18px] p-4 shadow-sm" style={{ background: bg }}>
			<div className="flex items-center justify-between mb-2.5">
				<strong className="text-[13px] font-bold" style={{ color: text }}>
					{note.title || 'Note'}
				</strong>
				{total > 0 && (
					<span className="text-[10px] font-medium" style={{ color: textMuted }}>
						{done}/{total}
					</span>
				)}
			</div>

			{note.content && (
				<p className="text-[11px] leading-relaxed mb-2 line-clamp-3" style={{ color: textSoft }}>
					{note.content}
				</p>
			)}

			{total > 0 && (
				<>
					<div className="w-full h-1 rounded-full mb-3" style={{ background: 'var(--input-bg)' }}>
						<div className="h-1 rounded-full transition-all duration-300"
							style={{ width: `${(done / total) * 100}%`, background: 'var(--accent)' }} />
					</div>
					<div className="flex flex-col gap-1.5">
						{items.slice(0, 4).map((item, idx) => (
							<button key={idx} onClick={() => toggle(idx)}
								className="flex items-center gap-2 text-left w-full group cursor-pointer bg-transparent border-none p-0">
								{item.done
									? <CheckCircle2 size={13} style={{ color: note.color ? textMuted : 'var(--accent)' }} className="shrink-0" />
									: <Circle size={13} style={{ color: note.color ? textSoft : 'var(--border)' }} className="shrink-0 group-hover:opacity-75 transition-colors" />}
								<span className="text-[11px] transition-colors"
									style={{
										color: item.done ? textMuted : text,
										textDecoration: item.done ? 'line-through' : 'none'
									}}>
									{item.label}
								</span>
							</button>
						))}
						{total > 4 && (
							<span className="text-[10px] pl-0.5" style={{ color: textMuted }}>
								+{total - 4} more…
							</span>
						)}
					</div>
				</>
			)}
		</div>
	);
};

export default ChecklistCard;