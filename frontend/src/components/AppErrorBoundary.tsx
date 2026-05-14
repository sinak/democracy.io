import { Component, type ErrorInfo, type ReactNode } from 'react';
import { reportDiagnostic } from '../helpers/diagnostics';

type AppErrorBoundaryProps = {
  children: ReactNode;
};

type AppErrorBoundaryState = {
  hasError: boolean;
};

export class AppErrorBoundary extends Component<AppErrorBoundaryProps, AppErrorBoundaryState> {
  state: AppErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError(): AppErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    reportDiagnostic('react-render-error', {
      level: 'error',
      tags: {
        source: 'react-error-boundary',
      },
      extra: {
        componentStack: errorInfo.componentStack,
      },
      exception: error,
    });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="container text-center" role="alert">
          <h3>Something went wrong.</h3>
          <p>Please refresh the page and try again.</p>
        </div>
      );
    }

    return this.props.children;
  }
}
