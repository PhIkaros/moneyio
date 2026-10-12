import { Link } from 'react-router-dom';
import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

export default function Landing() {
	const rootRef = useRef(null);
	const { t, i18n } = useTranslation();
	const [contactForm, setContactForm] = useState({ name: '', email: '', message: '' });
	const [messageSent, setMessageSent] = useState(false);

	const handleLanguageToggle = () => {
		const newLang = i18n.language === 'fr' ? 'en' : 'fr';
		i18n.changeLanguage(newLang);
		localStorage.setItem('locale', newLang);
	};

	const handleContactSubmit = (e) => {
		e.preventDefault();
		setMessageSent(true);
		setContactForm({ name: '', email: '', message: '' });
		setTimeout(() => setMessageSent(false), 5000);
	};

	useEffect(() => {
		const els = rootRef.current.querySelectorAll('.reveal');
		const obs = new IntersectionObserver(
			(entries) => {
				entries.forEach((entry) => {
					if (entry.isIntersecting) {
						entry.target.classList.add('is-visible');
					}
				});
			},
			{ threshold: 0.15 }
		);
		els.forEach((el) => obs.observe(el));
		return () => obs.disconnect();
	}, []);

	return (
		<div ref={rootRef} style={{ position: 'relative', minHeight: '100vh', color: '#1c2b28', fontFamily: "'DM Sans', sans-serif", overflowX: 'hidden', background: '#fbf8f1' }}>

			<style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&family=Playfair+Display:wght@700;800&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }

        /* ---------- Moving grid background (fixed, covers whole page) ---------- */
        .bg-layer {
          position: fixed;
          inset: 0;
          z-index: 0;
          overflow: hidden;
          background: #fbf8f1;
        }
        .bg-grid {
          position: absolute;
          inset: -50%;
          width: 200%;
          height: 200%;
          background-image:
            linear-gradient(rgba(45,212,191,0.16) 1.5px, transparent 1.5px),
            linear-gradient(90deg, rgba(45,212,191,0.16) 1.5px, transparent 1.5px);
          background-size: 44px 44px;
          animation: gridDrift 7s linear infinite;
          will-change: transform;
        }
        @keyframes gridDrift {
          0% { transform: translate(0, 0); }
          100% { transform: translate(44px, 44px); }
        }
        .bg-wash {
          position: absolute;
          inset: -20%;
          width: 140%;
          height: 140%;
          background:
            radial-gradient(ellipse 55% 38% at 15% 10%, rgba(45,212,191,0.26), transparent 60%),
            radial-gradient(ellipse 48% 38% at 90% 25%, rgba(140,200,80,0.22), transparent 60%),
            radial-gradient(ellipse 52% 42% at 30% 85%, rgba(90,160,220,0.20), transparent 60%),
            radial-gradient(ellipse 42% 32% at 85% 90%, rgba(232,196,140,0.26), transparent 60%);
          animation: washDrift 9s ease-in-out infinite alternate;
          will-change: transform;
        }
        @keyframes washDrift {
          0% { transform: translate(0, 0) scale(1); }
          50% { transform: translate(3%, -3%) scale(1.05); }
          100% { transform: translate(-3%, 2%) scale(1); }
        }

        /* Floating doodle shapes */
        .doodle {
          position: absolute;
          animation: floaty 9s ease-in-out infinite;
          opacity: 0.9;
          filter: drop-shadow(0 4px 10px rgba(0,0,0,0.05));
        }
        @keyframes floaty {
          0%, 100% { transform: translate(0,0) rotate(0deg); }
          25% { transform: translate(8px,-14px) rotate(6deg); }
          50% { transform: translate(-6px,-6px) rotate(-4deg); }
          75% { transform: translate(-10px,10px) rotate(3deg); }
        }
        @keyframes floatySlow {
          0%, 100% { transform: translate(0,0) rotate(0deg); }
          50% { transform: translate(-14px,16px) rotate(-8deg); }
        }
        @keyframes spinSlow { to { transform: rotate(360deg); } }
        @keyframes squiggleMove {
          0%, 100% { transform: translateX(0) scaleX(1); }
          50% { transform: translateX(10px) scaleX(1.08); }
        }

        /* ---------- Content ---------- */
        .content { position: relative; z-index: 1; background: transparent; }
        .nav-link { color: #3a4b47; text-decoration: none; font-size: 14px; font-weight: 600; transition: color 0.2s; }
        .nav-link:hover { color: #199988; }
        .nav-pill-link { color: #3a4b47; text-decoration: none; font-size: 13px; font-weight: 600; padding: 8px 14px; border-radius: 100px; transition: background 0.2s, color 0.2s; }
        .nav-pill-link:hover { background: rgba(45,212,191,0.14); color: #14493f; }
        .tag { display: inline-block; background: rgba(45,212,191,0.14); color: #0f8a78; font-size: 11px; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase; padding: 6px 14px; border-radius: 100px; border: 1px solid rgba(45,212,191,0.3); margin-bottom: 16px; }
        .feature-card {
          background: rgba(255,255,255,0.75);
          border: 1px solid rgba(45,212,191,0.18);
          border-radius: 20px;
          padding: 28px;
          backdrop-filter: blur(6px);
          transition: transform 0.3s, box-shadow 0.3s, border 0.3s;
        }
        .feature-card:hover { transform: translateY(-6px); box-shadow: 0 16px 32px rgba(45,212,191,0.15); border-color: rgba(45,212,191,0.4); }

        .btn-primary { background: #14493f; color: white; font-weight: 600; font-size: 14px; padding: 11px 24px; border-radius: 10px; text-decoration: none; transition: background 0.2s, transform 0.15s; display: inline-block; }
        .btn-primary:hover { background: #199988; transform: translateY(-1px); }
        .btn-ghost { color: #14493f; font-weight: 600; font-size: 14px; padding: 11px 22px; border-radius: 10px; text-decoration: none; border: 1px solid rgba(28,43,40,0.16); transition: border 0.2s, background 0.2s; display: inline-block; }
        .btn-ghost:hover { border-color: rgba(28,43,40,0.35); background: rgba(255,255,255,0.5); }

        .stat-num { font-family: 'Playfair Display', serif; font-size: 34px; font-weight: 800; color: #14493f; }

        /* Scroll reveal */
        .reveal { opacity: 0; transform: translateY(28px); transition: opacity 0.7s ease, transform 0.7s ease; }
        .reveal.is-visible { opacity: 1; transform: translateY(0); }
        .reveal-1.is-visible { transition-delay: 0.05s; }
        .reveal-2.is-visible { transition-delay: 0.15s; }
        .reveal-3.is-visible { transition-delay: 0.25s; }
        .reveal-4.is-visible { transition-delay: 0.35s; }

        @media (max-width: 768px) {
          .features-grid { grid-template-columns: 1fr !important; }
          .stats-grid { grid-template-columns: 1fr 1fr !important; }
          .hero-title { font-size: 40px !important; }
          .nav-links { display: none !important; }
        }
      `}</style>

			{/* ---------- Fixed animated background ---------- */}
			<div className="bg-layer">
				<div className="bg-grid" />
				<div className="bg-wash" />

				{/* Floating doodles scattered across viewport */}
				<svg className="doodle" style={{ top: '8%', left: '6%', width: 46, animationDuration: '10s' }} viewBox="0 0 24 24" fill="none">
					<path d="M12 21s-7-4.35-9.5-8.5C.7 9 2 5 6 5c2 0 3.3 1.2 4 2.3C10.7 6.2 12 5 14 5c4 0 5.3 4 3.5 7.5C15 16.65 12 21 12 21z" fill="#8CC850" opacity="0.55" />
				</svg>

				{/* Pen 1 */}
				<svg className="doodle" style={{ top: '18%', right: '10%', width: 28, animationDuration: '11s' }} viewBox="0 0 24 24" fill="none">
					<path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z" stroke="#8CC850" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
				</svg>

				{/* Pen 2 */}
				<svg className="doodle" style={{ top: '70%', left: '8%', width: 28, animationDuration: '11s' }} viewBox="0 0 24 24" fill="none">
					<path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z" stroke="#8CC850" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
				</svg>

				{/* Flipped M */}
				<svg className="doodle" style={{ top: '38%', left: '15%', width: 26, animationDuration: '7s' }} viewBox="0 0 16 16" fill="none">
					<path d="M 5,12 L 6,4 L 8,8 L 10,4 L 12,12" stroke="#2dd4bf" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
				</svg>

				<svg className="doodle" style={{ top: '55%', right: '18%', width: 34, animationDuration: '9s', animationDelay: '0.8s' }} viewBox="0 0 24 24" fill="none">
					<path d="M12 2l2.6 6.6L21 9l-5 4.4L17.5 21 12 17.3 6.5 21 8 13.4 3 9l6.4-.4z" fill="#2dd4bf" opacity="0.45" />
				</svg>

				{/* Pen 3 */}
				<svg className="doodle" style={{ top: '82%', right: '15%', width: 28, animationDuration: '11s' }} viewBox="0 0 24 24" fill="none">
					<path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z" stroke="#8CC850" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
				</svg>

				<svg className="doodle" style={{ top: '92%', left: '30%', width: 30, animationDuration: '9.5s' }} viewBox="0 0 24 24" fill="none">
					<path d="M12 21s-7-4.35-9.5-8.5C.7 9 2 5 6 5c2 0 3.3 1.2 4 2.3C10.7 6.2 12 5 14 5c4 0 5.3 4 3.5 7.5C15 16.65 12 21 12 21z" fill="#5aa0dc" opacity="0.4" />
				</svg>

				<svg className="doodle" style={{ top: '4%', left: '48%', width: 20, animationDuration: '6.5s', animationDelay: '0.6s' }} viewBox="0 0 24 24" fill="none">
					<path d="M12 2l2.6 6.6L21 9l-5 4.4L17.5 21 12 17.3 6.5 21 8 13.4 3 9l6.4-.4z" fill="#e8c48c" opacity="0.5" />
				</svg>

				{/* Squiggles */}
				<svg className="doodle" style={{ top: '28%', left: '42%', width: 70, animationName: 'squiggleMove', animationDuration: '6s' }} viewBox="0 0 80 20" fill="none">
					<path d="M2 10c8-10 14 10 22 0s14 10 22 0 14 10 22 0" stroke="#2dd4bf" strokeWidth="3" strokeLinecap="round" opacity="0.4" />
				</svg>
				<svg className="doodle" style={{ top: '64%', left: '55%', width: 60, animationName: 'squiggleMove', animationDuration: '7s', animationDelay: '1s' }} viewBox="0 0 80 20" fill="none">
					<path d="M2 10c8-10 14 10 22 0s14 10 22 0 14 10 22 0" stroke="#e8c48c" strokeWidth="3" strokeLinecap="round" opacity="0.5" />
				</svg>
			</div>

			{/* ---------- Content ---------- */}
			<div className="content">

				{/* Navbar — floating pill, transparent */}
				<div style={{ position: 'fixed', top: 20, left: 0, right: 0, zIndex: 100, display: 'flex', justifyContent: 'center', padding: '0 20px' }}>
					<nav style={{
						width: '100%', maxWidth: 980,
						display: 'flex', alignItems: 'center', justifyContent: 'space-between',
						padding: '10px 14px 10px 20px',
						borderRadius: 100,
						background: 'rgba(255,255,255,0.55)',
						backdropFilter: 'blur(16px)',
						border: '1px solid rgba(255,255,255,0.6)',
						boxShadow: '0 8px 30px rgba(20,73,63,0.08)',
					}}>
						<div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
							<div className="flex items-center gap-2.5 mr-4">
								<img src="/public/moneyiologo.png" width="70px" />
							</div>
						</div>

						<div className="nav-links" style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
							<a href="#features" className="nav-pill-link">{t('landing.features')}</a>
							<a href="#journal" className="nav-pill-link">{t('landing.journal')}</a>
							<a href="#stats" className="nav-pill-link">{t('landing.stats')}</a>
						</div>

						<div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
							<button onClick={handleLanguageToggle} className="nav-pill-link" style={{ border: 'none', background: 'transparent', cursor: 'pointer', textTransform: 'uppercase', padding: '8px 10px' }}>
								{i18n.language === 'fr' ? 'EN' : 'FR'}
							</button>
							<Link to="/login" className="btn-ghost" style={{ padding: '9px 18px', fontSize: 13, border: 'none' }}>{t('landing.signIn')}</Link>
							<Link to="/register" className="btn-primary" style={{ padding: '9px 18px', fontSize: 13 }}>{t('landing.getStarted')}</Link>
						</div>
					</nav>
				</div>

				{/* Hero — centered text only */}
				<section style={{ minHeight: '100vh', paddingTop: 120, paddingBottom: 80, paddingLeft: 24, paddingRight: 24, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
					<div style={{ maxWidth: 720, margin: '0 auto', textAlign: 'center' }}>
						<h1 className="reveal is-visible reveal-1 hero-title" style={{ fontFamily: "'Playfair Display', serif", fontSize: 62, fontWeight: 800, lineHeight: 1.1, letterSpacing: '-0.03em', marginBottom: 24, color: '#14493f' }}>
							{t('landing.title1')}<br />
							<span style={{ color: '#199988' }}>{t('landing.title2')}</span>
						</h1>
						<p className="reveal is-visible reveal-2" style={{ fontSize: 18, color: '#3a4b47', lineHeight: 1.7, marginBottom: 40, maxWidth: 480, marginLeft: 'auto', marginRight: 'auto' }}>
							{t('landing.desc')}
						</p>
						<div className="reveal is-visible reveal-3" style={{ display: 'flex', gap: 14, flexWrap: 'wrap', justifyContent: 'center' }}>
							<Link to="/register" className="btn-primary">{t('landing.createFree')}</Link>
							<Link to="/login" className="btn-ghost">{t('landing.signIn')}</Link>
						</div>

						<div className="stats-grid reveal is-visible reveal-4" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 24, marginTop: 56, paddingTop: 36, borderTop: '1px solid rgba(28,43,40,0.1)' }}>
							{[
								{ num: '5+', label: t('landing.accountTypes') },
								{ num: 'FR/EN', label: t('landing.multilingual') },
								{ num: '∞', label: t('landing.transactions') },
							].map((s, i) => (
								<div key={i}>
									<div className="stat-num">{s.num}</div>
									<div style={{ fontSize: 13, color: '#5c6b67', marginTop: 4 }}>{s.label}</div>
								</div>
							))}
						</div>
					</div>
				</section>

				{/* Features */}
				<section id="features" style={{ padding: '100px 48px', maxWidth: 1200, margin: '0 auto' }}>
					<div className="reveal" style={{ textAlign: 'center', marginBottom: 64 }}>
						<h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 42, fontWeight: 800, letterSpacing: '-0.03em', color: '#14493f' }}>
							{t('landing.oneApp')}
						</h2>
					</div>

					<div className="features-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20 }}>
						{[
							{ icon: '◈', title: t('landing.fDashboard'), desc: t('landing.fDashboardDesc'), color: '#199988' },
							{ icon: '⬡', title: t('landing.fLedger'), desc: t('landing.fLedgerDesc'), color: '#3d8fc4' },
							{ icon: '◎', title: t('landing.fBudgets'), desc: t('landing.fBudgetsDesc'), color: '#c78a3d' },
							{ icon: '◻', title: t('landing.fNotes'), desc: t('landing.fNotesDesc'), color: '#c46b8f' },
							{ icon: '✦', title: t('landing.fNikki'), desc: t('landing.fNikkiDesc'), color: '#5aa04a' },
							{ icon: '◬', title: t('landing.fStats'), desc: t('landing.fStatsDesc'), color: '#4a6fc4' },
						].map((f, i) => (
							<div key={i} className={`feature-card reveal reveal-${(i % 4) + 1}`}>
								<div style={{ fontSize: 24, color: f.color, marginBottom: 16 }}>{f.icon}</div>
								<h3 style={{ fontSize: 17, fontWeight: 700, marginBottom: 10, color: '#14493f' }}>{f.title}</h3>
								<p style={{ fontSize: 14, color: '#5c6b67', lineHeight: 1.7 }}>{f.desc}</p>
							</div>
						))}
					</div>
				</section>

				{/* Journal highlight */}
				<section id="journal" style={{ padding: '100px 48px' }}>
					<div className="reveal" style={{ maxWidth: 1200, margin: '0 auto', background: 'rgba(255,255,255,0.75)', border: '1px solid rgba(45,212,191,0.2)', borderRadius: 28, padding: '72px 64px', display: 'flex', gap: 80, alignItems: 'center', flexWrap: 'wrap', backdropFilter: 'blur(6px)' }}>
						<div style={{ flex: 1, minWidth: 260 }}>
							<h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 42, fontWeight: 800, letterSpacing: '-0.03em', marginBottom: 20, lineHeight: 1.1, color: '#14493f' }}>
								{t('landing.nikkiTitle1')}<br />{t('landing.nikkiTitle2')}
							</h2>
							<p style={{ color: '#3a4b47', fontSize: 16, lineHeight: 1.8, marginBottom: 32 }}>
								{t('landing.nikkiDesc')}
							</p>
							<Link to="/register" className="btn-primary">{t('landing.startWriting')}</Link>
						</div>
						<div style={{ flex: 1, minWidth: 260, display: 'flex', flexDirection: 'column', gap: 12 }}>
							{[
								{ label: t('landing.nikkiR1'), detail: t('landing.nikkiR1d') },
								{ label: t('landing.nikkiR2'), detail: t('landing.nikkiR2d') },
								{ label: t('landing.nikkiR3'), detail: t('landing.nikkiR3d') },
								{ label: t('landing.nikkiR4'), detail: t('landing.nikkiR4d') },
							].map((item, i) => (
								<div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 14, padding: '16px 20px', background: 'rgba(255,255,255,0.7)', borderRadius: 14, border: '1px solid rgba(45,212,191,0.15)' }}>
									<div style={{ width: 8, height: 8, borderRadius: '50%', background: '#2dd4bf', marginTop: 6, flexShrink: 0 }} />
									<div>
										<div style={{ fontSize: 14, fontWeight: 700, marginBottom: 3, color: '#14493f' }}>{item.label}</div>
										<div style={{ fontSize: 13, color: '#5c6b67' }}>{item.detail}</div>
									</div>
								</div>
							))}
						</div>
					</div>
				</section>

				{/* Contact Us Section */}
				<section id="contact" style={{ padding: '80px 48px', background: 'rgba(20,73,63,0.02)' }}>
					<div className="reveal" style={{ maxWidth: 600, margin: '0 auto', textAlign: 'center' }}>
						<h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 36, fontWeight: 800, letterSpacing: '-0.02em', color: '#14493f', marginBottom: 12 }}>
							{t('landing.contact')}
						</h2>
						<p style={{ color: '#5c6b67', fontSize: 16, marginBottom: 40 }}>{t('landing.contactDesc')}</p>

						{messageSent ? (
							<div style={{ background: 'rgba(45,212,191,0.15)', border: '1px solid rgba(45,212,191,0.3)', borderRadius: 16, padding: '32px', color: '#0f8a78', fontWeight: 600, fontSize: 16 }}>
								{t('landing.sent')}
							</div>
						) : (
							<form onSubmit={handleContactSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16, textAlign: 'left' }}>
								<div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
									<input
										type="text"
										placeholder={t('landing.name')}
										value={contactForm.name}
										onChange={e => setContactForm({ ...contactForm, name: e.target.value })}
										required
										style={{ padding: '14px 18px', borderRadius: 12, border: '1px solid rgba(28,43,40,0.15)', background: 'white', fontFamily: "'DM Sans', sans-serif", fontSize: 14, outline: 'none' }}
									/>
									<input
										type="email"
										placeholder={t('landing.email')}
										value={contactForm.email}
										onChange={e => setContactForm({ ...contactForm, email: e.target.value })}
										required
										style={{ padding: '14px 18px', borderRadius: 12, border: '1px solid rgba(28,43,40,0.15)', background: 'white', fontFamily: "'DM Sans', sans-serif", fontSize: 14, outline: 'none' }}
									/>
								</div>
								<textarea
									placeholder={t('landing.message')}
									value={contactForm.message}
									onChange={e => setContactForm({ ...contactForm, message: e.target.value })}
									required
									rows={4}
									style={{ padding: '14px 18px', borderRadius: 12, border: '1px solid rgba(28,43,40,0.15)', background: 'white', fontFamily: "'DM Sans', sans-serif", fontSize: 14, outline: 'none', resize: 'vertical' }}
								/>
								<button type="submit" className="btn-primary" style={{ alignSelf: 'flex-start', padding: '14px 32px' }}>
									{t('landing.send')}
								</button>
							</form>
						)}
					</div>
				</section>

				{/* CTA */}
				<section style={{ padding: '100px 48px', textAlign: 'center' }}>
					<div className="reveal" style={{ maxWidth: 600, margin: '0 auto' }}>
						<h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 48, fontWeight: 800, letterSpacing: '-0.03em', marginBottom: 20, lineHeight: 1.1, color: '#14493f' }}>
							{t('landing.ready')}
						</h2>
						<p style={{ color: '#3a4b47', fontSize: 17, marginBottom: 40, lineHeight: 1.7 }}>
							{t('landing.readyDesc')}
						</p>
						<Link to="/register" className="btn-primary" style={{ fontSize: 14, padding: '13px 28px' }}>
							{t('landing.getStartedFree')}
						</Link>
					</div>
				</section>

				{/* Footer */}
				<footer style={{ borderTop: '1px solid rgba(28,43,40,0.08)', padding: '32px 48px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16, background: 'rgba(251,248,241,0.6)' }}>
					<div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
						<div className="flex items-center gap-2.5 mr-4">
							<img src="/public/moneyiologo.png" width="50px" />
						</div>
					</div>
					<div style={{ fontSize: 13, color: '#7a8985' }}>
						{t('landing.footerDesc')}
					</div>
					<div style={{ display: 'flex', gap: 24 }}>
						<Link to="/login" className="nav-link" style={{ fontSize: 13 }}>{t('landing.signIn')}</Link>
						<Link to="/register" className="nav-link" style={{ fontSize: 13 }}>{t('landing.register')}</Link>
					</div>
				</footer>
			</div>
		</div>
	);
}