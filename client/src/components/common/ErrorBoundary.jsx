import React from 'react';

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-6 my-4 rounded-xl border border-rose-200 bg-rose-50 text-rose-800 shadow-xs">
          <h3 className="text-base font-semibold text-rose-900">Something went wrong</h3>
          <p className="mt-1 text-xs opacity-90">{this.state.error?.message || 'Unexpected application error.'}</p>
          <button
            onClick={() => this.setState({ hasError: false, error: null })}
            className="mt-3 text-xs underline font-medium hover:text-rose-950 cursor-pointer"
          >
            Try again
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
