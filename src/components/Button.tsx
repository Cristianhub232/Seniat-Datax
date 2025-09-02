'use client';

interface Props {
  children: React.ReactNode;
  onClick: () => void;
  className?: string;
}

const Button = ({ children, onClick, className }: Props) => {
  return (
    <button onClick={onClick} className={`px-4 py-2 ${className || 'inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500'}`}>
      {children}
    </button>
  );
};

export default Button;
