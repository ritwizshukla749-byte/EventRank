import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../../components/common/Button';
import { collegesApi } from '../../api/featuresApi';
import { Sparkles } from 'lucide-react';

export function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      await login({ email, password });
      navigate('/discover');
    } catch (err) {
      setError(err.message || 'Login failed. Please check credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto my-12 p-8 rounded-3xl border border-white/10 bg-[#121826]/80 backdrop-blur-xl shadow-2xl">
      <div className="text-center mb-6">
        <div className="inline-flex p-2 rounded-xl bg-indigo-600/10 text-indigo-400 mb-3">
          <Sparkles className="w-6 h-6" />
        </div>
        <h1 className="text-xl font-bold text-white">Sign In to EventRank</h1>
        <p className="text-xs text-slate-400 mt-1">
          Access personalized Fit scores, event registration & verified reviews.
        </p>
      </div>

      {error && (
        <div className="p-3 mb-4 rounded-xl border border-rose-500/20 bg-rose-950/20 text-rose-300 text-xs">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4 text-xs">
        <div>
          <label className="block text-slate-300 font-medium mb-1">Campus Email</label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="student@college.edu"
            className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
          />
        </div>

        <div>
          <label className="block text-slate-300 font-medium mb-1">Password</label>
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
          />
        </div>

        <Button
          type="submit"
          variant="primary"
          isLoading={isLoading}
          className="w-full py-2.5 mt-2"
        >
          Sign In
        </Button>
      </form>

      <div className="mt-6 text-center text-xs text-slate-400">
        Don't have an account?{' '}
        <Link to="/register" className="text-indigo-400 hover:text-indigo-300 font-medium">
          Create account
        </Link>
      </div>
    </div>
  );
}

export function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [collegeId, setCollegeId] = useState('');
  const [colleges, setColleges] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    collegesApi.list().then((res) => setColleges(res.colleges || []));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!collegeId) {
      setError('Please select your home college.');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      await register({ name, email, password, collegeId });
      navigate('/profile');
    } catch (err) {
      setError(err.message || 'Registration failed.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto my-12 p-8 rounded-3xl border border-white/10 bg-[#121826]/80 backdrop-blur-xl shadow-2xl">
      <div className="text-center mb-6">
        <div className="inline-flex p-2 rounded-xl bg-indigo-600/10 text-indigo-400 mb-3">
          <Sparkles className="w-6 h-6" />
        </div>
        <h1 className="text-xl font-bold text-white">Join EventRank</h1>
        <p className="text-xs text-slate-400 mt-1">
          Select your college to discover cross-campus events and peer signals.
        </p>
      </div>

      {error && (
        <div className="p-3 mb-4 rounded-xl border border-rose-500/20 bg-rose-950/20 text-rose-300 text-xs">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4 text-xs">
        <div>
          <label className="block text-slate-300 font-medium mb-1">Full Name</label>
          <input
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Alex Smith"
            className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
          />
        </div>

        <div>
          <label className="block text-slate-300 font-medium mb-1">College Association</label>
          <select
            required
            value={collegeId}
            onChange={(e) => setCollegeId(e.target.value)}
            className="w-full px-3 py-2 bg-[#121826] border border-white/10 rounded-lg text-slate-100 focus:outline-none focus:border-indigo-500"
          >
            <option value="">Select your participating college...</option>
            {colleges.map((c) => (
              <option key={c._id} value={c._id}>
                {c.name} ({c.code || c.slug})
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-slate-300 font-medium mb-1">Campus Email</label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="alex@college.edu"
            className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
          />
        </div>

        <div>
          <label className="block text-slate-300 font-medium mb-1">Password</label>
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Minimum 8 characters"
            className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
          />
        </div>

        <Button
          type="submit"
          variant="primary"
          isLoading={isLoading}
          className="w-full py-2.5 mt-2"
        >
          Create Student Account
        </Button>
      </form>

      <div className="mt-6 text-center text-xs text-slate-400">
        Already registered?{' '}
        <Link to="/login" className="text-indigo-400 hover:text-indigo-300 font-medium">
          Sign In
        </Link>
      </div>
    </div>
  );
}
