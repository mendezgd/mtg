"use client";

import React from "react";
import { Button } from "./button";
import { AlertCircle } from "lucide-react";

interface Props {
  children: React.ReactNode;
  fallback?: React.ComponentType<{ error: Error; resetError: () => void }>;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Log error to console in development
    if (process.env.NODE_ENV === "development") {
      console.error("Error caught by boundary:", error, errorInfo);
    }
  }

  resetError = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        const FallbackComponent = this.props.fallback;
        return <FallbackComponent error={this.state.error!} resetError={this.resetError} />;
      }

      return (
        <div className="p-4 bg-red-900/20 border border-red-500/30 rounded-lg">
          <div className="flex items-center gap-2 mb-3">
            <AlertCircle className="w-5 h-5 text-red-400" />
            <h2 className="text-lg font-semibold text-red-400">Something went wrong</h2>
          </div>
          <p className="text-red-300 mb-4">
            An unexpected error occurred. Please try refreshing the page.
          </p>
          <div className="flex gap-2">
            <Button
              onClick={this.resetError}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              Try again
            </Button>
            <Button
              onClick={() => window.location.reload()}
              variant="outline"
              className="border-red-500/30 text-red-300 hover:border-red-500/50"
            >
              Refresh page
            </Button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
