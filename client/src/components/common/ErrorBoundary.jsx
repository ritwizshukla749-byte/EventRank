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
        <div className="p-6 my-4 rounded-xl border border-rose-500/30 bg-rose-950/20 text-rose-200">
          <h3 className="text-base font-semibold text-rose-300">Something went wrong</h3>
          <p className="mt-1 text-xs opacity-80">{this.state.error?.message || 'Unexpected application error.'}</p>
          <button
            onClick={() => this.setState({ hasError: false, error: null })}
            className="mt-3 text-xs underline hover:text-white"
          >
            Try again
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
