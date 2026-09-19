import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RotateCcw } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallbackTitle?: string;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
    };
  }

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught component error:', error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  private handleClearStorageAndReload = () => {
    localStorage.removeItem('kylie_career_studios_v1');
    localStorage.removeItem('kylie_career_records_v1');
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-[360px] flex items-center justify-center p-6">
          <div className="max-w-md w-full bg-white rounded-2xl border border-[#e4e0d5] p-6 shadow-md text-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-[#fef2f2] text-[#dc2626] flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-serif font-bold text-[#0c2b21]">
                {this.props.fallbackTitle || 'Component Error Detected'}
              </h3>
              <p className="text-xs text-[#557164] mt-1.5 leading-relaxed">
                {this.state.error?.message || 'An unexpected rendering error occurred.'}
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-2 justify-center pt-2">
              <button
                onClick={this.handleReset}
                className="inline-flex items-center justify-center space-x-1.5 px-4 py-2 rounded-xl text-xs font-bold text-[#0c2b21] bg-[#d4f04c] hover:bg-[#c3e038] transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reload View</span>
              </button>
              <button
                onClick={this.handleClearStorageAndReload}
                className="inline-flex items-center justify-center space-x-1.5 px-3 py-2 rounded-xl text-xs font-medium text-[#78350f] bg-[#fef3c7] hover:bg-[#fde68a] transition-colors"
              >
                <span>Reset Local Cache</span>
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
