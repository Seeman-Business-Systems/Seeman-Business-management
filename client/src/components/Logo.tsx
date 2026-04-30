import { Link } from "react-router-dom";

interface LogoProps {
  variant?: 'full' | 'icon';
  className?: string;
}

function Logo({ variant = 'full', className = '' }: LogoProps) {
  if (variant === 'icon') {
    return (
      <Link to="/">
        <img
          src="/logo.png"
          alt="Seeman"
          className={`h-10 w-10 ${className}`}
        />
      </Link>
    );
  }

  return (
    <Link to="/">
      <img
        src="/full-logo.png"
        alt="Seeman"
        className={`h-11 w-40 ${className}`}
      />
    </Link>
  );
}

export default Logo;
