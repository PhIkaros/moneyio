import { useState, useEffect } from 'react';
import {
	Plus, X, Check, Circle, CheckCircle2, Search,
	Trash2, Palette, Bookmark, LayoutDashboard,
} from 'lucide-react';
import api from '../api/axios';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';

// ── Constants ─────────────────────────────────────────────────────────────────
const COLORS = [
	{ hex: null, label: 'Default' },
	{ hex: '#6daf5f', label: 'Spring Herb' },
	{ hex: '#239dca', label: 'Sky Aqua' },
	{ hex: '#2a9d8f', label: 'Cool Jade' },
	{ hex: '#e8c14e', label: 'Warm Sand' },
	{ hex: '#e05252', label: 'Soft Red' },
];

// ── Color helpers ─────────────────────────────────────────────────────────────
const cardBg = (color) => color ? `${color}cc` : 'var(--card)';
const cardBorder = (color) => color ? `${color}99` : 'var(--border)';
const cardAccent = (color) => color || 'var(--primary)';

// Dark text on colored backgrounds, theme text on default background
const onCard = (color) => color ? '#000000' : 'var(--text)';
const onCardSoft = (color) => color ? '#1f2937' : 'var(--text-soft)';
const onCardMuted = (color) => color ? '#374151' : 'var(--text-muted)';

// Pin button colors
const pinActiveBg = (color) => color ? 'rgba(0,0,0,0.25)' : 'var(--primary)';
const pinInactiveBg = (color) => color ? 'rgba(255,255,255,0.2)' : 'transparent';
const pinActiveColor = () => '#ffffff';
const pinInactiveColor = (color) => color ? '#ffffff' : 'var(--text-muted)';

// ── Palette picker ────────────────────────────────────────────────────────────
const ColorPalette = ({ color, onChange }) => {
	const [open, setOpen] = useState(false);
	return (
		<div className="relative">
			<button
				onClick={() => setOpen(p => !p)}
				className="w-8 h-8 rounded-xl flex items-center justify-center border-none cursor-pointer transition-colors"
				style={{ background: open ? 'rgba(255,255,255,0.2)' : 'transparent' }}
				title="Change color">
				<Palette size={14} style={{ color: onCardSoft(color) }} />
			</button>
			{open && (
				<div className="absolute bottom-10 left-0 bg-white rounded-2xl shadow-xl border border-[#e8f0ee] p-2 flex gap-1.5 z-20">
					{COLORS.map(c => (
						<button key={c.label}
							onClick={() => { onChange(c.hex); setOpen(false); }}
							className="w-6 h-6 rounded-full border-2 cursor-pointer transition-transform hover:scale-110"
							style={{
								background: c.hex || '#f0f7f5',
								borderColor: color === c.hex ? '#1a3830' : 'transparent',
							}}
							title={c.label} />
					))}
				</div>
			)}
		</div>
	);
};

// ── Checklist editor (shared between CreateBar and NoteModal) ─────────────────
const ChecklistEditor = ({ items, onChange, color }) => {
	const [newItem, setNewItem] = useState('');

	const addItem = () => {
		if (!newItem.trim()) return;
		onChange([...items, { label: newItem.trim(), done: false, order: items.length }]);
		setNewItem('');
	};

	const toggleItem = (i) =>
		onChange(items.map((it, idx) => idx === i ? { ...it, done: !it.done } : it));

	const removeItem = (i) =>
		onChange(items.filter((_, idx) => idx !== i));

	return (
		<div className="flex flex-col gap-1.5">
			{items.map((item, i) => (
				<div key={i} className="flex items-center gap-2 group">
					<button onClick={() => toggleItem(i)}
						className="border-none bg-transparent cursor-pointer p-0 shrink-0">
						{item.done
							? <CheckCircle2 size={14} style={{ color: cardAccent(color) }} />
							: <Circle size={14} style={{ color: onCardMuted(color) }} />}
					</button>
					<span className="text-xs flex-1"
						style={{
							color: item.done ? onCardMuted(color) : onCardSoft(color),
							textDecoration: item.done ? 'line-through' : 'none',
						}}>
						{item.label}
					</span>
					<button onClick={() => removeItem(i)}
						className="opacity-0 group-hover:opacity-100 border-none bg-transparent cursor-pointer p-0 transition-opacity">
						<X size={12} style={{ color: onCardMuted(color) }} />
					</button>
				</div>
			))}

			{/* New item input */}
			<div className="flex items-center gap-2 mt-1">
				<Plus size={13} style={{ color: onCardMuted(color) }} className="shrink-0" />
				<input
					value={newItem}
					onChange={e => setNewItem(e.target.value)}
					onKeyDown={e => e.key === 'Enter' && addItem()}
					placeholder="List item…"
					className="flex-1 bg-transparent outline-none text-xs"
					style={{
						color: onCardSoft(color),
						caretColor: onCard(color),
					}}
				/>
				{newItem && (
					<button onClick={addItem} className="border-none bg-transparent cursor-pointer p-0">
						<Check size={13} style={{ color: cardAccent(color) }} />
					</button>
				)}
			</div>
		</div>
	);
};

// ── Create bar ────────────────────────────────────────────────────────────────
const CreateBar = ({ onCreated }) => {
	const [expanded, setExpanded] = useState(false);
	const [title, setTitle] = useState('');
	const [content, setContent] = useState('');
	const [items, setItems] = useState([]);
	const [color, setColor] = useState(null);
	const [saving, setSaving] = useState(false);

	const reset = () => {
		setExpanded(false); setTitle(''); setContent(''); setItems([]); setColor(null);
	};

	const handleSave = async () => {
		if (!title && !content && items.length === 0) { reset(); return; }
		setSaving(true);
		try {
			const res = await api.post('/notes', {
				title: title || null,
				content: content || null,
				items: items.length > 0 ? items : null,
				color,
				pinned: false,
				pinned_dashboard: false,
			});
			onCreated(res.data);
			reset();
		} catch (e) { console.error(e); }
		finally { setSaving(false); }
	};

	return (
		<div className="relative max-w-lg mx-auto mb-8">
			<div className="rounded-2xl shadow-md border transition-all duration-200"
				style={{ borderColor: cardBorder(color), background: cardBg(color) }}>

				{expanded && (
					<input
						value={title}
						onChange={e => setTitle(e.target.value)}
						placeholder="Title"
						className="w-full px-4 pt-4 pb-1 text-sm font-bold bg-transparent outline-none"
						style={{ color: onCard(color), caretColor: onCard(color) }}
					/>
				)}

				<div className="px-4 py-3 cursor-text" onClick={() => setExpanded(true)}>
					{!expanded ? (
						<div className="flex items-center justify-between">
							<span className="text-sm" style={{ color: onCardMuted(color) }}>Take a note…</span>
							<div className="flex gap-3">
								<button onClick={e => { e.stopPropagation(); setExpanded(true); }}
									className="p-1 rounded-lg border-none bg-transparent cursor-pointer">
									<CheckCircle2 size={18} style={{ color: onCardMuted(color) }} />
								</button>
								<button onClick={e => { e.stopPropagation(); setExpanded(true); }}
									className="p-1 rounded-lg border-none bg-transparent cursor-pointer">
									<Plus size={18} style={{ color: onCardMuted(color) }} />
								</button>
							</div>
						</div>
					) : (
						<textarea
							autoFocus
							value={content}
							onChange={e => setContent(e.target.value)}
							placeholder="Take a note…"
							rows={3}
							className="w-full bg-transparent outline-none text-sm resize-none"
							style={{ color: onCardSoft(color), caretColor: onCard(color) }}
						/>
					)}
				</div>

				{expanded && items.length > 0 && (
					<div className="px-4 pb-2">
						<ChecklistEditor items={items} onChange={setItems} color={color} />
					</div>
				)}

				{expanded && items.length === 0 && (
					<div className="px-4 pb-2">
						<ChecklistEditor items={[]} onChange={setItems} color={color} />
					</div>
				)}

				{expanded && (
					<div className="flex items-center justify-between px-4 py-3"
						style={{ borderTop: `1px solid ${onCardMuted(color)}33` }}>
						<ColorPalette color={color} onChange={setColor} />
						<div className="flex gap-2">
							<Button variant="secondary" size="sm" onClick={reset}>Cancel</Button>
							<Button size="sm" onClick={handleSave} loading={saving}
								style={{ background: cardAccent(color) }}>
								Save
							</Button>
						</div>
					</div>
				)}
			</div>
		</div>
	);
};

// ── Note modal ────────────────────────────────────────────────────────────────
const NoteModal = ({ note, onClose, onSave, onDelete }) => {
	const [title, setTitle] = useState(note.title || '');
	const [content, setContent] = useState(note.content || '');
	const [items, setItems] = useState(note.items || []);
	const [color, setColor] = useState(note.color);
	const [pinned, setPinned] = useState(!!note.pinned);
	const [pinnedDash, setPinnedDash] = useState(!!note.pinned_dashboard);
	const [saving, setSaving] = useState(false);
	const [confirmDelete, setConfirmDelete] = useState(false);

	const handleSave = async () => {
		setSaving(true);
		try {
			const res = await api.put(`/notes/${note.id}`, {
				title: title || null,
				content: content || null,
				items: items.length > 0 ? items : null,
				color,
				pinned,
				pinned_dashboard: pinnedDash,
			});
			onSave(res.data);
			onClose();
		} catch (e) { console.error(e); }
		finally { setSaving(false); }
	};

	const handlePinPage = async () => {
		const next = !pinned;
		const nextDash = next ? pinnedDash : false;
		setPinned(next);
		if (!next) setPinnedDash(false);
		onSave({ ...note, color, pinned: next, pinned_dashboard: nextDash });
		try {
			await api.put(`/notes/${note.id}`, { pinned: next, pinned_dashboard: nextDash });
		} catch (e) {
			setPinned(!next);
			setPinnedDash(pinnedDash);
			onSave({ ...note, pinned: !next, pinned_dashboard: pinnedDash });
		}
	};

	const handlePinDash = async () => {
		const next = !pinnedDash;
		setPinnedDash(next);
		onSave({ ...note, color, pinned, pinned_dashboard: next });
		try {
			await api.put(`/notes/${note.id}`, { pinned_dashboard: next });
		} catch (e) {
			setPinnedDash(!next);
			onSave({ ...note, pinned, pinned_dashboard: !next });
		}
	};

	const handleDelete = async () => {
		try {
			await api.delete(`/notes/${note.id}`);
			onDelete(note.id);
			onClose();
		} catch (e) { console.error(e); }
	};


	return (
		<>
			<div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40" onClick={handleSave} />
			<div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
				<div className="rounded-3xl shadow-2xl w-full max-w-md pointer-events-auto
					animate-[slideUp_0.22s_ease-out] flex flex-col max-h-[80vh]"
					style={{
						background: cardBg(color),
						border: `1px solid ${cardBorder(color)}`,
					}}>

					{/* Title */}
					<div className="px-6 pt-5">
						<input
							value={title}
							onChange={e => setTitle(e.target.value)}
							placeholder="Title"
							className="w-full text-base font-bold bg-transparent outline-none"
							style={{ color: onCard(color), caretColor: onCard(color) }}
						/>
					</div>

					{/* Body */}
					<div className="flex-1 overflow-y-auto px-6 py-3 flex flex-col gap-3">
						<textarea
							value={content}
							onChange={e => setContent(e.target.value)}
							placeholder="Add a note…"
							rows={4}
							className="w-full bg-transparent outline-none text-sm resize-none min-h-[60px]"
							style={{ color: onCardSoft(color), caretColor: onCard(color) }}
						/>

						<ChecklistEditor items={items} onChange={setItems} color={color} />
					</div>

					{/* Footer */}
					<div className="flex items-center justify-between px-5 py-3"
						style={{ borderTop: `1px solid ${onCardMuted(color)}44` }}>

						<div className="flex items-center gap-1 flex-wrap">

							{/* Pin to notes page */}
							<button
								onClick={handlePinPage}
								className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border-none cursor-pointer transition-all"
								style={{ background: pinned ? pinActiveBg(color) : pinInactiveBg(color) }}
								title={pinned ? 'Unpin from notes' : 'Pin to top'}>
								<Bookmark size={12}
									fill={pinned ? '#fff' : 'none'}
									style={{ color: pinned ? pinActiveColor() : pinInactiveColor(color) }} />
								<span className="text-[10px] font-semibold"
									style={{ color: pinned ? pinActiveColor() : pinInactiveColor(color) }}>
									{pinned ? 'Pinned' : 'Pin'}
								</span>
							</button>

							{/* Pin to dashboard — only after pinned to page */}
							{pinned && (
								<button
									onClick={handlePinDash}
									className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border-none cursor-pointer transition-all"
									style={{ background: pinnedDash ? 'rgba(0,0,0,0.35)' : pinInactiveBg(color) }}
									title={pinnedDash ? 'Remove from dashboard' : 'Show on dashboard'}>
									<LayoutDashboard size={12}
										style={{ color: pinnedDash ? '#8CC850' : pinInactiveColor(color) }} />
									<span className="text-[10px] font-semibold"
										style={{ color: pinnedDash ? '#8CC850' : pinInactiveColor(color) }}>
										{pinnedDash ? 'On Dashboard' : 'Dashboard'}
									</span>
								</button>
							)}

							{/* Divider */}
							<div className="w-px h-4 mx-0.5"
								style={{ background: onCardMuted(color) }} />

							{/* Palette */}
							<ColorPalette color={color} onChange={setColor} />


							{/* Delete */}
							{confirmDelete ? (
								<div className="flex items-center gap-1.5">
									<span className="text-[10px]" style={{ color: '#e05252' }}>Delete?</span>
									<button onClick={handleDelete}
										className="w-6 h-6 rounded-lg bg-[#fdecea] flex items-center justify-center border-none cursor-pointer">
										<Check size={11} className="text-[#e05252]" />
									</button>
									<button onClick={() => setConfirmDelete(false)}
										className="w-6 h-6 rounded-lg flex items-center justify-center border-none cursor-pointer"
										style={{ background: pinInactiveBg(color) }}>
										<X size={11} style={{ color: onCardSoft(color) }} />
									</button>
								</div>
							) : (
								<button onClick={() => setConfirmDelete(true)}
									className="w-8 h-8 rounded-xl flex items-center justify-center border-none bg-transparent cursor-pointer">
									<Trash2 size={14} style={{ color: onCardSoft(color) }} />
								</button>
							)}
						</div>

						{/* Done */}
						<Button
							size="sm"
							onClick={handleSave}
							loading={saving}
							className="ml-2 shrink-0"
							style={{ background: cardAccent(color) }}>
							Done
						</Button>
					</div>
				</div>
			</div>
			<style>{`@keyframes slideUp { from { opacity:0; transform:translateY(14px) scale(.98) } to { opacity:1; transform:translateY(0) scale(1) } }`}</style>
		</>
	);
};

// ── Note card ─────────────────────────────────────────────────────────────────
const NoteCard = ({ note, onClick, onPinToggle }) => {
	const isChecklist = note.items && note.items.length > 0;
	const done = isChecklist ? note.items.filter(i => i.done).length : 0;
	const total = isChecklist ? note.items.length : 0;
	const PREVIEW = 5;

	const handlePin = async (e) => {
		e.stopPropagation();
		const next = !note.pinned;
		onPinToggle(note.id, next);
		try {
			await api.put(`/notes/${note.id}`, {
				pinned: next,
				pinned_dashboard: next ? note.pinned_dashboard : false,
			});
		} catch (e) {
			console.error(e);
			onPinToggle(note.id, note.pinned);
		}
	};

	return (
		<div onClick={onClick}
			className="rounded-2xl p-4 cursor-pointer border transition-all duration-200
				hover:shadow-lg hover:-translate-y-0.5 relative break-inside-avoid mb-4 group"
			style={{ background: cardBg(note.color), borderColor: cardBorder(note.color) }}>

			{/* Pin button */}
			<button
				onClick={handlePin}
				className="absolute top-3 right-3 w-7 h-7 rounded-xl flex items-center justify-center
					border-none cursor-pointer transition-all duration-150 hover:scale-110"
				style={{
					background: note.pinned ? pinActiveBg(note.color) : pinInactiveBg(note.color),
					opacity: note.pinned ? 1 : 0,
				}}
				title={note.pinned ? 'Unpin' : 'Pin to notes'}>
				<Bookmark size={11}
					fill={note.pinned ? '#fff' : 'none'}
					style={{ color: note.pinned ? '#fff' : pinInactiveColor(note.color) }} />
			</button>

			{/* Hover-only pin when not pinned */}
			{!note.pinned && (
				<button
					onClick={handlePin}
					className="absolute top-3 right-3 w-7 h-7 rounded-xl flex items-center justify-center
						border-none cursor-pointer transition-all duration-150 hover:scale-110
						opacity-0 group-hover:opacity-100"
					style={{ background: pinInactiveBg(note.color) }}
					title="Pin to notes">
					<Bookmark size={11} fill="none"
						style={{ color: pinInactiveColor(note.color) }} />
				</button>
			)}

			{note.title && (
				<h3 className="text-sm font-bold mb-2 leading-snug pr-8"
					style={{ color: onCard(note.color) }}>
					{note.title}
				</h3>
			)}

			{note.content && (
				<p className="text-xs leading-relaxed whitespace-pre-line line-clamp-6"
					style={{ color: onCardSoft(note.color) }}>
					{note.content}
				</p>
			)}

			{isChecklist && (
				<div className="flex flex-col gap-1.5 mt-1">
					{note.items.slice(0, PREVIEW).map((item, i) => (
						<div key={i} className="flex items-center gap-2">
							{item.done
								? <CheckCircle2 size={12} style={{ color: cardAccent(note.color) }} className="shrink-0" />
								: <Circle size={12} style={{ color: onCardMuted(note.color) }} className="shrink-0" />}
							<span className="text-xs"
								style={{
									color: item.done ? onCardSoft(note.color) : onCardSoft(note.color),
									textDecoration: item.done ? 'line-through' : 'none',
									opacity: item.done ? 0.65 : 1,
								}}>
								{item.label}
							</span>
						</div>
					))}
					{total > PREVIEW && (
						<p className="text-[10px] mt-0.5" style={{ color: onCardMuted(note.color) }}>
							+{total - PREVIEW} more…
						</p>
					)}
				</div>
			)}

			{isChecklist && total > 0 && (
				<div className="mt-3 w-full h-1 rounded-full"
					style={{ background: `${onCard(note.color)}20` }}>
					<div className="h-1 rounded-full transition-all duration-300"
						style={{ width: `${(done / total) * 100}%`, background: cardAccent(note.color) }} />
				</div>
			)}

			{/* Dashboard badge */}
			{/* Dashboard badge — inline, not absolute */}
			{note.pinned_dashboard && (
				<div className="flex items-center gap-1 px-1.5 py-0.5 rounded-lg mt-2 w-fit"
					style={{ background: `${cardAccent(note.color)}25` }}>
					<LayoutDashboard size={9} style={{ color: onCardSoft(note.color) }} />
					<span className="text-[9px] font-semibold" style={{ color: onCardSoft(note.color) }}>
						Dashboard
					</span>
				</div>
			)}
		</div>
	);
};

// ── Notes page ────────────────────────────────────────────────────────────────
const Notes = () => {
	const [notes, setNotes] = useState([]);
	const [loading, setLoading] = useState(true);
	const [search, setSearch] = useState('');
	const [active, setActive] = useState(null);

	useEffect(() => {
		api.get('/notes')
			.then(res => setNotes(res.data))
			.catch(console.error)
			.finally(() => setLoading(false));
	}, []);

	const handleNoteCreated = (n) => setNotes(prev => [n, ...prev]);
	const handleNoteSaved = (n) => setNotes(prev => prev.map(x => x.id === n.id ? n : x));
	const handleNoteDeleted = (id) => { setNotes(prev => prev.filter(n => n.id !== id)); setActive(null); };
	const handlePinToggle = (id, pinned) =>
		setNotes(prev => prev.map(n =>
			n.id === id ? { ...n, pinned, pinned_dashboard: pinned ? n.pinned_dashboard : false } : n
		));

	const filtered = notes.filter(n => {
		if (!search) return true;
		const q = search.toLowerCase();
		return (
			n.title?.toLowerCase().includes(q) ||
			n.content?.toLowerCase().includes(q) ||
			n.items?.some(i => i.label.toLowerCase().includes(q))
		);
	});

	const pinned = filtered.filter(n => n.pinned);
	const unpinned = filtered.filter(n => !n.pinned);

	if (loading) return (
		<div className="flex items-center justify-center h-screen" >
			<div className="w-9 h-9 border-[3px] rounded-full animate-spin"
				style={{ borderColor: 'var(--border)', borderTopColor: 'var(--primary-light)' }} />
		</div>
	);

	return (
		<div className="flex-1 min-h-screen font-sans" >
			<main className="p-4 sm:p-6 md:p-8">

				{/* Header */}
				<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
					<h1 className="text-2xl sm:text-3xl font-bold tracking-tight" style={{ color: 'var(--text)' }}>Notes</h1>
					<div className="flex items-center gap-2 rounded-full px-4 py-2 shadow-sm w-full sm:w-60"
						style={{ background: 'var(--card)' }}>
						<Search size={14} style={{ color: 'var(--text-muted)' }} className="shrink-0" />
						<input
							value={search}
							onChange={e => setSearch(e.target.value)}
							placeholder="Search notes…"
							className="bg-transparent outline-none text-sm w-full"
							style={{ color: 'var(--text)' }}
						/>
					</div>
				</div>

				<CreateBar onCreated={handleNoteCreated} />

				{notes.length === 0 && (
					<p className="text-center text-sm mt-16" style={{ color: 'var(--text-muted)' }}>
						No notes yet. Take one above!
					</p>
				)}

				{/* Pinned section */}
				{pinned.length > 0 && (
					<div className="mb-6">
						<p className="text-[10px] font-bold uppercase tracking-widest mb-3"
							style={{ color: 'var(--text-muted)' }}>Pinned</p>
						<div className="columns-1 sm:columns-2 md:columns-3 lg:columns-4 gap-4">
							{pinned.map(note => (
								<NoteCard key={note.id} note={note}
									onClick={() => setActive(note)}
									onPinToggle={handlePinToggle} />
							))}
						</div>
					</div>
				)}

				{/* Others section */}
				{unpinned.length > 0 && (
					<div>
						{pinned.length > 0 && (
							<p className="text-[10px] font-bold uppercase tracking-widest mb-3"
								style={{ color: 'var(--text-muted)' }}>Others</p>
						)}
						<div className="columns-1 sm:columns-2 md:columns-3 lg:columns-4 gap-4">
							{unpinned.map(note => (
								<NoteCard key={note.id} note={note}
									onClick={() => setActive(note)}
									onPinToggle={handlePinToggle} />
							))}
						</div>
					</div>
				)}
			</main>

			{active && (
				<NoteModal
					note={notes.find(n => n.id === active.id) || active}
					onClose={() => setActive(null)}
					onSave={handleNoteSaved}
					onDelete={handleNoteDeleted}
				/>
			)}
		</div>
	);
};

export default Notes;