import { useEffect, useRef } from 'react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children?: React.ReactNode;
  leftButton?: {
    text: string;
    onClick: () => void;
    variant?: 'primary' | 'secondary' | 'danger';
  };
  rightButton?: {
    text: string;
    onClick: () => void;
    variant?: 'primary' | 'secondary' | 'danger';
  };
  size?: 'sm' | 'md' | 'lg';
}

function Modal({
  isOpen,
  onClose,
  title,
  children,
  leftButton,
  rightButton,
  size = 'md',
}: ModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);

  // Close on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  // Close on backdrop click
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
      onClose();
    }
  };

  if (!isOpen) return null;

  const sizeClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
  };

  const buttonVariantClasses = {
    primary: 'bg-indigo-600 text-white hover:bg-indigo-700',
    secondary: 'bg-gray-100 text-gray-700 hover:bg-gray-200',
    danger: 'bg-red-600 text-white hover:bg-red-700',
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
      onClick={handleBackdropClick}
    >
      <div
        ref={modalRef}
        className={`${sizeClasses[size]} w-full mx-4 bg-white rounded-xl shadow-xl`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
          >
            <i className="fa-solid fa-xmark" />
          </button>
        </div>

        {/* Content */}
        {children && <div className="px-6 py-4">{children}</div>}

        {/* Footer */}
        {(leftButton || rightButton) && (
          <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-200">
            {leftButton && (
              <button
                onClick={leftButton.onClick}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
                  buttonVariantClasses[leftButton.variant || 'secondary']
                }`}
              >
                {leftButton.text}
              </button>
            )}
            {rightButton && (
              <button
                onClick={rightButton.onClick}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
                  buttonVariantClasses[rightButton.variant || 'primary']
                }`}
              >
                {rightButton.text}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default Modal;