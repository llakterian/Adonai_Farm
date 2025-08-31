import React from 'react';

/**
 * ErrorBoundary - React error boundary component for graceful error handling
 * Catches JavaScript errors anywhere in the child component tree and displays fallback UI
 */
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: null
    };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI
    return {
      hasError: true,
      errorId: Date.now().toString(36) + Math.random().toString(36).substr(2)
    };
  }

  componentDidMount() {
    // Reset error boundary on route change
    this.unlisten = () => { };
    try {
      // React Router v6: listen via popstate and pushState hook
      const reset = () => {
        if (this.state.hasError) {
          this.setState({ hasError: false, error: null, errorInfo: null, errorId: null });
        }
      };
      window.addEventListener('popstate', reset);
      // Monkey patch pushState/replaceState to detect SPA navigations
      const wrap = (type) => {
        const orig = history[type];
        return function () {
          const ret = orig.apply(this, arguments);
          window.dispatchEvent(new Event('spa:navigation'));
          return ret;
        };
      };
      history.pushState = wrap('pushState');
      history.replaceState = wrap('replaceState');
      window.addEventListener('spa:navigation', reset);
      this.unlisten = () => {
        window.removeEventListener('popstate', reset);
        window.removeEventListener('spa:navigation', reset);
      };
    } catch { }
  }

  componentWillUnmount() {
    if (this.unlisten) this.unlisten();
  }

  componentDidCatch(error, errorInfo) {
    // Log error details for debugging
    console.error('ErrorBoundary caught an error:', error, errorInfo);

    this.setState({
      error: error,
      errorInfo: errorInfo
    });

    // Log to external service in production
    if (process.env.NODE_ENV === 'production') {
      this.logErrorToService(error, errorInfo);
    }
  }

  logErrorToService = (error, errorInfo) => {
    // In a real app, you would send this to an error reporting service
    const errorData = {
      message: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href,
      errorId: this.state.errorId
    };

    // Example: Send to error reporting service
    try {
      fetch('/api/errors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(errorData)
      }).catch(err => console.warn('Failed to log error to service:', err));
    } catch (err) {
      console.warn('Failed to log error to service:', err);
    }
  };

  handleRetry = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: null
    });
  };

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      const { fallback: Fallback, showDetails = false } = this.props;

      // Use custom fallback component if provided
      if (Fallback) {
        return (
          <Fallback
            error={this.state.error}
            errorInfo={this.state.errorInfo}
            onRetry={this.handleRetry}
            onReload={this.handleReload}
          />
        );
      }

      // Default fallback UI
      return (
        <div className="error-boundary">
          <div className="error-boundary-content">
            <div className="error-icon">⚠️</div>
            <h2>Something went wrong</h2>
            <p>We're sorry, but something unexpected happened. Please try again.</p>

            <div className="error-actions">
              <button
                onClick={this.handleRetry}
                className="btn btn-primary"
              >
                Try Again
              </button>
              <button
                onClick={this.handleReload}
                className="btn btn-outline"
              >
                Reload Page
              </button>
            </div>

            {showDetails && this.state.error && (
              <details className="error-details">
                <summary>Technical Details</summary>
                <div className="error-info">
                  <p><strong>Error ID:</strong> {this.state.errorId}</p>
                  <p><strong>Error:</strong> {this.state.error.message}</p>
                  {this.state.errorInfo && (
                    <pre className="error-stack">
                      {this.state.errorInfo.componentStack}
                    </pre>
                  )}
                </div>
              </details>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

/**
 * PublicErrorBoundary - Specialized error boundary for public website components
 */
export const PublicErrorBoundary = ({ children, componentName = 'Component' }) => {
  const PublicFallback = ({ error, onRetry, onReload }) => (
    <div className="public-error-boundary">
      <div className="public-error-content">
        <div className="error-icon">🌾</div>
        <h3>Oops! Something went wrong</h3>
        <p>
          We're having trouble loading this part of our farm website.
          Don't worry - you can still browse other sections!
        </p>

        <div className="error-actions">
          <button onClick={onRetry} className="btn btn-primary">
            Try Again
          </button>
          <a href="/" className="btn btn-outline">
            Go to Homepage
          </a>
        </div>

        <p className="error-help">
          If this problem persists, please <a href="/contact">contact us</a> and
          we'll get it fixed right away.
        </p>
      </div>
    </div>
  );

  return (
    <ErrorBoundary fallback={PublicFallback}>
      {children}
    </ErrorBoundary>
  );
};

/**
 * GalleryErrorBoundary - Specialized error boundary for gallery components
 */
export const GalleryErrorBoundary = ({ children }) => {
  const GalleryFallback = ({ error, onRetry }) => (
    <div className="gallery-error-boundary">
      <div className="gallery-error-content">
        <div className="error-icon">📷</div>
        <h3>Gallery Temporarily Unavailable</h3>
        <p>
          We're having trouble loading our photo gallery right now.
          Please try again in a moment.
        </p>

        <div className="error-actions">
          <button onClick={onRetry} className="btn btn-primary">
            Reload Gallery
          </button>
        </div>

        <div className="gallery-fallback-content">
          <p>In the meantime, here's what you can expect to see at Adonai Farm:</p>
          <ul>
            <li>🐄 Our healthy livestock including cattle, goats, and sheep</li>
            <li>🚜 Modern farming operations and facilities</li>
            <li>🌾 Sustainable farming practices in action</li>
            <li>📍 Beautiful views of our farm in Chepsir, Kericho</li>
          </ul>
        </div>
      </div>
    </div>
  );

  return (
    <ErrorBoundary fallback={GalleryFallback}>
      {children}
    </ErrorBoundary>
  );
};

/**
 * ContactFormErrorBoundary - Specialized error boundary for contact forms
 */
export const ContactFormErrorBoundary = ({ children }) => {
  const ContactFallback = ({ error, onRetry }) => (
    <div className="contact-form-error-boundary">
      <div className="contact-error-content">
        <div className="error-icon">📧</div>
        <h3>Contact Form Unavailable</h3>
        <p>
          Our contact form is temporarily unavailable, but you can still reach us directly!
        </p>

        <div className="contact-alternatives">
          <div className="contact-method">
            <strong>📞 Phone:</strong>
            <a href="tel:+254722759217">+254 722 759 217</a>
          </div>
          <div className="contact-method">
            <strong>📧 Email:</strong>
            <a href="mailto:info@adonaifarm.co.ke">info@adonaifarm.co.ke</a>
          </div>
          <div className="contact-method">
            <strong>📍 Visit Us:</strong>
            Chepsir, Kericho, Kenya
          </div>
        </div>

        <div className="error-actions">
          <button onClick={onRetry} className="btn btn-primary">
            Try Contact Form Again
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <ErrorBoundary fallback={ContactFallback}>
      {children}
    </ErrorBoundary>
  );
};

export default ErrorBoundary;