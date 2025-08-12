import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import PageWrapper from './PageWrapper';

const Signup = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');

  const handleSignup = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:8000/auth/signup', { email, password, name });
      navigate('/login');
    } catch {
      setError('Signup failed. Try again.');
    }
  };

  return (
    <PageWrapper>
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          <form
            onSubmit={handleSignup}
            className="bg-gray-900/60 backdrop-blur border border-white/10 rounded-2xl shadow-2xl shadow-black/40 p-8 sm:p-10"
          >
            <div className="mb-8 text-center">
              <h1 className="text-2xl sm:text-3xl font-semibold text-white tracking-tight">Create your account</h1>
              <p className="mt-2 text-sm text-gray-400">It only takes a minute</p>
            </div>

            {error && (
              <p className="mb-4 text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
                {error}
              </p>
            )}

            <div className="space-y-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-1">
                  Name
                </label>
                <input
                  id="name"
                  type="text"
                  placeholder="Your name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="w-full rounded-lg bg-gray-800 text-white placeholder-gray-400 border border-white/10 focus:outline-none focus:ring-2 focus:ring-blue-500/60 focus:border-blue-500/60 transition-colors px-4 py-3"
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-1">
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full rounded-lg bg-gray-800 text-white placeholder-gray-400 border border-white/10 focus:outline-none focus:ring-2 focus:ring-blue-500/60 focus:border-blue-500/60 transition-colors px-4 py-3"
                />
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-1">
                  Password
                </label>
                <input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full rounded-lg bg-gray-800 text-white placeholder-gray-400 border border-white/10 focus:outline-none focus:ring-2 focus:ring-blue-500/60 focus:border-blue-500/60 transition-colors px-4 py-3"
                />
              </div>
            </div>

            <button
              type="submit"
              className="mt-6 w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white font-medium py-3 rounded-lg shadow-lg shadow-blue-500/20 hover:brightness-110 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-purple-600 transition-all duration-200"
            >
              Sign Up
            </button>

            <p className="mt-6 text-sm text-center text-gray-400">
              Already have an account?{' '}
              <a href="/login" className="text-blue-400 hover:text-blue-300 underline-offset-4 hover:underline transition-colors">
                Login
              </a>
            </p>
          </form>
        </div>
      </div>
    </PageWrapper>
  );
};

export default Signup;