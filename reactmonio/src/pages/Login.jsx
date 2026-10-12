import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from 'react-i18next';
import api from '../api/axios';

const Auth = () => {
	const [mode, setMode] = useState('login'); // 'login' | 'register'
	const [sliding, setSliding] = useState(false);
	const [slideDir, setSlideDir] = useState('left');

	const [email, setEmail] = useState('');
	const [password, setPassword] = useState('');
	const [name, setName] = useState('');
	const [passwordConfirmation, setPasswordConfirmation] = useState('');
	const [showPass, setShowPass] = useState(false);
	const [error, setError] = useState('');
	const [loading, setLoading] = useState(false);

	const { login } = useAuth();
	const navigate = useNavigate();
	const { t } = useTranslation();

	const switchMode = (to) => {
		if (sliding || mode === to) return;
		setSlideDir(to === 'register' ? 'left' : 'right');
		setSliding(true);
		setError('');
		setTimeout(() => {
			setMode(to);
			setSliding(false);
		}, 420);
	};

	const handleLogin = async (e) => {
		e.preventDefault();
		setLoading(true);
		setError('');
		try {
			const response = await api.post('/login', { email, password });
			login(response.data.access_token, response.data.user);
			navigate('/dashboard');
		} catch (err) {
			setError(err?.response?.data?.message || 'Invalid email or password.');
		} finally {
			setLoading(false);
		}
	};

	const handleRegister = async (e) => {
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
				setError(Object.values(err.response.data.errors)[0][0]);
			} else {
				setError(err?.response?.data?.message || 'Something went wrong.');
			}
		} finally {
			setLoading(false);
		}
	};

	return (
		<div style={{ minHeight: '100vh', position: 'relative', fontFamily: "'DM Sans', sans-serif", overflow: 'hidden' }}>
			<style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&family=Playfair+Display:ital,wght@0,700;0,800;1,700&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }

        .auth-input {
          width: 100%;
          padding: 13px 16px;
          border-radius: 12px;
          border: 1px solid rgba(20,73,63,0.14);
          background: rgba(255,255,255,0.75);
          color: #14493f;
          font-size: 14px;
          font-family: 'DM Sans', sans-serif;
          outline: none;
          transition: border 0.2s, background 0.2s;
        }
        .auth-input::placeholder { color: rgba(20,73,63,0.3); }
        .auth-input:focus {
          border-color: rgba(45,212,191,0.6);
          background: rgba(255,255,255,1);
        }

        .auth-btn {
          width: 100%;
          padding: 13px;
          border-radius: 10px;
          border: none;
          background: #14493f;
          color: white;
          font-size: 14px;
          font-weight: 600;
          font-family: 'DM Sans', sans-serif;
          cursor: pointer;
          transition: background 0.2s, transform 0.15s;
        }
        .auth-btn:hover:not(:disabled) { background: #199988; transform: translateY(-1px); }
        .auth-btn:disabled { opacity: 0.6; cursor: not-allowed; }

        .switch-btn {
          background: none;
          border: none;
          color: #199988;
          font-weight: 600;
          font-size: 14px;
          font-family: 'DM Sans', sans-serif;
          cursor: pointer;
          padding: 0;
          text-decoration: none;
        }
        .switch-btn:hover { text-decoration: underline; }

        .pass-wrap { position: relative; }
        .pass-toggle {
          position: absolute; right: 14px; top: 50%; transform: translateY(-50%);
          background: none; border: none; cursor: pointer;
          color: rgba(20,73,63,0.35); font-size: 13px; padding: 0;
          font-family: 'DM Sans', sans-serif; transition: color 0.2s;
        }
        .pass-toggle:hover { color: rgba(20,73,63,0.7); }

        @keyframes slideOutLeft {
          from { opacity: 1; transform: translateX(0); }
          to { opacity: 0; transform: translateX(-48px); }
        }
        @keyframes slideOutRight {
          from { opacity: 1; transform: translateX(0); }
          to { opacity: 0; transform: translateX(48px); }
        }
        @keyframes slideInLeft {
          from { opacity: 0; transform: translateX(48px); }
          to { opacity: 1; transform: translateX(0); }
        }
        @keyframes slideInRight {
          from { opacity: 0; transform: translateX(-48px); }
          to { opacity: 1; transform: translateX(0); }
        }

        .slide-out-left  { animation: slideOutLeft  0.4s ease forwards; }
        .slide-out-right { animation: slideOutRight 0.4s ease forwards; }
        .slide-in-left   { animation: slideInLeft   0.4s ease forwards; }
        .slide-in-right  { animation: slideInRight  0.4s ease forwards; }

        .tab-pill {
          display: flex;
          background: rgba(20,73,63,0.06);
          border-radius: 100px;
          padding: 4px;
          margin-bottom: 32px;
          border: 1px solid rgba(20,73,63,0.08);
        }
        .tab-btn {
          flex: 1; padding: 10px; border: none; border-radius: 100px;
          font-size: 14px; font-weight: 600; cursor: pointer;
          font-family: 'DM Sans', sans-serif;
          transition: all 0.3s ease;
        }
        .tab-active { background: #14493f; color: white; }
        .tab-inactive { background: transparent; color: rgba(20,73,63,0.4); }
        .tab-inactive:hover { color: rgba(20,73,63,0.7); }

        .two-col { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }

        .video-bg {
          position: fixed; inset: 0;
          width: 100%; height: 100%;
          object-fit: cover;
          z-index: 0;
        }
        .video-dim {
          position: fixed; inset: 0;
          background: rgba(10,30,26,0.28);
          z-index: 1;
        }

        .auth-card {
          position: relative;
          z-index: 2;
          width: 100%;
          max-width: 420px;
          padding: 44px 40px;
          border-radius: 24px;
          background: rgba(214, 238, 226, 0.72);
          border: 1px solid rgba(255,255,255,0.5);
          backdrop-filter: blur(18px);
          box-shadow: 0 24px 60px rgba(10,30,26,0.25);
        }

        @media (max-width: 480px) {
          .auth-card { padding: 32px 24px; max-width: 92vw; }
          .two-col { grid-template-columns: 1fr; }
        }
      `}</style>

			{/* Fullscreen video background */}
			<video className="video-bg" autoPlay loop muted playsInline>
				<source src="/loginvideo.mp4" type="video/mp4" />
			</video>
			<div className="video" />

			{/* Centered floating card */}
			<div style={{ position: 'relative', zIndex: 2, minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
				<div className="auth-card">

					{/* Logo */}
					<div style={{ display: 'flex', alignItems: 'center', gap: 10, justifyContent: 'center', marginBottom: 28 }}>
						<div className="flex items-center gap-2.5 mr-4">
							<img src="/public/moneyiologo.png" width="80px" />
						</div>
					</div>

					{/* Tab switcher */}
					<div className="tab-pill">
						<button
							className={`tab-btn ${mode === 'login' ? 'tab-active' : 'tab-inactive'}`}
							onClick={() => switchMode('login')}
						>
							{t('auth.signIn')}
						</button>
						<button
							className={`tab-btn ${mode === 'register' ? 'tab-active' : 'tab-inactive'}`}
							onClick={() => switchMode('register')}
						>
							{t('auth.createAccount')}
						</button>
					</div>

					{/* Form area — slides */}
					<div style={{ overflow: 'hidden' }}>
						<div
							key={mode + '-form'}
							className={sliding
								? (slideDir === 'left' ? 'slide-out-left' : 'slide-out-right')
								: (slideDir === 'left' ? 'slide-in-left' : 'slide-in-right')
							}
						>
							{error && (
								<div style={{ padding: '12px 16px', borderRadius: 10, marginBottom: 20, fontSize: 13, fontWeight: 500, background: 'rgba(209,107,107,0.12)', color: '#c25a5a', border: '1px solid rgba(209,107,107,0.25)' }}>
									{error}
								</div>
							)}

							{mode === 'login' ? (
								<form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
									<div>
										<label style={{ fontSize: 11, fontWeight: 600, color: 'rgba(20,73,63,0.6)', display: 'block', marginBottom: 8, letterSpacing: '0.08em', textTransform: 'uppercase' }}>{t('auth.email')}</label>
										<input type="email" value={email} onChange={e => setEmail(e.target.value)} className="auth-input" placeholder="you@email.com" required />
									</div>
									<div>
										<label style={{ fontSize: 11, fontWeight: 600, color: 'rgba(20,73,63,0.6)', display: 'block', marginBottom: 8, letterSpacing: '0.08em', textTransform: 'uppercase' }}>{t('auth.password')}</label>
										<div className="pass-wrap">
											<input type={showPass ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} className="auth-input" placeholder="••••••••" required style={{ paddingRight: 56 }} />
											<button type="button" className="pass-toggle" onClick={() => setShowPass(p => !p)}>{showPass ? t('auth.hide') : t('auth.show')}</button>
										</div>
									</div>
									<button type="submit" disabled={loading} className="auth-btn" style={{ marginTop: 6 }}>
										{loading ? t('auth.signingIn') : t('auth.signInBtn')}
									</button>
									<p style={{ textAlign: 'center', fontSize: 14, color: 'rgba(20,73,63,0.5)', marginTop: 4 }}>
										{t('auth.noAccount')}{' '}
										<button type="button" className="switch-btn" onClick={() => switchMode('register')}>{t('auth.createOne')}</button>
									</p>
								</form>
							) : (
								<form onSubmit={handleRegister} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
									<div>
										<label style={{ fontSize: 11, fontWeight: 600, color: 'rgba(20,73,63,0.6)', display: 'block', marginBottom: 8, letterSpacing: '0.08em', textTransform: 'uppercase' }}>{t('auth.fullName')}</label>
										<input type="text" value={name} onChange={e => setName(e.target.value)} className="auth-input" placeholder="Your name" required />
									</div>
									<div>
										<label style={{ fontSize: 11, fontWeight: 600, color: 'rgba(20,73,63,0.6)', display: 'block', marginBottom: 8, letterSpacing: '0.08em', textTransform: 'uppercase' }}>{t('auth.email')}</label>
										<input type="email" value={email} onChange={e => setEmail(e.target.value)} className="auth-input" placeholder="you@email.com" required />
									</div>
									<div className="two-col">
										<div>
											<label style={{ fontSize: 11, fontWeight: 600, color: 'rgba(20,73,63,0.6)', display: 'block', marginBottom: 8, letterSpacing: '0.08em', textTransform: 'uppercase' }}>{t('auth.password')}</label>
											<div className="pass-wrap">
												<input type={showPass ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} className="auth-input" placeholder="••••••••" required style={{ paddingRight: 56 }} />
												<button type="button" className="pass-toggle" onClick={() => setShowPass(p => !p)}>{showPass ? t('auth.hide') : t('auth.show')}</button>
											</div>
										</div>
										<div>
											<label style={{ fontSize: 11, fontWeight: 600, color: 'rgba(20,73,63,0.6)', display: 'block', marginBottom: 8, letterSpacing: '0.08em', textTransform: 'uppercase' }}>{t('auth.confirm')}</label>
											<input type={showPass ? 'text' : 'password'} value={passwordConfirmation} onChange={e => setPasswordConfirmation(e.target.value)} className="auth-input" placeholder="••••••••" required />
										</div>
									</div>
									<button type="submit" disabled={loading} className="auth-btn" style={{ marginTop: 4 }}>
										{loading ? t('auth.creatingAccount') : t('auth.createAccountBtn')}
									</button>
									<p style={{ textAlign: 'center', fontSize: 14, color: 'rgba(20,73,63,0.5)', marginTop: 4 }}>
										{t('auth.alreadyHave')}{' '}
										<button type="button" className="switch-btn" onClick={() => switchMode('login')}>{t('auth.signIn')}</button>
									</p>
								</form>
							)}
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};

export default Auth;