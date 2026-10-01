import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null
    };
  }

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught React application error:', error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#090d16] text-white flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-[#111827] border border-red-500/40 rounded-3xl p-6 sm:p-8 text-center space-y-4 shadow-2xl shadow-red-950">
            <div className="w-16 h-16 rounded-2xl bg-red-500/20 border border-red-500/40 text-red-500 mx-auto flex items-center justify-center">
              <AlertTriangle className="w-8 h-8" />
            </div>

            <div className="space-y-2">
              <h2 className="text-xl font-black text-white tracking-wide">
                HITILAFU YA MFUMO (SYSTEM RECOVERY)
              </h2>
              <p className="text-xs text-slate-300">
                Hitilafu imetokea wakati wa kupakia jukwaa. Bonyeza kitufe hapo chini ili kuanzisha upya programu salama.
              </p>
              {this.state.error?.message && (
                <div className="bg-black/60 border border-slate-800 rounded-xl p-3 text-[11px] font-mono text-red-400 text-left break-words">
                  {this.state.error.message}
                </div>
              )}
            </div>

            <button
              onClick={this.handleReset}
              className="w-full py-3.5 bg-gradient-to-r from-red-600 to-amber-600 hover:from-red-500 text-white font-black rounded-xl text-xs flex items-center justify-center gap-2 shadow-lg transition-all cursor-pointer"
            >
              <RefreshCw className="w-4 h-4" />
              <span>ANZISHA UPYA (RELOAD SEIJO58 BET)</span>
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
