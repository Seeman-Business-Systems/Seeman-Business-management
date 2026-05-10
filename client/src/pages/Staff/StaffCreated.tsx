import { Link, useSearchParams } from 'react-router-dom';
import Layout from '../../components/layout/Layout';
import usePageTitle from '../../hooks/usePageTitle';

function StaffCreated() {
  usePageTitle('Staff Created');
  const [searchParams] = useSearchParams();
  const name = searchParams.get('name') ?? 'the staff member';
  const email = searchParams.get('email');

  return (
    <Layout>
      <div className="min-h-[70vh] flex items-center justify-center px-4">
        <div className="p-8 rounded-lg w-full max-w-md text-center bg-white border border-gray-200 shadow-sm">
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
              Staff created successfully
            </h1>
            <p className="text-gray-500">
              Please inform <strong>{name}</strong> that a password reset email
              has been sent
              {email ? (
                <>
                  {' '}
                  to <strong>{email}</strong>
                </>
              ) : null}
              .
            </p>
          </div>
          <div className="flex items-center justify-center gap-3">
            <Link
              to="/staff"
              className="inline-block bg-indigo-600 text-white py-2 px-6 rounded-md hover:bg-indigo-700 transition-colors"
            >
              Back to staff
            </Link>
            <Link
              to="/staff/new"
              className="inline-block text-indigo-600 hover:underline font-medium"
            >
              Add another
            </Link>
          </div>
        </div>
      </div>
    </Layout>
  );
}

export default StaffCreated;
