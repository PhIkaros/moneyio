import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';

const Register = () => {
	const [name, setName] = useState('');
	const [email, setEmail] = useState('');
	const [password, setPassword] = useState('');
	const [passwordConfirmation, setPasswordConfirmation] = useState('');
	const [error, setError] = useState('');
	const [loading, setLoading] = useState(false);
	const [showPass, setShowPass] = useState(false);
	const { login } = useAuth();
	const navigate = useNavigate();

	const handleSubmit = async (e) => {
		e.preventDefault();
		setLoading(true);
		setError('');
		try {
			const response = await api.post('/register', {
				name, email, password,
				password_confirmation: passwordConfirmation,
			});
			login(response.data.access_token, response.data.user);
			navigate('/dashboard');
		} catch (err) {
			if (err.response?.data?.errors) {
				const firstError = Object.values(err.response.data.errors)[0][0];
				setError(firstError);
			} else {
				setError(err?.response?.data?.message || 'Something went wrong.');
			}
		} finally {
			setLoading(false);
		}
	};

	return (
		<div style={{ minHeight: '100vh', display: 'flex', fontFamily: "'DM Sans', sans-serif", background: '#060d12' }}>
			<style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&family=Playfair+Display:ital,wght@0,700;1,700&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }

        .auth-input {
          width: 100%;
          padding: 13px 16px;
          border-radius: 12px;
          border: 1px solid rgba(255,255,255,0.08);
          background: rgba(255,255,255,0.04);
          color: white;
          font-size: 14px;
          font-family: 'DM Sans', sans-serif;
          outline: none;
          transition: border 0.2s, background 0.2s;
        }
        .auth-input::placeholder { color: rgba(255,255,255,0.2); }
        .auth-input:focus {
          border-color: rgba(140,200,80,0.5);
          background: rgba(140,200,80,0.04);
        }

        .auth-btn {
          width: 100%;
          padding: 14px;
          border-radius: 12px;
          border: none;
          background: #8CC850;
          color: #071a0a;
          font-size: 15px;
          font-weight: 700;
          font-family: 'DM Sans', sans-serif;
          cursor: pointer;
          transition: background 0.2s, transform 0.15s;
        }
        .auth-btn:hover:not(:disabled) { background: #a3d96e; transform: translateY(-1px); }
        .auth-btn:disabled { opacity: 0.6; cursor: not-allowed; }

        .left-panel {
          flex: 1;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          padding: 48px;
          position: relative;
          overflow: hidden;
          background: linear-gradient(160deg, #0a1a10 0%, #060d12 100%);
          border-right: 1px solid rgba(255,255,255,0.05);
        }

        .right-panel {
          width: 520px;
          display: flex;
          flex-direction: column;
          justify-content: center;
          padding: 64px 56px;
          background: #060d12;
          overflow-y: auto;
        }

        .orb {
          position: absolute;
          border-radius: 50%;
          filter: blur(80px);
          pointer-events: none;
        }

        .float-card {
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.07);
          border-radius: 16px;
          padding: 20px 24px;
          backdrop-filter: blur(10px);
        }

        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }

        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .fade-1 { animation: fadeUp 0.6s ease forwards; }
        .fade-2 { animation: fadeUp 0.6s 0.08s ease forwards; opacity: 0; }
        .fade-3 { animation: fadeUp 0.6s 0.16s ease forwards; opacity: 0; }
        .fade-4 { animation: fadeUp 0.6s 0.24s ease forwards; opacity: 0; }
        .fade-5 { animation: fadeUp 0.6s 0.32s ease forwards; opacity: 0; }
        .fade-6 { animation: fadeUp 0.6s 0.4s ease forwards; opacity: 0; }
        .fade-7 { animation: fadeUp 0.6s 0.48s ease forwards; opacity: 0; }

        .pass-wrap { position: relative; }
        .pass-toggle {
          position: absolute; right: 14px; top: 50%; transform: translateY(-50%);
          background: none; border: none; cursor: pointer; color: rgba(255,255,255,0.3);
          font-size: 13px; padding: 0; font-family: 'DM Sans', sans-serif;
          transition: color 0.2s;
        }
        .pass-toggle:hover { color: rgba(255,255,255,0.7); }

        .two-col { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }

        @media (max-width: 768px) {
          .left-panel { display: none; }
          .right-panel { width: 100%; padding: 40px 28px; }
          .two-col { grid-template-columns: 1fr; }
        }
      `}</style>

			{/* Left decorative panel */}
			<div className="left-panel">
				<div className="orb" style={{ width: 400, height: 400, background: 'rgba(140,200,80,0.12)', top: -100, left: -100 }} />
				<div className="orb" style={{ width: 300, height: 300, background: 'rgba(26,107,154,0.15)', bottom: 50, right: -80 }} />

				{/* Logo */}
				<div style={{ display: 'flex', alignItems: 'center', gap: 10, position: 'relative', zIndex: 1 }}>
					<svg width="36" height="36" viewBox="0 0 28 28" fill="none">
						<circle cx="10" cy="14" r="8" fill="#8CC850" opacity="0.95" />
						<circle cx="18" cy="14" r="8" fill="#1a6b9a" opacity="0.75" />
					</svg>
					<span style={{ fontWeight: 700, fontSize: 20, color: 'white', letterSpacing: '-0.02em' }}>NexusBank</span>
				</div>

				{/* Center content */}
				<div style={{ position: 'relative', zIndex: 1 }}>
					<p style={{ fontSize: 12, fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#8CC850', marginBottom: 16 }}>Join today</p>
					<h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 48, fontWeight: 700, color: 'white', lineHeight: 1.1, marginBottom: 40 }}>
						Start your<br />
						<em style={{ color: '#8CC850', fontStyle: 'italic' }}>financial journey.</em>
					</h2>

					<div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
						{[
							{ icon: '◈', text: 'Dashboard with live charts & account overview' },
							{ icon: '✦', text: 'Nikki journal — link transactions to diary entries' },
							{ icon: '◎', text: 'Budget alerts before you overspend' },
							{ icon: '◻', text: 'Notes, checklists & statistics all in one place' },
						].map((f, i) => (
							<div key={i} className="float-card" style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 18px', animation: `float ${3.5 + i * 0.5}s ${i * 0.3}s ease-in-out infinite` }}>
								<span style={{ fontSize: 18, color: '#8CC850', flexShrink: 0 }}>{f.icon}</span>
								<span style={{ fontSize: 13, color: 'rgba(255,255,255,0.6)', lineHeight: 1.4 }}>{f.text}</span>
							</div>
						))}
					</div>
				</div>

				<p style={{ fontSize: 13, color: 'rgba(255,255,255,0.2)', position: 'relative', zIndex: 1 }}>
					Free to use. No credit card required.
				</p>
			</div>

			{/* Right form panel */}
			<div className="right-panel">
				<div className="fade-1" style={{ marginBottom: 36 }}>
					<h1 style={{ fontSize: 28, fontWeight: 700, color: 'white', letterSpacing: '-0.02em', marginBottom: 8 }}>Create your account</h1>
					<p style={{ fontSize: 14, color: 'rgba(255,255,255,0.4)' }}>Get started with NexusBank for free</p>
				</div>

				{error && (
					<div style={{ padding: '12px 16px', borderRadius: 10, marginBottom: 24, fontSize: 13, fontWeight: 500, background: 'rgba(224,82,82,0.1)', color: '#e05252', border: '1px solid rgba(224,82,82,0.2)' }}>
						{error}
					</div>
				)}

				<form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
					<div className="fade-2">
						<label style={{ fontSize: 12, fontWeight: 600, color: 'rgba(255,255,255,0.5)', display: 'block', marginBottom: 8, letterSpacing: '0.05em', textTransform: 'uppercase' }}>Full name</label>
						<input
							type="text" value={name} onChange={e => setName(e.target.value)}
							className="auth-input" placeholder="Your name" required
						/>
					</div>

					<div className="fade-3">
						<label style={{ fontSize: 12, fontWeight: 600, color: 'rgba(255,255,255,0.5)', display: 'block', marginBottom: 8, letterSpacing: '0.05em', textTransform: 'uppercase' }}>Email</label>
						<input
							type="email" value={email} onChange={e => setEmail(e.target.value)}
							className="auth-input" placeholder="you@email.com" required
						/>
					</div>

					<div className="two-col fade-4">
						<div>
							<label style={{ fontSize: 12, fontWeight: 600, color: 'rgba(255,255,255,0.5)', display: 'block', marginBottom: 8, letterSpacing: '0.05em', textTransform: 'uppercase' }}>Password</label>
							<div className="pass-wrap">
								<input
									type={showPass ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)}
									className="auth-input" placeholder="••••••••" required style={{ paddingRight: 56 }}
								/>
								<button type="button" className="pass-toggle" onClick={() => setShowPass(p => !p)}>
									{showPass ? 'Hide' : 'Show'}
								</button>
							</div>
						</div>
						<div>
							<label style={{ fontSize: 12, fontWeight: 600, color: 'rgba(255,255,255,0.5)', display: 'block', marginBottom: 8, letterSpacing: '0.05em', textTransform: 'uppercase' }}>Confirm</label>
							<input
								type={showPass ? 'text' : 'password'} value={passwordConfirmation} onChange={e => setPasswordConfirmation(e.target.value)}
								className="auth-input" placeholder="••••••••" required
							/>
						</div>
					</div>

					<div className="fade-5" style={{ marginTop: 4 }}>
						<button type="submit" disabled={loading} className="auth-btn">
							{loading ? 'Creating account…' : 'Create account →'}
						</button>
					</div>

					<p className="fade-6" style={{ textAlign: 'center', fontSize: 14, color: 'rgba(255,255,255,0.35)' }}>
						Already have an account?{' '}
						<Link to="/login" style={{ color: '#8CC850', fontWeight: 600, textDecoration: 'none' }}>
							Sign in
						</Link>
					</p>
				</form>
			</div>
		</div>
	);
};

export default Register;