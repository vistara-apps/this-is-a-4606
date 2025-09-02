import React, { Component } from 'react';
import { AlertTriangle } from 'lucide-react';
import Button from './Button';

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    // Log the error to an error reporting service
    console.error('Error caught by ErrorBoundary:', error, errorInfo);
    this.setState({ errorInfo });
    
    // You can also log the error to a reporting service like Sentry
    // logErrorToService(error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
    
    // If a reset handler was provided, call it
    if (this.props.onReset) {
      this.props.onReset();
    }
  };

  render() {
    if (this.state.hasError) {
      // Render fallback UI
      return (
        <div className="flex flex-col items-center justify-center p-8 bg-dark-card/50 backdrop-blur-sm rounded-xl border border-dark-border text-center">
          <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mb-4">
            <AlertTriangle size={32} className="text-red-500" />
          </div>
          <h2 className="text-xl font-semibold text-white mb-2">Something went wrong</h2>
          <p className="text-gray-400 mb-6 max-w-md">
            {this.props.fallbackMessage || 
              "We're sorry, but an error occurred while rendering this component."}
          </p>
          
          {this.props.showDetails && this.state.error && (
            <div className="mb-6 w-full max-w-md">
              <div className="bg-dark-surface p-4 rounded-lg text-left mb-2 overflow-auto max-h-32">
                <p className="text-red-400 text-sm font-mono">
                  {this.state.error.toString()}
                </p>
              </div>
              {this.state.errorInfo && (
                <details className="text-left">
                  <summary className="text-gray-400 text-sm cursor-pointer mb-2">
                    Stack trace
                  </summary>
                  <div className="bg-dark-surface p-4 rounded-lg overflow-auto max-h-64">
                    <pre className="text-gray-400 text-xs font-mono">
                      {this.state.errorInfo.componentStack}
                    </pre>
                  </div>
                </details>
              )}
            </div>
          )}
          
          <div className="flex space-x-4">
            <Button
              variant="secondary"
              onClick={() => window.location.reload()}
            >
              Reload Page
            </Button>
            <Button
              variant="primary"
              onClick={this.handleReset}
            >
              Try Again
            </Button>
          </div>
        </div>
      );
    }

    // If there's no error, render children normally
    return this.props.children;
  }
}

export default ErrorBoundary;

