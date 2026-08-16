import * as React from "react";
import { AlertTriangle, RefreshCw, Home, ChevronDown, ChevronUp } from "lucide-react";

interface Props {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: React.ErrorInfo | null;
  showDetails: boolean;
}

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      showDetails: false,
    };
    this.handleReset = this.handleReset.bind(this);
  }

  public static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("Uncaught storefront exception:", error, errorInfo);
    this.setState({ errorInfo });
  }

  private handleReset() {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      showDetails: false,
    });
    window.location.reload();
  }

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen bg-[#FAF9F5] text-[#1C1F22] flex items-center justify-center p-6 font-sans">
          <div className="max-w-xl w-full bg-white border border-[#E8E2D7] rounded-2xl p-8 shadow-xl space-y-6">
            <div className="w-14 h-14 bg-amber-500/10 border border-amber-500/20 text-amber-700 rounded-2xl flex items-center justify-center">
              <AlertTriangle className="w-7 h-7 stroke-[2]" />
            </div>

            <div className="space-y-2">
              <span className="text-[10px] uppercase font-mono tracking-widest text-[#5A6351] font-bold">
                Storefront Protection Active
              </span>
              <h2 className="font-serif text-2xl font-bold text-[#1C1F22]">
                Unexpected Interruption Occurred
              </h2>
              <p className="text-xs text-[#5A6351] font-light leading-relaxed">
                Our application caught a component render issue. Your cart items and local session remain safely preserved.
              </p>
            </div>

            {this.state.error && (
              <div className="border border-[#E8E2D7] rounded-xl overflow-hidden bg-[#FAF9F5]">
                <button
                  type="button"
                  onClick={() => this.setState({ showDetails: !this.state.showDetails })}
                  className="w-full px-4 py-3 flex items-center justify-between text-xs font-mono font-medium text-[#1C1F22] hover:bg-stone-100 transition cursor-pointer"
                >
                  <span>Technical Diagnostics</span>
                  {this.state.showDetails ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>

                {this.state.showDetails && (
                  <div className="p-4 border-t border-[#E8E2D7] text-[11px] font-mono text-red-700 space-y-2 overflow-x-auto max-h-48">
                    <p className="font-bold">{this.state.error.toString()}</p>
                    {this.state.errorInfo && (
                      <pre className="text-[10px] text-stone-600 whitespace-pre-wrap">
                        {this.state.errorInfo.componentStack}
                      </pre>
                    )}
                  </div>
                )}
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <button
                type="button"
                onClick={this.handleReset}
                className="flex-1 min-h-[44px] px-5 py-3 bg-[#3F4E3E] hover:bg-[#2D3B2D] text-[#FAF9F5] rounded-xl text-xs font-serif font-bold transition flex items-center justify-center gap-2 shadow-md cursor-pointer"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Reload Storefront</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  window.location.href = "/";
                }}
                className="min-h-[44px] px-5 py-3 bg-white border border-[#E8E2D7] text-[#1C1F22] hover:bg-[#FAF9F5] rounded-xl text-xs font-serif font-bold transition flex items-center justify-center gap-2 cursor-pointer"
              >
                <Home className="w-4 h-4 text-[#5A6351]" />
                <span>Return Home</span>
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
