import ErrorPage from '@apps/Error/views';
import { IS_PROD } from '@apps/Lobby/src/constants';
import notifications from '@lib/notifications/hooks';
import React, { ErrorInfo } from 'react';

class ErrorBoundary extends React.Component<
  React.PropsWithChildren<{ fallback?: React.ReactNode }>,
  { hasError: boolean; stackTrace?: string }
> {
  constructor(props: { fallback?: React.ReactNode }) {
    super(props);
  }

  componentDidCatch?(error: Error, errorInfo: ErrorInfo) {
    if (IS_PROD) return;
    notifications.error('Runtime Error', error.message);
    console.error(error, errorInfo);
  }
  static getDerivedStateFromError(error: Error) {
    return { hasError: true, stackTrace: error.stack };
  }

  render() {
    if (this.state?.hasError) {
      return this.props.fallback ?? <ErrorPage stack={this.state.stackTrace} />;
    }
    return this.props.children;
  }
}

export default ErrorBoundary;
