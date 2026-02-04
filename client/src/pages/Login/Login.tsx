import { useState, type SubmitEvent } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { type AxiosError } from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons';
import { useAuth } from '../../context/AuthContext';
import { type ApiError } from '../../types/auth';
import usePageTitle from '../../hooks/usePageTitle';
import Logo from '../../components/Logo';

function Login() {
  usePageTitle('Login');
  const { login, isAuthenticated, isLoading } = useAuth();
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Redirect if already logged in
  if (isLoading) {
    return null; // Or a loading spinner
  }

  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  const handleSubmit = async (e: SubmitEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      await login(identifier, password);
    } catch (err) {
      console.error('Login error:', err);
      const axiosError = err as AxiosError<ApiError>;
      setError(axiosError.response?.data?.message || 'Login failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center px-4 relative">
      <div className="absolute top-6 left-1/2 -translate-x-1/2 md:left-10 md:translate-x-0">
        <Logo />
      </div>
      <div className="p-8 rounded-lg w-full max-w-md">
        <div className="text-center mb-3">
          <h1 className="text-3xl font-bold text-gray-900 font-roboto mb-2">
            Welcome back!
          </h1>
          <p className="text-gray-500 mb-8">
            Enter your credentials to access your account
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="bg-red-50 text-red-600 p-3 rounded-md text-sm">
              {error}
            </div>
          )}

          <div>
            <label
              htmlFor="identifier"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Email or Phone
            </label>
            <input
              id="identifier"
              type="text"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              required
              className="bg-white w-full px-3 py-2 rounded-lg outline-none ring-0 ring-indigo-400 transition-all duration-300 ease-in-out focus:ring-2 focus:shadow-md focus:shadow-indigo-100"
              placeholder="Enter email or phone number"
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Password
            </label>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="bg-white w-full px-3 py-2 pr-10 rounded-lg outline-none ring-0 ring-indigo-400 transition-all duration-300 ease-in-out focus:ring-2 focus:shadow-md focus:shadow-indigo-100"
                placeholder="Enter password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 cursor-pointer"
              >
                <FontAwesomeIcon icon={showPassword ? faEyeSlash : faEye} />
              </button>
            </div>
          </div>

          <div>
            <Link to="/forgot-password" className="text-sm text-indigo-600 hover:underline">
              Forgot your password?
            </Link>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="bg-indigo-600 w-full text-white py-2 px-4 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-20 disabled:cursor-not-allowed cursor-pointer"
          >
            {isSubmitting ? 'Logging in…' : 'Log in'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default Login;
