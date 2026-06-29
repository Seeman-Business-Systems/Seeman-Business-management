import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { type AxiosError } from 'axios';
import Logo from '../../components/Logo';
import { useAuth } from '../../context/AuthContext';
import usePageTitle from '../../hooks/usePageTitle';
import { type ApiError } from '../../types/auth';

function Demo() {
  usePageTitle('Demo');
  const { loginDemo } = useAuth();
  const hasStarted = useRef(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (hasStarted.current) return;
    hasStarted.current = true;

    (async () => {
      try {
        await loginDemo();
      } catch (err) {
        const axiosError = err as AxiosError<ApiError>;
        setError(
          axiosError.response?.data?.message ||
            'Demo access is unavailable right now. Please try again shortly.',
        );
      }
    })();
  }, [loginDemo]);

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center px-4 relative">
      <div className="absolute top-6 left-1/2 -translate-x-1/2 md:left-10 md:translate-x-0">
        <Logo />
      </div>

      <div className="w-full max-w-md text-center">
        <div className="mx-auto mb-6 h-12 w-12 rounded-full border-4 border-indigo-100 border-t-indigo-600 animate-spin" />
        <h1 className="text-2xl font-bold text-gray-900">
          Opening the live demo
        </h1>
        <p className="mt-2 text-gray-500">
          Setting up full Super Admin access…
        </p>

        {error && (
          <div className="mt-6 rounded-lg bg-red-50 p-4 text-sm text-red-700">
            <p>{error}</p>
            <Link
              to="/login"
              className="mt-3 inline-flex font-medium text-red-800 hover:underline"
            >
              Go to login
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

export default Demo;
