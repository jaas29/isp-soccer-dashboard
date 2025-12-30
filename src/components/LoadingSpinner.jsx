export default function LoadingSpinner({ size = 'md', className = '' }) {
  const sizes = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16'
  };

  return (
    <div className={`flex items-center justify-center ${className}`}>
      <div className={`
        ${sizes[size]}
        border-2 border-dark-500 border-t-accent-green
        rounded-full animate-spin
      `} />
    </div>
  );
}

export function LoadingOverlay({ message = 'Loading...' }) {
  return (
    <div className="fixed inset-0 bg-dark-900/80 backdrop-blur-sm z-50 flex items-center justify-center">
      <div className="bg-dark-700 border border-dark-500 rounded-xl p-8 text-center">
        <LoadingSpinner size="lg" className="mb-4" />
        <p className="text-gray-400">{message}</p>
      </div>
    </div>
  );
}

export function PageLoader() {
  return (
    <div className="min-h-[400px] flex items-center justify-center">
      <div className="text-center">
        <LoadingSpinner size="xl" className="mb-4" />
        <p className="text-gray-400">Loading data...</p>
      </div>
    </div>
  );
}

export function CardLoader() {
  return (
    <div className="bg-dark-700 border border-dark-500 rounded-xl p-6 animate-pulse">
      <div className="h-4 w-24 bg-dark-500 rounded mb-4" />
      <div className="h-8 w-16 bg-dark-500 rounded mb-2" />
      <div className="h-3 w-20 bg-dark-500 rounded" />
    </div>
  );
}
