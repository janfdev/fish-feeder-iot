import { Component, type ErrorInfo, type ReactNode } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertTriangle, RefreshCcw } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error in UI:', error, errorInfo);
    this.setState({ errorInfo });
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="flex items-center justify-center min-h-screen bg-background text-foreground p-4">
          <Card className="max-w-md w-full border-destructive/50 shadow-xl bg-card">
            <CardHeader className="flex flex-row items-center gap-3">
              <div className="p-2.5 rounded-xl bg-destructive/10 text-destructive">
                <AlertTriangle className="size-6" />
              </div>
              <div>
                <CardTitle className="text-base font-bold text-foreground">
                  Terjadi Kesalahan UI
                </CardTitle>
                <p className="text-xs text-muted-foreground">Sistem mendeteksi runtime crash.</p>
              </div>
            </CardHeader>
            <CardContent className="flex flex-col gap-3">
              <div className="p-3 rounded-lg bg-muted text-xs font-mono break-all text-destructive">
                {this.state.error?.message || 'Unknown error occurred'}
              </div>
              <Button 
                onClick={this.handleReset}
                variant="default"
                className="w-full gap-2 font-semibold"
              >
                <RefreshCcw className="size-4" /> Muat Ulang Halaman
              </Button>
            </CardContent>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}
