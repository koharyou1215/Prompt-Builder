/**
 * Error Boundary Component
 *
 * Catches unhandled errors in the component tree and displays a fallback UI.
 * Prevents the entire application from crashing due to component errors.
 *
 * Usage:
 * ```tsx
 * <ErrorBoundary>
 *   <YourComponent />
 * </ErrorBoundary>
 * ```
 */

import React from 'react';
import styles from './ErrorBoundary.module.css';

/**
 * Error Boundary Props
 */
interface ErrorBoundaryProps {
  readonly children: React.ReactNode;
  readonly fallback?: React.ComponentType<ErrorFallbackProps>;
}

/**
 * Error Boundary State
 */
interface ErrorBoundaryState {
  readonly hasError: boolean;
  readonly error: Error | null;
  readonly errorInfo: React.ErrorInfo | null;
}

/**
 * Error Fallback Props
 */
export interface ErrorFallbackProps {
  readonly error: Error | null;
  readonly errorInfo: React.ErrorInfo | null;
  readonly resetError: () => void;
}

/**
 * Error Boundary Component
 *
 * React Error Boundary implementation following official React 18 patterns.
 * Catches errors during rendering, in lifecycle methods, and in constructors.
 *
 * Note: Error Boundaries do NOT catch errors in:
 * - Event handlers (use try-catch)
 * - Asynchronous code (use try-catch or Promise.catch)
 * - Server-side rendering
 * - Errors thrown in the error boundary itself
 */
export class ErrorBoundary extends React.Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null
    };
  }

  /**
   * Update state when error is caught
   * This lifecycle method is called after an error has been thrown by a descendant component
   */
  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return {
      hasError: true,
      error
    };
  }

  /**
   * Log error details to console
   * This lifecycle method is called after an error has been thrown
   */
  componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
    // Log error to console for debugging
    console.error('ErrorBoundary caught an error:', error);
    console.error('Component stack:', errorInfo.componentStack);

    // Update state with error info
    this.setState({
      errorInfo
    });

    // TODO: Send error to error reporting service (Sentry, etc.)
    // Example: logErrorToService(error, errorInfo);
  }

  /**
   * Reset error state and retry rendering
   */
  resetError = (): void => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null
    });
  };

  render(): React.ReactNode {
    if (this.state.hasError) {
      // Use custom fallback component if provided
      const FallbackComponent = this.props.fallback || DefaultErrorFallback;

      return (
        <FallbackComponent
          error={this.state.error}
          errorInfo={this.state.errorInfo}
          resetError={this.resetError}
        />
      );
    }

    return this.props.children;
  }
}

/**
 * Default Error Fallback Component
 *
 * Displayed when an error occurs and no custom fallback is provided.
 * Shows user-friendly error message with option to reload.
 */
const DefaultErrorFallback: React.FC<ErrorFallbackProps> = ({
  error,
  errorInfo,
  resetError
}) => {
  const handleReload = (): void => {
    // Try to reset error state first
    resetError();

    // If that doesn't work, reload the page
    setTimeout(() => {
      window.location.reload();
    }, 100);
  };

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        {/* Error Icon */}
        <div className={styles.icon}>
          ⚠️
        </div>

        {/* Error Title */}
        <h1 className={styles.title}>
          エラーが発生しました
        </h1>

        {/* Error Message */}
        <p className={styles.message}>
          申し訳ございません。予期しないエラーが発生しました。
          <br />
          ページを再読み込みするか、しばらくしてから再度お試しください。
        </p>

        {/* Error Details (Development Mode) */}
        {import.meta.env.DEV && error && (
          <details className={styles.details}>
            <summary className={styles.detailsSummary}>
              エラー詳細（開発モード）
            </summary>
            <div className={styles.detailsContent}>
              <strong>Error:</strong> {error.message}
              <br />
              <br />
              <strong>Stack:</strong>
              <br />
              {error.stack}
              {errorInfo && (
                <>
                  <br />
                  <br />
                  <strong>Component Stack:</strong>
                  <br />
                  {errorInfo.componentStack}
                </>
              )}
            </div>
          </details>
        )}

        {/* Action Buttons */}
        <div className={styles.actions}>
          <button onClick={resetError} className={styles.retryButton}>
            再試行
          </button>
          <button onClick={handleReload} className={styles.reloadButton}>
            ページを再読み込み
          </button>
        </div>
      </div>
    </div>
  );
};

export default ErrorBoundary;
