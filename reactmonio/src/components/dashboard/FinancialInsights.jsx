import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import api from '../../api/axios';
import { Sparkles, AlertCircle } from 'lucide-react';
import ReactMarkdown from "react-markdown";
const FinancialInsights = () => {
	const { t, i18n } = useTranslation();
	const [loading, setLoading] = useState(false);
	const [insight, setInsight] = useState(null);
	const [error, setError] = useState(null);

	// Load cached insight from localStorage if available
	useEffect(() => {
		const cached = localStorage.getItem('monio_ai_insight');
		if (cached) {
			try {
				setInsight(JSON.parse(cached));
			} catch (e) {
				// ignore invalid cache
			}
		}
	}, []);

	const getInsights = async () => {
		setLoading(true);
		setError(null);
		try {
			const res = await api.post('/ai/insights', { language: i18n.language || 'en' });
			if (res.data?.success) {
				const newInsight = {
					text: res.data.insight,
					generated_at: res.data.generated_at
				};
				setInsight(newInsight);
				localStorage.setItem('monio_ai_insight', JSON.stringify(newInsight));
			} else {
				setError(res.data?.error || 'Failed to fetch insights.');
			}
		} catch (err) {
			setError(err.response?.data?.error || 'An error occurred while communicating with the AI.');
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className="rounded-2xl p-6 shadow-sm mt-5" style={{ background: 'var(--card)' }}>
			<div className="flex flex-col sm:flex-row sm:items-start justify-between mb-4 gap-4">
				<div className="flex items-center gap-3">
					<div className="p-2 rounded-lg" style={{ background: '#fdf4ff', color: '#c026d3' }}>
						<Sparkles size={20} />
					</div>
					<div>
						<h3 className="text-base font-bold" style={{ color: 'var(--text)' }}>AI Financial Insights</h3>
						<p className="text-xs" style={{ color: 'var(--text-soft)' }}>
							Get a personalized summary of your spending habits and financial health.
						</p>
					</div>
				</div>
				<button
					onClick={getInsights}
					disabled={loading}
					className="text-xs font-bold px-4 py-2 rounded-lg transition-colors whitespace-nowrap"
					style={{
						background: loading ? 'var(--border)' : '#c026d3',
						color: loading ? 'var(--text-muted)' : '#fff',
						cursor: loading ? 'not-allowed' : 'pointer'
					}}
				>
					{loading ? 'Analyzing...' : 'Get Insights'}
				</button>
			</div>

			{error && (
				<div className="p-3 rounded-lg flex items-start gap-2 text-sm mt-4" style={{ background: '#fff1f1', color: '#dc2626', border: '1px solid #fca5a5' }}>
					<AlertCircle size={16} className="mt-0.5 shrink-0" />
					<p>{error}</p>
				</div>
			)}

			{insight && !error && (
				<div className="mt-4 p-4 rounded-xl text-sm" style={{ background: 'var(--bg)', color: 'var(--text)', border: '1px solid var(--border)' }}>
					<div className="leading-relaxed">
						<ReactMarkdown
							components={{
								h1: ({ children }) => (
									<h1 className="text-xl font-bold mb-3">{children}</h1>
								),
								h2: ({ children }) => (
									<h2 className="text-lg font-semibold mt-4 mb-2">{children}</h2>
								),
								p: ({ children }) => (
									<p className="mb-3">{children}</p>
								),
								ul: ({ children }) => (
									<ul className="list-disc ml-5 mb-3">{children}</ul>
								),
								li: ({ children }) => (
									<li className="mb-1">{children}</li>
								),
								strong: ({ children }) => (
									<strong className="font-bold">{children}</strong>
								),
							}}
						>
							{insight.text}
						</ReactMarkdown>
					</div>
					{insight.generated_at && (
						<p className="text-[10px] mt-3" style={{ color: 'var(--text-muted)' }}>
							Generated at {new Date(insight.generated_at).toLocaleString()}
						</p>
					)}
				</div>
			)}
		</div>
	);
};

export default FinancialInsights;
