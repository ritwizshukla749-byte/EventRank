import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../../components/common/Button';
import { collegesApi } from '../../api/featuresApi';
import { Sparkles } from 'lucide-react';
import { getSafeRedirectPath } from '../../utils/redirectHelpers';

export function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Get redirect path from query params
  const redirectTo = getSafeRedirectPath(searchParams, '/discover');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      await login({ email, password }, redirectTo);
      // Navigation handled by AuthContext
    } catch (err) {
      setError(err.message || 'Login failed. Please check credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto my-12 p-8 rounded-3xl border border-slate-200 bg-white shadow-xl">
      <div className="text-center mb-6">
        <div className="inline-flex p-2.5 rounded-xl bg-indigo-50 text-indigo-600 mb-3">
          <Sparkles className="w-6 h-6" />
        </div>
        <h1 className="text-xl font-bold text-slate-900">Sign In to EventRank</h1>
        <p className="text-xs text-slate-500 mt-1">
          Access personalized Fit scores, event registration & verified reviews.
        </p>
        {redirectTo !== '/discover' && (
          <p className="text-xs text-indigo-600 mt-2">
            You'll be redirected after signing in.
          </p>
        )}
      </div>

      {error && (
        <div className="p-3 mb-4 rounded-xl border border-rose-200 bg-rose-50 text-rose-700 text-xs">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4 text-xs">
        <div>
          <label className="block text-slate-700 font-medium mb-1">Campus Email</label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="student@college.edu"
            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:bg-white transition-colors"
          />
        </div>

        <div>
          <label className="block text-slate-700 font-medium mb-1">Password</label>
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:bg-white transition-colors"
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

      <div className="mt-6 text-center text-xs text-slate-500">
        Don't have an account?{' '}
        <Link to={`/register${searchParams.get('redirect') ? `?redirect=${searchParams.get('redirect')}` : ''}`} className="text-indigo-600 hover:text-indigo-700 font-medium">
          Create account
        </Link>
      </div>
    </div>
  );
}

export function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [collegeId, setCollegeId] = useState('');
  const [colleges, setColleges] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Get redirect path from query params
  const redirectTo = getSafeRedirectPath(searchParams, '/profile');

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
      await register({ name, email, password, collegeId }, redirectTo);
      // Navigation handled by AuthContext
    } catch (err) {
      setError(err.message || 'Registration failed.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto my-12 p-8 rounded-3xl border border-slate-200 bg-white shadow-xl">
      <div className="text-center mb-6">
        <div className="inline-flex p-2.5 rounded-xl bg-indigo-50 text-indigo-600 mb-3">
          <Sparkles className="w-6 h-6" />
        </div>
        <h1 className="text-xl font-bold text-slate-900">Join EventRank</h1>
        <p className="text-xs text-slate-500 mt-1">
          Select your college to discover cross-campus events and peer signals.
        </p>
        {redirectTo !== '/profile' && (
          <p className="text-xs text-indigo-600 mt-2">
            You'll be redirected after registration.
          </p>
        )}
      </div>

      {error && (
        <div className="p-3 mb-4 rounded-xl border border-rose-200 bg-rose-50 text-rose-700 text-xs">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4 text-xs">
        <div>
          <label className="block text-slate-700 font-medium mb-1">Full Name</label>
          <input
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Alex Smith"
            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:bg-white transition-colors"
          />
        </div>

        <div>
          <label className="block text-slate-700 font-medium mb-1">College Association</label>
          <select
            required
            value={collegeId}
            onChange={(e) => setCollegeId(e.target.value)}
            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:border-indigo-500 focus:bg-white transition-colors"
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
          <label className="block text-slate-700 font-medium mb-1">Campus Email</label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="alex@college.edu"
            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:bg-white transition-colors"
          />
        </div>

        <div>
          <label className="block text-slate-700 font-medium mb-1">Password</label>
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Minimum 8 characters"
            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:bg-white transition-colors"
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

      <div className="mt-6 text-center text-xs text-slate-500">
        Already registered?{' '}
        <Link to={`/login${searchParams.get('redirect') ? `?redirect=${searchParams.get('redirect')}` : ''}`} className="text-indigo-600 hover:text-indigo-700 font-medium">
          Sign In
        </Link>
      </div>
    </div>
  );
}
