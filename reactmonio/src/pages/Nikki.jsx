// src/pages/Nikki.jsx
import { useState, useEffect, useRef, useCallback, forwardRef } from "react";
import axios from "../api/axios";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEditor, EditorContent, NodeViewWrapper, ReactNodeViewRenderer } from "@tiptap/react";
import 'prosemirror-view/style/prosemirror.css';
import { Node as TiptapNode, mergeAttributes } from "@tiptap/core";
import StarterKit from "@tiptap/starter-kit";
import TiptapImage from "@tiptap/extension-image";
import { TextStyle } from "@tiptap/extension-text-style";
import { Color } from "@tiptap/extension-color";
import Highlight from "@tiptap/extension-highlight";
import FontFamily from "@tiptap/extension-font-family";
import TextAlign from "@tiptap/extension-text-align";
import Underline from "@tiptap/extension-underline";
import {
	Bold, Italic, Strikethrough, Underline as UnderlineIcon, AlignLeft, AlignCenter, AlignRight,
	Highlighter, Image as ImageIcon, ChevronLeft, ChevronRight, Type,
	BookOpen, FileText, Flame, Pencil,
} from "lucide-react";
import HTMLFlipBook from "react-pageflip";
import { useTranslation } from "react-i18next";
import { useAuth } from "../context/AuthContext";

// ── THEMES ──
const THEMES = [
	{ key: "jade", bg: "#e8f5f1", card: "#ffffff", brand: "#03695e", text: "#1a3830", muted: "#5a8880", paper: "#fafffe" },
	{ key: "warm", bg: "#fdf6ec", card: "#fffdf7", brand: "#c8a96e", text: "#2d2013", muted: "#8a7260", paper: "#fffef9" },
	{ key: "midnight", bg: "#1a1c2e", card: "#23263a", brand: "#7c83d4", text: "#e8eaf6", muted: "#8b91b5", paper: "#1e2135" },
	{ key: "rose", bg: "#fdf0f5", card: "#ffffff", brand: "#c47da0", text: "#2d1020", muted: "#9a6880", paper: "#fffafc" },
	{ key: "ocean", bg: "#eef6fb", card: "#ffffff", brand: "#1a6b9a", text: "#0d1f2d", muted: "#4a7a96", paper: "#f5fbff" },
];

const FONT_SIZES = ['12px', '14px', '16px', '18px', '20px', '24px', '28px'];
const HIGHLIGHT_COLORS = ['#fef08a', '#bbf7d0', '#bfdbfe', '#fecaca', '#e9d5ff', '#fed7aa'];

// ── RESIZABLE IMAGE NODE ──
const ResizableImageView = ({ node, updateAttributes, selected }) => {
	const { src, width = 320, align = "left" } = node.attrs;
	const startX = useRef(0); const startW = useRef(0); const dragging = useRef(false);
	const startResize = useCallback((e) => {
		e.preventDefault(); e.stopPropagation(); dragging.current = true;
		startX.current = e.clientX; startW.current = typeof width === "number" ? width : 320;
		const onMove = (ev) => { if (!dragging.current) return; updateAttributes({ width: Math.max(60, Math.min(860, startW.current + ev.clientX - startX.current)) }); };
		const onUp = () => { dragging.current = false; window.removeEventListener("mousemove", onMove); window.removeEventListener("mouseup", onUp); };
		window.addEventListener("mousemove", onMove); window.addEventListener("mouseup", onUp);
	}, [width, updateAttributes]);
	const floatStyle = align === "center" ? { display: "block", margin: "10px auto", float: "none" } :
		align === "right" ? { float: "right", margin: "4px 0 8px 14px" } : { float: "left", margin: "4px 14px 8px 0" };
	return (
		<NodeViewWrapper style={{ display: "inline", lineHeight: 0 }}>
			<span contentEditable={false} style={{ display: "inline-block", position: "relative", userSelect: "none", ...floatStyle }}>
				<img src={src} alt="" draggable={false} style={{ width, display: "block", borderRadius: 8, outline: selected ? "2px solid var(--nikki-brand,#03695e)" : "none" }} />
				{selected && <>
					<span onMouseDown={startResize} style={{ position: "absolute", bottom: 4, right: 4, width: 16, height: 16, borderRadius: 3, background: "rgba(0,0,0,0.5)", cursor: "se-resize", display: "flex", alignItems: "center", justifyContent: "center" }}>
						<svg width="8" height="8" viewBox="0 0 8 8" fill="none"><path d="M1 7L7 1M4 7L7 4" stroke="white" strokeWidth="1.5" strokeLinecap="round" /></svg>
					</span>
					<span style={{ position: "absolute", top: -30, left: 0, display: "flex", gap: 3, background: "rgba(0,0,0,0.65)", borderRadius: 6, padding: "3px 6px" }}>
						{["left", "center", "right"].map(a => (
							<button key={a} onMouseDown={e => { e.preventDefault(); e.stopPropagation(); updateAttributes({ align: a }); }}
								style={{ background: align === a ? "white" : "transparent", border: "none", color: align === a ? "#000" : "#ccc", borderRadius: 3, padding: "1px 6px", fontSize: 10, cursor: "pointer", fontWeight: 600 }}>{a[0].toUpperCase()}</button>
						))}
					</span>
				</>}
			</span>
		</NodeViewWrapper>
	);
};

const ResizableImage = TiptapImage.extend({
	addAttributes() {
		return {
			...this.parent?.(),
			width: { default: 320, parseHTML: el => parseInt(el.getAttribute("width")) || 320, renderHTML: a => ({ width: a.width }) },
			align: { default: "left", parseHTML: el => el.getAttribute("data-align") || "left", renderHTML: a => ({ "data-align": a.align }) },
		};
	},
	addNodeView() { return ReactNodeViewRenderer(ResizableImageView); },
});

// ── TRANSACTION CHIP NODE ──
// Transaction chip node view (React) so it renders as a styled, non-editable inline node
const TransactionChipView = ({ node }) => {
	const isIncome = node.attrs.kind === 'income';
	const label = node.attrs.label || '';
	return (
		<NodeViewWrapper as="span" style={{ display: 'inline-block' }}>
			<span contentEditable={false} className={`nikki-txn-chip${isIncome ? ' income' : ''}`} data-txn-id={node.attrs.txnId}>
				{isIncome ? '↑' : '↓'} {label}
			</span>
		</NodeViewWrapper>
	);
};

const TransactionChip = TiptapNode.create({
	name: 'transactionChip',
	group: 'inline',
	inline: true,
	atom: true,
	selectable: false,

	addAttributes() {
		return {
			txnId: { default: null, parseHTML: el => el.getAttribute('data-txn-id') },
			label: { default: '', parseHTML: el => el.textContent?.replace(/^[↑↓]\s*/, '') || '' },
			kind: { default: 'outcome', parseHTML: el => el.classList.contains('income') ? 'income' : 'outcome' },
		};
	},

	parseHTML() {
		return [{ tag: 'span[data-txn-id]' }];
	},

	renderHTML({ node }) {
		const isIncome = node.attrs.kind === 'income';
		return ['span', mergeAttributes({ 'data-txn-id': node.attrs.txnId, 'class': `nikki-txn-chip${isIncome ? ' income' : ''}`, 'contenteditable': 'false' }), `${isIncome ? '↑' : '↓'} ${node.attrs.label}`];
	},

	addNodeView() { return ReactNodeViewRenderer(TransactionChipView); },
});

// ── MINI CALENDAR ──
function MiniCalendar({ activeDate, entryDates, onSelect, T }) {
	const [view, setView] = useState(() => { const d = new Date(activeDate + "T12:00:00"); return { year: d.getFullYear(), month: d.getMonth() }; });
	const { year, month } = view;
	const firstDay = new Date(year, month, 1).getDay();
	const daysInMonth = new Date(year, month + 1, 0).getDate();
	const cells = []; for (let i = 0; i < firstDay; i++) cells.push(null); for (let d = 1; d <= daysInMonth; d++) cells.push(d);
	const monthName = new Date(year, month).toLocaleString("en", { month: "long" });
	const btnStyle = { background: "none", border: "none", cursor: "pointer", color: T.muted, padding: "2px 4px", display: "flex", alignItems: "center", borderRadius: 4 };
	return (
		<div>
			{/* Year row */}
			<div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 4 }}>
				<button onClick={() => setView(v => ({ ...v, year: v.year - 1 }))} style={btnStyle} title="Previous year">
					<ChevronLeft size={11} /><ChevronLeft size={11} style={{ marginLeft: -6 }} />
				</button>
				<span style={{ fontSize: 13, fontWeight: 700, color: T.brand, letterSpacing: '0.02em' }}>{year}</span>
				<button onClick={() => setView(v => ({ ...v, year: v.year + 1 }))} style={btnStyle} title="Next year">
					<ChevronRight size={11} /><ChevronRight size={11} style={{ marginLeft: -6 }} />
				</button>
			</div>
			{/* Month row */}
			<div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
				<button onClick={() => setView(v => { const d = new Date(v.year, v.month - 1); return { year: d.getFullYear(), month: d.getMonth() }; })}
					style={btnStyle}><ChevronLeft size={13} /></button>
				<span style={{ fontSize: 12, fontWeight: 600, color: T.text }}>{monthName}</span>
				<button onClick={() => setView(v => { const d = new Date(v.year, v.month + 1); return { year: d.getFullYear(), month: d.getMonth() }; })}
					style={btnStyle}><ChevronRight size={13} /></button>
			</div>
			<div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)", gap: 2, textAlign: "center" }}>
				{["S", "M", "T", "W", "T", "F", "S"].map((d, i) => (<div key={i} style={{ fontSize: 9, color: T.muted, paddingBottom: 4, fontWeight: 700 }}>{d}</div>))}
				{cells.map((d, i) => {
					if (!d) return <div key={i} />;
					const ds = `${year}-${String(month + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
					const isActive = ds === activeDate, hasEntry = entryDates.has(ds), isToday = ds === todayStr();
					return (
						<div key={i} onClick={() => onSelect(ds)} style={{
							fontSize: 11, padding: "4px 2px", cursor: "pointer", borderRadius: 5, position: "relative", userSelect: "none",
							background: isActive ? T.brand : isToday ? `${T.brand}20` : "transparent",
							color: isActive ? "white" : T.text, fontWeight: isToday ? 700 : 400,
						}}>
							{d}
							{hasEntry && !isActive && <span style={{ position: "absolute", bottom: 1, left: "50%", transform: "translateX(-50%)", width: 3, height: 3, borderRadius: "50%", background: T.brand, display: "block" }} />}
						</div>
					);
				})}
			</div>
		</div>
	);
}

// ── TOOLBAR ──
function Toolbar({ editor, T, onImageUpload }) {
	const [showHighlights, setShowHighlights] = useState(false);
	const [showFontSize, setShowFontSize] = useState(false);
	if (!editor) return null;
	const btn = (active, action, icon, title) => (
		<button key={title} onMouseDown={e => { e.preventDefault(); action(); }} title={title}
			style={{ background: active ? `${T.brand}22` : "none", border: "none", borderRadius: 5, padding: "4px 5px", cursor: "pointer", color: active ? T.brand : T.muted, display: "flex", alignItems: "center" }}>{icon}</button>
	);
	const sep = <div style={{ width: 1, height: 15, background: `${T.brand}20`, margin: "0 3px", flexShrink: 0 }} />;
	return (
		<div style={{ display: "flex", flexWrap: "wrap", gap: 1, padding: "5px 10px", borderBottom: `1px solid ${T.brand}15`, alignItems: "center", background: T.card, flexShrink: 0 }}>
			{btn(editor.isActive("bold"), () => editor.chain().focus().toggleBold().run(), <Bold size={13} />, "Bold")}
			{btn(editor.isActive("italic"), () => editor.chain().focus().toggleItalic().run(), <Italic size={13} />, "Italic")}
			{btn(editor.isActive("underline"), () => editor.chain().focus().toggleUnderline().run(), <UnderlineIcon size={13} />, "Underline")}
			{btn(editor.isActive("strike"), () => editor.chain().focus().toggleStrike().run(), <Strikethrough size={13} />, "Strike")}
			{sep}
			{/* Highlight with colors */}
			<div style={{ position: "relative" }}>
				<button onMouseDown={e => { e.preventDefault(); setShowHighlights(!showHighlights); }}
					style={{ background: editor.isActive("highlight") ? `${T.brand}22` : "none", border: "none", borderRadius: 5, padding: "4px 5px", cursor: "pointer", color: editor.isActive("highlight") ? T.brand : T.muted, display: "flex", alignItems: "center" }}>
					<Highlighter size={13} />
				</button>
				{showHighlights && (
					<div style={{ position: "absolute", top: "100%", left: 0, zIndex: 100, background: T.card, border: `1px solid ${T.brand}30`, borderRadius: 8, padding: 6, display: "flex", gap: 4, boxShadow: "0 4px 12px rgba(0,0,0,0.15)" }}>
						{HIGHLIGHT_COLORS.map(c => (
							<button key={c} onMouseDown={e => { e.preventDefault(); editor.chain().focus().toggleHighlight({ color: c }).run(); setShowHighlights(false); }}
								style={{ width: 20, height: 20, borderRadius: 4, background: c, border: "1px solid rgba(0,0,0,0.1)", cursor: "pointer" }} />
						))}
						<button onMouseDown={e => { e.preventDefault(); editor.chain().focus().unsetHighlight().run(); setShowHighlights(false); }}
							style={{ width: 20, height: 20, borderRadius: 4, background: "#fff", border: "1px solid rgba(0,0,0,0.15)", cursor: "pointer", fontSize: 10, display: "flex", alignItems: "center", justifyContent: "center", color: "#999" }}>✕</button>
					</div>
				)}
			</div>
			{sep}
			{btn(editor.isActive({ textAlign: "left" }), () => editor.chain().focus().setTextAlign("left").run(), <AlignLeft size={13} />, "Left")}
			{btn(editor.isActive({ textAlign: "center" }), () => editor.chain().focus().setTextAlign("center").run(), <AlignCenter size={13} />, "Center")}
			{btn(editor.isActive({ textAlign: "right" }), () => editor.chain().focus().setTextAlign("right").run(), <AlignRight size={13} />, "Right")}
			{sep}
			<select onMouseDown={e => e.stopPropagation()} onChange={e => editor.chain().focus().setFontFamily(e.target.value).run()}
				style={{ fontSize: 11, border: `1px solid ${T.brand}25`, borderRadius: 5, padding: "2px 4px", color: T.text, background: T.card, cursor: "pointer" }}>
				<option value="Georgia, serif">Georgia</option>
				<option value="system-ui, sans-serif">Sans</option>
				<option value="'Courier New', monospace">Mono</option>
				<option value="cursive">Cursive</option>
			</select>
			{/* Font size */}
			<div style={{ position: "relative" }}>
				<button onMouseDown={e => { e.preventDefault(); setShowFontSize(!showFontSize); }}
					style={{ background: "none", border: `1px solid ${T.brand}25`, borderRadius: 5, padding: "2px 6px", cursor: "pointer", color: T.muted, display: "flex", alignItems: "center", gap: 2, fontSize: 11 }}>
					<Type size={11} /> Size
				</button>
				{showFontSize && (
					<div style={{ position: "absolute", top: "100%", left: 0, zIndex: 100, background: T.card, border: `1px solid ${T.brand}30`, borderRadius: 8, padding: 4, display: "flex", flexDirection: "column", gap: 2, boxShadow: "0 4px 12px rgba(0,0,0,0.15)", minWidth: 60 }}>
						{FONT_SIZES.map(size => (
							<button key={size} onMouseDown={e => {
								e.preventDefault();
								editor.chain().focus().setMark('textStyle', { fontSize: size }).run();
								setShowFontSize(false);
							}}
								style={{ background: "none", border: "none", padding: "3px 8px", cursor: "pointer", fontSize: 11, color: T.text, textAlign: "left", borderRadius: 4 }}
								onMouseEnter={e => e.currentTarget.style.background = T.bg}
								onMouseLeave={e => e.currentTarget.style.background = "transparent"}
							>{size}</button>
						))}
					</div>
				)}
			</div>
			{sep}
			<label style={{ display: "flex", alignItems: "center", gap: 3, cursor: "pointer" }}>
				<span style={{ fontSize: 12, color: T.muted, fontWeight: 700 }}>A</span>
				<input type="color" defaultValue="#1a3830" onMouseDown={e => e.stopPropagation()}
					onChange={e => editor.chain().focus().setColor(e.target.value).run()}
					style={{ width: 16, height: 16, border: "none", padding: 0, cursor: "pointer", borderRadius: 3 }} />
			</label>
			{sep}
			<button onMouseDown={e => { e.preventDefault(); onImageUpload(); }}
				style={{ background: "none", border: "none", cursor: "pointer", color: T.muted, display: "flex", padding: "4px 5px" }}><ImageIcon size={13} /></button>
		</div>
	);
}

// ── MENTION DROPDOWN ──
function MentionDropdown({ open, txns, onPick, T, currency, style: extra }) {
	if (!open) return null;
	return (
		<div style={{ position: "absolute", background: T.card, border: `1px solid ${T.brand}30`, borderRadius: 10, padding: "5px 0", width: 255, zIndex: 200, boxShadow: "0 8px 24px rgba(0,0,0,0.13)", ...extra }}>
			<p style={{ fontSize: 9, color: T.muted, padding: "0 11px 4px", textTransform: "uppercase", letterSpacing: "0.07em", fontWeight: 700 }}>Link transaction</p>
			{txns.length === 0
				? <p style={{ fontSize: 12, color: T.muted, padding: "7px 11px" }}>No matches</p>
				: txns.map(t => (
					<div key={`${t.kind}-${t.id}`} onMouseDown={e => { e.preventDefault(); onPick(t); }}
						style={{ padding: "6px 11px", display: "flex", alignItems: "center", gap: 8, cursor: "pointer" }}
						onMouseEnter={e => e.currentTarget.style.background = T.bg}
						onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
						<div style={{ width: 24, height: 24, borderRadius: 6, flexShrink: 0, background: t.kind === "income" ? "#edf7e6" : "#e0f4f8", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700, color: t.kind === "income" ? "#2d6b1a" : "#1a5f7a" }}>
							{t.kind === "income" ? "+" : "−"}
						</div>
						<div style={{ minWidth: 0 }}>
							<p style={{ fontSize: 12, fontWeight: 600, color: T.text, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
								{t.sous_categ?.name || t.description || "Transaction"}
							</p>
							<p style={{ fontSize: 10, color: T.muted }}>{t.kind === "income" ? "+" : "−"}{t.amount} {currency} · {t.date?.slice(0, 10)}</p>
						</div>
					</div>
				))}
		</div>
	);
}

// ── TXN SUMMARY ──
function TxnSummary({ txns, income, expense, T, currency }) {
	if (!txns.length && !income && !expense) return null;
	const net = income - expense;
	return (
		<div style={{ marginTop: 14 }}>
			{(income > 0 || expense > 0) && (
				<div style={{ background: T.bg, borderRadius: 9, padding: "9px 11px", marginBottom: 10 }}>
					<div style={{ display: "flex", justifyContent: "space-between", marginBottom: 3 }}>
						<span style={{ fontSize: 11, color: T.muted }}>Income</span>
						<span style={{ fontSize: 11, fontWeight: 700, color: "#6daf5f" }}>+{income.toFixed(0)}</span>
					</div>
					<div style={{ display: "flex", justifyContent: "space-between", marginBottom: 3 }}>
						<span style={{ fontSize: 11, color: T.muted }}>Expenses</span>
						<span style={{ fontSize: 11, fontWeight: 700, color: "#239dca" }}>−{expense.toFixed(0)}</span>
					</div>
					<div style={{ height: 1, background: `${T.brand}15`, margin: "5px 0" }} />
					<div style={{ display: "flex", justifyContent: "space-between" }}>
						<span style={{ fontSize: 11, fontWeight: 700, color: T.text }}>Net</span>
						<span style={{ fontSize: 12, fontWeight: 700, color: T.brand }}>{net >= 0 ? "+" : ""}{net.toFixed(0)} {currency}</span>
					</div>
				</div>
			)}
			{txns.length > 0 && <>
				<p style={{ fontSize: 9, color: T.muted, textTransform: "uppercase", letterSpacing: "0.07em", fontWeight: 700, marginBottom: 6 }}>Transactions</p>
				{txns.slice(0, 8).map((t, i) => (
					<div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "4px 0", borderBottom: `1px solid ${T.brand}10` }}>
						<span style={{ fontSize: 11, color: T.text, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: 140 }}>
							{t.sous_categ?.name || t.description || "—"}
						</span>
						<span style={{ fontSize: 11, fontWeight: 700, color: t.kind === "income" ? "#6daf5f" : "#239dca", flexShrink: 0, marginLeft: 6 }}>
							{t.kind === "income" ? "+" : "−"}{t.amount}
						</span>
					</div>
				))}
			</>}
		</div>
	);
}

// ── PAGE (for react-pageflip) ──
const Page = forwardRef(({ children, style }, ref) => (
	<div ref={ref} style={{ background: 'transparent', ...style }}>{children}</div>
));

// ── BOOK VIEWER (no calendar page) ──
function BookViewer({ entries, activeDate, onSelectDate, onEdit, T, entryDates }) {
	const book = useRef(null);
	const [showCal, setShowCal] = useState(false);
	const allDates = entries.map(e => e.date).sort();

	function handleFlip(e) {
		const date = allDates[e.data - 1]; // offset for cover only (no calendar page)
		if (date) setTimeout(() => onSelectDate(date), 0); // defer to avoid flushSync warning from react-pageflip
	}

	function jumpToDate(date) {
		const idx = allDates.indexOf(date);
		setShowCal(false);
		if (idx !== -1) {
			// Defer flip to avoid flushSync-inside-render error from react-pageflip
			setTimeout(() => book.current?.pageFlip().flip(idx + 1), 50);
			// handleFlip will call onSelectDate once the animation settles
		} else {
			// No entry exists for this date — just update the selected date
			onSelectDate(date);
		}
	}

	return (
		<div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flex: 1, padding: '24px 16px', gap: 16 }}>
			<HTMLFlipBook key={`book-${allDates.length}`} ref={book} width={420} height={560} size="fixed" showCover={true}
				drawShadow={true} maxShadowOpacity={0.4} onFlip={handleFlip}
				style={{ boxShadow: '0 32px 80px rgba(0,0,0,0.22)' }}>
				{/* FRONT COVER */}
				<Page>
					<div style={{ background: T.brand, height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
						<p style={{ fontSize: 36, fontWeight: 700, color: 'white', fontFamily: 'Georgia,serif', marginBottom: 8 }}>nikki</p>
						<p style={{ fontSize: 13, color: 'rgba(255,255,255,0.55)' }}>your financial diary</p>
					</div>
				</Page>

				{/* ENTRY PAGES — no calendar page */}
				{allDates.map((date) => {
					const entry = entries.find(e => e.date === date);
					return (
						<Page key={date}>
							<div style={{ background: T.paper, height: '100%', padding: '24px 26px', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
								<div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
									<span style={{ fontSize: 13, fontWeight: 700, color: T.brand }}>{formatDisplay(date)}</span>
									<button onClick={() => onEdit(date)}
										style={{ display: 'flex', alignItems: 'center', gap: 5, background: `${T.brand}15`, border: 'none', borderRadius: 7, padding: '5px 11px', fontSize: 11, fontWeight: 600, color: T.brand, cursor: 'pointer' }}>
										<Pencil size={11} /> Edit
									</button>
								</div>
								<p style={{ fontSize: 20, fontWeight: 700, color: T.text, fontFamily: 'Georgia,serif', marginBottom: 14 }}>
									{entry?.title || 'Untitled'}
								</p>
								<div style={{ flex: 1, overflow: 'hidden', fontSize: 14, lineHeight: 1.9, color: T.text, fontFamily: 'Georgia,serif' }}
									dangerouslySetInnerHTML={{ __html: entry?.content || '<p style="color:#aaa;font-style:italic">No entry for this day</p>' }} />
								<span style={{ fontSize: 10, color: T.muted, fontStyle: 'italic', marginTop: 'auto' }}>{date}</span>
							</div>
						</Page>
					);
				})}

				{/* BACK COVER */}
				<Page><div style={{ background: T.brand, height: '100%' }} /></Page>
			</HTMLFlipBook>

			<div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
				<button onClick={() => book.current?.pageFlip().flipPrev()}
					style={{ background: T.card, border: `1px solid ${T.brand}30`, borderRadius: 8, padding: '6px 14px', fontSize: 12, color: T.muted, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}>
					<ChevronLeft size={13} /> Prev
				</button>

				{/* Calendar jump button */}
				<div style={{ position: 'relative' }}>
					<button onClick={() => setShowCal(c => !c)}
						style={{ background: T.card, border: `1px solid ${T.brand}50`, borderRadius: 8, padding: '6px 14px', fontSize: 12, color: T.brand, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 5, fontWeight: 600 }}>
						Go to date
					</button>
					{showCal && (
						<div style={{ position: 'absolute', bottom: '110%', left: '50%', transform: 'translateX(-50%)', zIndex: 50, background: T.card, border: `1px solid ${T.brand}30`, borderRadius: 14, padding: 14, boxShadow: '0 8px 32px rgba(0,0,0,0.18)', minWidth: 220 }}>
							<MiniCalendar activeDate={activeDate} entryDates={entryDates} onSelect={jumpToDate} T={T} />
							<button onClick={() => setShowCal(false)} style={{ marginTop: 10, width: '100%', background: 'none', border: `1px solid ${T.brand}25`, borderRadius: 8, padding: '4px 0', fontSize: 11, color: T.muted, cursor: 'pointer' }}>Close</button>
						</div>
					)}
				</div>

				<button onClick={() => book.current?.pageFlip().flipNext()}
					style={{ background: T.card, border: `1px solid ${T.brand}30`, borderRadius: 8, padding: '6px 14px', fontSize: 12, color: T.muted, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}>
					Next <ChevronRight size={13} />
				</button>
			</div>
		</div>
	);
}

// ── FontSize extension ──
const FontSize = TextStyle.extend({
	addAttributes() {
		return {
			...this.parent?.(),
			fontSize: {
				default: null,
				parseHTML: el => el.style.fontSize || null,
				renderHTML: attrs => { if (!attrs.fontSize) return {}; return { style: `font-size: ${attrs.fontSize}` }; },
			},
		};
	},
});

// ══════════════════════════════════════════════════════════════
// MAIN
// ══════════════════════════════════════════════════════════════
export default function Nikki() {
	const { t } = useTranslation();
	const qc = useQueryClient();
	const [theme, setTheme] = useState(THEMES[0]);
	const [viewMode, setViewMode] = useState("book");
	const [activeDate, setActiveDate] = useState(todayStr());
	const [title, setTitle] = useState("");
	const [linkedTxns, setLinkedTxns] = useState([]);
	const [saving, setSaving] = useState(false);
	const [mention, setMention] = useState({ open: false, query: "", from: 0 });
	const imgInputRef = useRef(null);
	const { user } = useAuth();
	const currency = user?.currency || 'MAD';
	const T = theme;

	const { data: entries = [] } = useQuery({ queryKey: ["nikki-entries"], queryFn: () => axios.get("/nikki-entries").then(r => r.data), staleTime: 1000 * 60 * 2 });
	const { data: incomes = [] } = useQuery({ queryKey: ["incomes"], queryFn: () => axios.get("/incomes").then(r => r.data), staleTime: 0 });
	const { data: outcomes = [] } = useQuery({ queryKey: ["outcomes"], queryFn: () => axios.get("/outcomes").then(r => r.data), staleTime: 0 });
	const { data: transferts = [] } = useQuery({ queryKey: ["transferts"], queryFn: () => axios.get("/transferts").then(r => r.data), staleTime: 0 });

	const allTxns = [...incomes.map(t => ({ ...t, kind: "income" })), ...outcomes.map(t => ({ ...t, kind: "outcome" })), ...transferts.map(t => ({ ...t, kind: "transfer" }))]
		.sort((a, b) => new Date(b.date) - new Date(a.date));

	const streak = (() => { const dates = new Set(entries.map(e => e.date)); let count = 0; const d = new Date(); while (dates.has(d.toISOString().slice(0, 10))) { count++; d.setDate(d.getDate() - 1); } return count; })();

	const activeEntry = entries.find(e => e.date === activeDate);
	const todayTxns = allTxns.filter(t => t.date?.slice(0, 10) === activeDate);
	const todayIncome = todayTxns.filter(t => t.kind === "income").reduce((s, t) => s + (+t.amount), 0);
	const todayExpense = todayTxns.filter(t => t.kind === "outcome").reduce((s, t) => s + (+t.amount), 0);
	const filteredTxns = allTxns.filter(t => `${t.sous_categ?.name || ""} ${t.description || ""} ${t.amount}`.toLowerCase().includes(mention.query)).slice(0, 6);

	useEffect(() => {
		const s = document.createElement("style"); s.id = "nikki-css";
		s.innerHTML = `
      :root { --nikki-brand: ${T.brand}; }
      .ProseMirror { outline:none;min-height:160px;direction:ltr;font-family:Georgia,serif;font-size:15px;line-height:1.9;color:${T.text};padding:0;white-space:pre-wrap;word-wrap:break-word; }
      .ProseMirror p { margin:0 0 6px; }
      .ProseMirror p.is-editor-empty:first-child::before { content:"${t('journal.writeAbout')}"; color:${T.muted};opacity:0.55;pointer-events:none;float:left;height:0;font-style:italic; }
      .ProseMirror:focus { outline:none; }
      .nikki-txn-chip { display:inline-flex;align-items:center;gap:4px;background:#e0f4f8;border:1px solid #239dca55;border-radius:6px;padding:1px 8px;font-size:12px;color:#1a5f7a;font-family:system-ui,sans-serif;vertical-align:middle;white-space:nowrap;line-height:1.7;cursor:default; }
      .nikki-txn-chip.income { background:#edf7e6;border-color:#6daf5f55;color:#2d6b1a; }
    `;
		document.getElementById("nikki-css")?.remove(); document.head.appendChild(s);
		return () => document.getElementById("nikki-css")?.remove();
	}, [T, t]);

	const editor = useEditor({
		extensions: [
			StarterKit, FontSize, Color,
			Highlight.configure({ multicolor: true }),
			FontFamily,
			TextAlign.configure({ types: ["heading", "paragraph"] }),
			ResizableImage.configure({ allowBase64: true }),
			TransactionChip,
		],
		content: "",
		onUpdate: ({ editor }) => {
			const { state } = editor; const { from } = state.selection;
			const before = state.doc.textBetween(Math.max(0, from - 50), from, "\n");
			const atIdx = before.lastIndexOf("@");
			if (atIdx !== -1) {
				const frag = before.slice(atIdx + 1);
				if (!frag.includes(" ") && !frag.includes("\n")) {
					setTimeout(() => setMention({ open: true, query: frag.toLowerCase(), from: from - frag.length - 1 }), 0);
					return;
				}
			}
			setTimeout(() => setMention(m => m.open ? { ...m, open: false } : m), 0);
		},
	});

	useEffect(() => {
		if (!editor) return;
		setTitle(activeEntry?.title || ""); editor.commands.setContent(activeEntry?.content || "");
		setLinkedTxns(activeEntry?.transactions || []); setMention({ open: false, query: "", from: 0 });
	}, [activeDate, activeEntry, editor]);

	function txnLabel(t) { return `${t.sous_categ?.name || t.description || "Transaction"} · ${t.kind === "income" ? "+" : "−"}${Number(t.amount).toFixed(2)} ${currency}`; }
	function pickTxn(txn) {
		if (!editor) return;
		const { from } = editor.state.selection;
		editor.chain().focus()
			.deleteRange({ from: from - mention.query.length - 1, to: from })
			.insertContent({
				type: 'transactionChip',
				attrs: { txnId: String(txn.id), label: txnLabel(txn), kind: txn.kind },
			})
			.insertContent(' ')
			.run();
		setLinkedTxns(p => [...p, { id: txn.id, type: txn.kind }]); setMention({ open: false, query: "", from: 0 });
	}

	function handleImages(files) { Array.from(files).forEach(file => { const r = new FileReader(); r.onload = e => editor?.chain().focus().setImage({ src: e.target.result }).run(); r.readAsDataURL(file); }); }

	async function save() {
		setSaving(true);
		try {
			const payload = { title: title || "Untitled", content: editor?.getHTML() || "", date: activeDate };
			if (activeEntry) await axios.put(`/nikki-entries/${activeEntry.id}`, payload);
			else await axios.post("/nikki-entries", payload);
			await qc.invalidateQueries({ queryKey: ["nikki-entries"] });
		} finally { setSaving(false); }
	}

	function goEdit(date) { setActiveDate(date); setViewMode("page"); }

	const prevDay = offsetDate(activeDate, -1); const nextDay = offsetDate(activeDate, 1);
	const canNext = nextDay <= todayStr();
	const wordCount = editor?.getText().split(/\s+/).filter(Boolean).length ?? 0;
	const entryDates = new Set(entries.map(e => e.date));

	const ThemeDots = () => (
		<div style={{ display: "flex", gap: 6 }}>
			{THEMES.map(t => (
				<div key={t.key} onClick={() => setTheme(t)}
					style={{ width: 14, height: 14, borderRadius: "50%", background: t.brand, cursor: "pointer", outline: theme.key === t.key ? `2px solid ${T.text}` : "none", outlineOffset: 2 }} />
			))}
		</div>
	);

	const editorPanel = (
		<div style={{ flex: 1, display: "flex", flexDirection: "column", minHeight: 0, overflow: "hidden", position: "relative" }}>
			<Toolbar editor={editor} T={T} onImageUpload={() => imgInputRef.current?.click()} />
			<div style={{ flex: 1, overflowY: "auto", padding: "14px 18px", cursor: "text", position: "relative" }} onClick={() => editor?.chain().focus().run()}>
				<EditorContent editor={editor} />
				<MentionDropdown open={mention.open} txns={filteredTxns} onPick={pickTxn} T={T} currency={currency} style={{ top: 8, left: 8 }} />
			</div>
			<input ref={imgInputRef} type="file" accept="image/*" multiple style={{ display: "none" }} onChange={e => handleImages(e.target.files)} />
		</div>
	);

	const calendarBlock = (
		<>
			<MiniCalendar activeDate={activeDate} entryDates={entryDates} onSelect={setActiveDate} T={T} />
			<TxnSummary txns={todayTxns} income={todayIncome} expense={todayExpense} T={T} />
		</>
	);

	// ── COVER ──
	if (viewMode === "cover") return (
		<div style={{ minHeight: "100vh", background: T.bg, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", fontFamily: "system-ui,sans-serif" }}>
			<div style={{ position: "fixed", top: 20, right: 20 }}><ThemeDots /></div>
			<div onClick={() => setViewMode("book")}
				onMouseEnter={e => e.currentTarget.style.transform = "scale(1.025) translateY(-3px)"}
				onMouseLeave={e => e.currentTarget.style.transform = "scale(1)"}
				style={{ cursor: "pointer", width: 210, transition: "transform 0.25s ease", background: T.brand, borderRadius: "4px 12px 12px 4px", padding: "50px 34px", textAlign: "center", boxShadow: `-10px 10px 0 ${T.brand}40,-5px 5px 0 ${T.brand}60` }}>
				<p style={{ fontSize: 30, fontWeight: 700, color: "white", fontFamily: "Georgia,serif", marginBottom: 4 }}>nikki</p>
				<p style={{ fontSize: 11, color: "rgba(255,255,255,0.55)", marginBottom: 28 }}>{t('journal.subtitle')}</p>
				{streak > 0 && (
					<div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 5, marginBottom: 18 }}>
						<Flame size={11} color="rgba(255,255,255,0.75)" />
						<span style={{ fontSize: 11, color: "rgba(255,255,255,0.75)" }}>{streak}{t('journal.streak')}</span>
					</div>
				)}
				<p style={{ fontSize: 9, color: "rgba(255,255,255,0.35)", letterSpacing: "0.12em", textTransform: "uppercase" }}>{t('journal.tapToOpen')}</p>
			</div>
			<button onClick={() => setViewMode("page")}
				style={{ marginTop: 24, background: "none", border: `1px solid ${T.brand}40`, borderRadius: 8, padding: "6px 16px", fontSize: 11, color: T.muted, cursor: "pointer", display: "flex", alignItems: "center", gap: 5 }}>
				<FileText size={11} /> {t('journal.pageView')}
			</button>
		</div>
	);

	// ── BOOK VIEW ──
	if (viewMode === "book") return (
		<div style={{ minHeight: "100vh", background: T.bg, display: "flex", flexDirection: "column", fontFamily: "system-ui,sans-serif" }}>
			<div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 20px", borderBottom: `1px solid ${T.brand}15`, background: T.card }}>
				<button onClick={() => setViewMode("cover")} style={{ background: "none", border: "none", cursor: "pointer", color: T.brand, fontFamily: "Georgia,serif", fontSize: 16, fontWeight: 700, padding: 0 }}>nikki</button>
				<div style={{ display: "flex", gap: 8, alignItems: "center" }}>
					<ThemeDots />
					<div style={{ width: 1, height: 14, background: `${T.brand}30`, margin: "0 4px" }} />
					<button onClick={() => setViewMode("page")} style={{ background: "none", border: `1px solid ${T.brand}35`, borderRadius: 7, padding: "4px 11px", fontSize: 11, color: T.muted, cursor: "pointer", display: "flex", alignItems: "center", gap: 4 }}>
						<Pencil size={11} /> {t('journal.write')}
					</button>
				</div>
			</div>
			<BookViewer entries={entries} activeDate={activeDate} onSelectDate={setActiveDate} onEdit={goEdit} T={T} entryDates={entryDates} />
		</div>
	);

	// ── PAGE VIEW (write) ──
	return (
		<div className="flex flex-col md:flex-row" style={{ background: T.bg, minHeight: "100vh", fontFamily: "system-ui,sans-serif", color: T.text, overflow: "hidden" }}>
			{/* LEFT SIDEBAR */}
			<div className="w-full md:w-[210px] flex-shrink-0" style={{ background: T.card, borderRight: `1px solid ${T.brand}15`, display: "flex", flexDirection: "column" }}>
				<div style={{ padding: "16px 16px 12px", borderBottom: `1px solid ${T.brand}10` }}>
					<p style={{ fontSize: 15, fontWeight: 700, color: T.brand, fontFamily: "Georgia,serif" }}>nikki</p>
					<p style={{ fontSize: 10, color: T.muted }}>{t('journal.subtitle')}</p>
				</div>
				<div style={{ padding: "10px 14px", borderBottom: `1px solid ${T.brand}10` }}>
					<p style={{ fontSize: 9, color: T.muted, textTransform: "uppercase", letterSpacing: "0.07em", fontWeight: 700, marginBottom: 7 }}>{t('journal.theme')}</p>
					<ThemeDots />
				</div>
				{streak > 0 && (
					<div style={{ padding: "10px 14px", borderBottom: `1px solid ${T.brand}10` }}>
						<div style={{ background: T.bg, borderRadius: 8, padding: "7px 10px", display: "flex", alignItems: "center", gap: 6 }}>
							<Flame size={12} color={T.brand} />
							<div>
								<p style={{ fontSize: 12, fontWeight: 700, color: T.text }}>{streak}{t('journal.streak')}</p>
								<p style={{ fontSize: 10, color: T.muted }}>{t('journal.keepItUp')}</p>
							</div>
						</div>
					</div>
				)}
				<div className="hidden md:block" style={{ flex: 1, overflowY: "auto", padding: "12px 14px" }}>{calendarBlock}</div>
				<div style={{ padding: "10px 14px", borderTop: `1px solid ${T.brand}10`, display: "flex", flexDirection: "column", gap: 6 }}>
					<button onClick={() => setViewMode("book")} style={{ width: "100%", background: "none", border: `1px solid ${T.brand}`, borderRadius: 8, padding: 7, fontSize: 11, color: T.brand, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 5 }}>
						<BookOpen size={11} /> {t('journal.bookView')}
					</button>
					<button onClick={() => { setActiveDate(todayStr()); setTitle(""); editor?.commands.setContent(""); setLinkedTxns([]); }}
						style={{ width: "100%", background: T.brand, color: "white", border: "none", borderRadius: 8, padding: 7, fontSize: 11, fontWeight: 700, cursor: "pointer" }}>
						{t('journal.newEntry')}
					</button>
				</div>
			</div>

			{/* EDITOR */}
			<div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0, overflow: "hidden", padding: 14, boxSizing: "border-box" }}>
				<div style={{ background: T.card, flex: 1, display: "flex", flexDirection: "column", overflow: "hidden", borderRadius: 14, border: `1px solid ${T.brand}12` }}>
					<div style={{ padding: "14px 20px 10px", borderBottom: `1px solid ${T.brand}10`, flexShrink: 0 }}>
						<input value={title} onChange={e => setTitle(e.target.value)} placeholder="Entry title…" dir="ltr"
							style={{ width: "100%", border: "none", outline: "none", fontSize: 20, fontWeight: 700, color: T.text, fontFamily: "Georgia,serif", background: "transparent", boxSizing: "border-box" }} />
					</div>
					{editorPanel}
				</div>
			</div>

			{/* RIGHT PANEL */}
			<div className="w-full md:w-[210px] flex-shrink-0" style={{ background: T.card, borderLeft: `1px solid ${T.brand}15`, display: "flex", flexDirection: "column" }}>
				<div style={{ padding: "12px 14px 10px", borderBottom: `1px solid ${T.brand}10` }}>
					<div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 4 }}>
						<button onClick={() => setActiveDate(prevDay)} style={{ background: "none", border: "none", cursor: "pointer", color: T.muted, display: "flex", padding: 2 }}><ChevronLeft size={13} /></button>
						<span style={{ fontSize: 12, fontWeight: 700, color: T.brand }}>{formatDisplay(activeDate)}</span>
						<button onClick={() => canNext && setActiveDate(nextDay)} style={{ background: "none", border: "none", cursor: canNext ? "pointer" : "default", color: canNext ? T.muted : "transparent", display: "flex", padding: 2 }}><ChevronRight size={13} /></button>
					</div>
					<p style={{ fontSize: 10, color: T.muted, textAlign: "center" }}>{wordCount} {t('journal.words')}</p>
				</div>
				<div style={{ flex: 1, overflowY: "auto", padding: "12px 14px" }}>
					{/* Mobile calendar here */}
					<div className="block md:hidden mb-4">{calendarBlock}</div>
					<TxnSummary txns={todayTxns} income={todayIncome} expense={todayExpense} T={T} currency={currency} />
				</div>
				<div style={{ padding: "10px 14px", borderTop: `1px solid ${T.brand}10` }}>
					<button onClick={save} disabled={saving}
						style={{ width: "100%", background: T.brand, color: "white", border: "none", borderRadius: 8, padding: "8px 0", fontSize: 12, fontWeight: 700, cursor: "pointer", opacity: saving ? 0.7 : 1 }}>
						{saving ? t('journal.saving') : t('journal.save')}
					</button>
				</div>
			</div>
		</div>
	);
}

function todayStr() { return new Date().toISOString().slice(0, 10); }
function offsetDate(ds, days) { const d = new Date(ds + "T12:00:00"); d.setDate(d.getDate() + days); return d.toISOString().slice(0, 10); }
function formatDisplay(ds) { return new Date(ds + "T12:00:00").toLocaleDateString("en", { weekday: "short", month: "short", day: "numeric" }); }