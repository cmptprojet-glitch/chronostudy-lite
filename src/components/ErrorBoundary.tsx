import React from 'react';
import { RefreshCw, RotateCcw, AlertTriangle, Sparkles } from 'lucide-react';

interface Props {
  children: React.ReactNode;
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
      error: null,
    };
  }

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ChronoStudy Uncaught Error:', error, errorInfo);
  }

  private handleReload = () => {
    window.location.reload();
  };

  private handleResetStorage = () => {
    try {
      const keys = Object.keys(localStorage);
      keys.forEach((key) => {
        if (key.startsWith('chronostudy_') || key.startsWith('lifeos_')) {
          localStorage.removeItem(key);
        }
      });
      window.location.reload();
    } catch (e) {
      console.error('Failed to clear storage:', e);
      window.location.reload();
    }
  };

  public override render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen w-full bg-[#F4F5FA] dark:bg-[#0F1115] text-[#161922] dark:text-white flex items-center justify-center p-6 font-sans">
          <div className="max-w-lg w-full bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl p-8 shadow-2xl space-y-6 text-center">
            <div className="w-16 h-16 mx-auto bg-[#D4F94E] text-[#161922] rounded-2xl flex items-center justify-center font-black shadow-lg">
              <AlertTriangle className="w-8 h-8" />
            </div>

            <div className="space-y-2">
              <h1 className="text-2xl font-black tracking-tight text-[#161922] dark:text-white">
                Rétablissement de ChronoStudy
              </h1>
              <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">
                Une interruption est survenue lors du chargement de l'interface. Vous pouvez recharger l'application ou réinitialiser vos données temporaires.
              </p>
            </div>

            {this.state.error && (
              <div className="bg-slate-100 dark:bg-zinc-950 p-4 rounded-2xl text-left border border-slate-200 dark:border-zinc-800 overflow-x-auto">
                <p className="text-xs font-mono text-rose-600 dark:text-rose-400 font-bold break-all">
                  {this.state.error.toString()}
                </p>
              </div>
            )}

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={this.handleReload}
                className="w-full sm:w-auto px-6 py-3 bg-[#D4F94E] hover:bg-[#CBF33B] text-[#161922] font-black text-xs rounded-2xl shadow-md flex items-center justify-center gap-2 cursor-pointer transition-all hover:scale-105 active:scale-95"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Recharger la page</span>
              </button>

              <button
                type="button"
                onClick={this.handleResetStorage}
                className="w-full sm:w-auto px-6 py-3 bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 dark:hover:bg-zinc-700 text-slate-700 dark:text-slate-300 font-extrabold text-xs rounded-2xl border border-slate-200 dark:border-zinc-700 flex items-center justify-center gap-2 cursor-pointer transition-all hover:scale-105 active:scale-95"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Réparer & Réinitialiser</span>
              </button>
            </div>

            <div className="pt-2 border-t border-slate-100 dark:border-zinc-800">
              <span className="text-[11px] font-bold text-slate-400 dark:text-slate-500 flex items-center justify-center gap-1">
                <Sparkles className="w-3 h-3 text-[#65A30D] dark:text-[#D4F94E]" /> ChronoStudy OS • Système d'Étude Intelligent
              </span>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
