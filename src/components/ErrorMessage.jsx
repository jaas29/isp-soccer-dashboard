import { AlertTriangle, RefreshCw, XCircle } from 'lucide-react';

export default function ErrorMessage({ 
  title = 'Error', 
  message = 'Something went wrong',
  onRetry,
  className = ''
}) {
  return (
    <div className={`bg-red-500/10 border border-red-500/30 rounded-xl p-6 ${className}`}>
      <div className="flex items-start gap-4">
        <div className="p-2 bg-red-500/20 rounded-lg">
          <AlertTriangle className="w-6 h-6 text-red-400" />
        </div>
        <div className="flex-1">
          <h4 className="font-semibold text-red-400">{title}</h4>
          <p className="text-sm text-gray-400 mt-1">{message}</p>
          
          {onRetry && (
            <button
              onClick={onRetry}
              className="mt-4 flex items-center gap-2 px-4 py-2 bg-dark-600 text-gray-200 
                         rounded-lg hover:bg-dark-500 transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              Try Again
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export function InlineError({ message }) {
  return (
    <div className="flex items-center gap-2 text-red-400 text-sm">
      <XCircle className="w-4 h-4" />
      <span>{message}</span>
    </div>
  );
}

export function NoDataMessage({ 
  title = 'No Data Available',
  message = 'There is no data to display at this time.',
  icon: Icon = AlertTriangle
}) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <div className="p-4 bg-dark-600 rounded-xl mb-4">
        <Icon className="w-8 h-8 text-gray-500" />
      </div>
      <h4 className="text-lg font-medium text-gray-300">{title}</h4>
      <p className="text-sm text-gray-500 mt-1 max-w-sm">{message}</p>
    </div>
  );
}
