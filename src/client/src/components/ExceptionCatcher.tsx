import notifications from '@lib/notifications/hooks';
import React, { ErrorInfo } from 'react';

class ErrorBoundary extends React.Component<
  React.PropsWithChildren<{ fallback?: React.ReactNode }>
> {
  constructor(props: { fallback?: React.ReactNode }) {
    super(props);
  }

  componentDidCatch?(error: Error, errorInfo: ErrorInfo) {
    // Example "componentStack":
    //   in ComponentThatThrows (created by App)
    //   in ErrorBoundary (created by App)
    //   in div (created by App)
    //   in App
    notifications.error('Runtime Error', error.message);
    console.error(error, errorInfo);
  }

  render() {
    return this.props.children;
  }
}

export default ErrorBoundary;