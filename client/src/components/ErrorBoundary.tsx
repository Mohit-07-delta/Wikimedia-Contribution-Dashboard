import { Component, ErrorInfo, ReactNode } from "react";
import { Link } from "react-router-dom";

interface Props {
  children?: ReactNode;
  username?: string;
}

interface State {
  hasError: boolean;
  errorMsg: string;
}

export default class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    errorMsg: "",
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, errorMsg: error.message };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-wiki-bg p-8 flex justify-center">
          <div className="max-w-md w-full bg-wiki-red-bg border border-wiki-red text-wiki-red p-4 rounded-wiki shadow-sm">
            <h2 className="font-bold text-lg mb-2">Something went wrong</h2>
            <p className="mb-4">
              {this.props.username 
                ? `User '${this.props.username}' not found. Please check the username and try again.` 
                : "An unexpected error occurred while rendering this page."}
            </p>
            <details className="text-wiki-xs mb-4">
              <summary className="cursor-pointer font-bold">Error Details</summary>
              <pre className="mt-2 whitespace-pre-wrap">{this.state.errorMsg}</pre>
            </details>
            <Link
              to="/"
              className="inline-block px-4 py-2 bg-wiki-blue text-white font-bold rounded-wiki hover:bg-wiki-blue-hover transition-colors"
              onClick={() => this.setState({ hasError: false })}
            >
              &larr; Return to Search
            </Link>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
