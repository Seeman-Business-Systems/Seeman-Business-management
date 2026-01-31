interface LogoProps {
  variant?: 'full' | 'icon';
  className?: string;
}

function Logo({ variant = 'full', className = '' }: LogoProps) {
  if (variant === 'icon') {
    return (
      <img
        src="/logo.png"
        alt="Seeman"
        className={`h-10 w-10 ${className}`}
      />
    );
  }

  return (
    <img
      src="/full-logo.png"
      alt="Seeman"
      className={`h-11 w-40 ${className}`}
    />
  );
}

export default Logo;
