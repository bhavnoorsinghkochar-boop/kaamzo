import React, { ErrorInfo, ReactNode } from "react";
import { AlertTriangle, RefreshCw, Home } from "lucide-react";
import i18n from "../../i18n";

const t = (k: string) => i18n.t(k);

export interface ErrorBoundaryProps {
  children: ReactNode;
  fallbackTitle?: string;
}
export interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}
export class ErrorBoundary extends React.Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }
  public static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error, errorInfo: null };
  }
  public override componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    console.error(
      "Uncaught React error caught by ErrorBoundary:",
      error,
      errorInfo,
    );
    this.setState({ errorInfo });
  }
  private handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
    window.location.reload();
  };
  private handleClearAndHome = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
    try {
      window.location.href = window.location.pathname;
    } catch {
      window.location.reload();
    }
  };
  public override render(): ReactNode {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-900 text-slate-100 flex items-center justify-center p-4">
          {" "}
          <div className="max-w-lg w-full bg-slate-800 border border-slate-700 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-5 text-center">
            {" "}
            <div className="w-16 h-16 rounded-2xl bg-amber-500/20 border border-amber-500/40 text-amber-400 flex items-center justify-center mx-auto shadow-inner">
              {" "}
              <AlertTriangle className="w-8 h-8" />{" "}
            </div>{" "}
            <div className="space-y-2">
              {" "}
              <h2 className="text-xl font-black text-white">
                {" "}
                {this.props.fallbackTitle || "A Display Error Occurred"}{" "}
              </h2>{" "}
              <p className="text-xs text-slate-300">
                {" "}
                 {t("The interface encountered an unexpected state. Your work and verification data are preserved.")} {" "}
              </p>{" "}
            </div>{" "}
            {this.state.error && (
              <div className="bg-slate-950/80 rounded-2xl p-3 text-left border border-slate-800 text-[11px] font-mono text-amber-300 max-h-32 overflow-y-auto">
                {" "}
                <p className="font-bold text-amber-400">
                   {t("Error:")} {this.state.error.message}
                </p>{" "}
              </div>
            )}{" "}
            <div className="flex flex-col sm:flex-row gap-2 pt-2">
              {" "}
              <button
                type="button"
                onClick={this.handleReset}
                className="flex-1 px-4 py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black rounded-xl text-xs transition flex items-center justify-center gap-2 shadow-md cursor-pointer"
              >
                {" "}
                <RefreshCw className="w-4 h-4" />{" "}
                <span> {t("Reload Interface")} </span>{" "}
              </button>{" "}
              <button
                type="button"
                onClick={this.handleClearAndHome}
                className="px-4 py-3 bg-slate-700 hover:bg-slate-600 text-white font-bold rounded-xl text-xs transition flex items-center justify-center gap-2 cursor-pointer"
              >
                {" "}
                <Home className="w-4 h-4" /> <span> {t("Home")} </span>{" "}
              </button>{" "}
            </div>{" "}
          </div>{" "}
        </div>
      );
    }
    return this.props.children;
  }
}
