import { useAuth } from '../context/AuthContext';

function ImpersonationBanner() {
  const { user, isImpersonating, exitImpersonation } = useAuth();

  if (!isImpersonating || !user) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-[9999] bg-amber-500 text-white px-4 py-2 flex items-center justify-between text-sm font-medium shadow-md">
      <div className="flex items-center gap-2">
        <i className="fa-solid fa-user-secret" />
        <span>
          Viewing as <strong>{user.firstName} {user.lastName}</strong>
        </span>
      </div>
      <button
        onClick={exitImpersonation}
        className="flex items-center gap-1.5 px-3 py-1 bg-white text-amber-600 rounded-lg text-xs font-semibold hover:bg-amber-50 transition-colors"
      >
        <i className="fa-solid fa-arrow-right-from-bracket" />
        Exit
      </button>
    </div>
  );
}

export default ImpersonationBanner;
