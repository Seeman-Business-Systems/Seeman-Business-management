import { useState, type SubmitEvent } from 'react';
import { Link } from 'react-router-dom';
import { type AxiosError } from 'axios';
import { api } from '../../lib/api';
import { type ApiError } from '../../types/auth';
import usePageTitle from '../../hooks/usePageTitle';
import Logo from '../../components/Logo';

function ForgotPassword() {
  usePageTitle('Forgot Password');
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: SubmitEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      await api.post('/auth/forgot-password', { email });
      setSuccess(true);
    } catch (err) {
      const axiosError = err as AxiosError<ApiError>;
      setError(
        axiosError.response?.data?.message ||
          'Something went wrong. Please try again.',
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center px-4 relative">
        <div className="absolute top-6 left-1/2 -translate-x-1/2 md:left-10 md:translate-x-0">
          <Logo />
        </div>
        <div className="p-8 rounded-lg w-full max-w-md text-center">
          <div className="mb-6">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-8 h-8 text-green-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Check your email
            </h1>
            <p className="text-gray-500">
              If an account exists for <strong>{email}</strong>, we've sent a
              password reset link.
            </p>
          </div>
          <Link
            to="/login"
            className="text-indigo-600 hover:underline font-medium"
          >
            Back to login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center px-4 relative">
      <div className="absolute top-6 left-1/2 -translate-x-1/2 md:left-10 md:translate-x-0">
        <Logo />
      </div>
      <div className="p-8 rounded-lg w-full max-w-md">
        <div className="text-center mb-3">
          <h1 className="text-3xl font-bold text-gray-900 font-roboto mb-2">
            Forgot password?
          </h1>
          <p className="text-gray-500 mb-8">
            Enter your email and we'll send you a reset link
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
              htmlFor="email"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Email address
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="bg-white w-full px-3 py-2 rounded-lg outline-none ring-0 ring-indigo-400 transition-all duration-300 ease-in-out focus:ring-2 focus:shadow-md focus:shadow-indigo-100"
              placeholder="Enter your email"
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="bg-indigo-600 w-full text-white py-2 px-4 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            {isSubmitting ? 'Sending…' : 'Send reset link'}
          </button>

          <div className="text-center">
            <Link
              to="/login"
              className="text-sm text-indigo-600 hover:underline"
            >
              Back to login
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}

export default ForgotPassword;
