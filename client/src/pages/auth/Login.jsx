import { HardHat, Lock, Mail } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api, apiErrorMessage, hasSession, saveSession } from '../../services/api.js';

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('admin@scpras.rw');
  const [password, setPassword] = useState('admin123');
  const [status, setStatus] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (hasSession()) navigate('/dashboard');
  }, [navigate]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsSubmitting(true);
    setStatus('');

    try {
      const { data } = await api.post('/auth/login', { email, password });
      saveSession(data);
      navigate('/dashboard');
    } catch (error) {
      setStatus(apiErrorMessage(error));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="grid min-h-screen bg-ink text-white lg:grid-cols-[1.1fr_0.9fr]">
      <section className="flex flex-col justify-between bg-[radial-gradient(circle_at_top_left,_rgba(247,183,49,0.25),_transparent_35%),linear-gradient(135deg,_#07111f,_#102235)] p-8 lg:p-12">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-gold text-ink">
            <HardHat size={26} />
          </div>
          <div>
            <h1 className="text-3xl font-extrabold tracking-wide">SCP<span className="text-gold">RAS</span></h1>
            <p className="mt-1 text-xs font-semibold text-slate-300">Smart Construction Progress and Resource Analysis System</p>
            <p className="text-sm font-semibold text-slate-300">Smart Construction Intelligence</p>
          </div>
        </div>
        <div className="max-w-2xl py-16">
          <p className="text-sm font-bold uppercase text-gold">Rwanda and Africa construction ERP</p>
          <h2 className="mt-4 text-4xl font-extrabold leading-tight sm:text-5xl">Progress, workforce, attendance and resources in one platform.</h2>
          <p className="mt-5 text-lg leading-8 text-slate-300">
            Reduce losses, improve accountability, track every site, and generate intelligent construction reports.
          </p>
        </div>
        <p className="text-sm text-slate-400">MVP Phase 1 — Ready for operations.</p>
      </section>
      <section className="flex items-center justify-center bg-concrete p-6 text-ink">
        <form className="w-full max-w-md rounded-lg bg-white p-6 shadow-panel" onSubmit={handleSubmit}>
          <h2 className="text-2xl font-extrabold">Sign in</h2>
          <p className="mt-2 text-sm text-slate-600">Access the Smart Construction Progress and Resource Analysis System.</p>
          <label className="mt-6 block text-sm font-semibold text-slate-700">Email</label>
          <div className="mt-2 flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2.5">
            <Mail size={18} className="text-slate-400" />
            <input className="w-full outline-none" placeholder="admin@scpras.rw" value={email} onChange={(event) => setEmail(event.target.value)} />
          </div>
          <label className="mt-4 block text-sm font-semibold text-slate-700">Password</label>
          <div className="mt-2 flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2.5">
            <Lock size={18} className="text-slate-400" />
            <input className="w-full outline-none" type="password" placeholder="Password" value={password} onChange={(event) => setPassword(event.target.value)} />
          </div>
          {status ? <p className="mt-4 rounded-lg bg-red-50 px-3 py-2 text-sm font-semibold text-red-700">{status}</p> : null}
          <button className="primary-button mt-6 w-full" disabled={isSubmitting} type="submit">
            {isSubmitting ? 'Signing in...' : 'Login'}
          </button>
        </form>
      </section>
    </main>
  );
}
