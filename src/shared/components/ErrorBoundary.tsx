import { Component, type ReactNode } from "react";
import { logger } from "@/shared/lib/logger";
import { Button } from "@/shared/components/ui/button";
import { AlertCircle } from "lucide-react";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    logger.error("ErrorBoundary caught error", error, {
      componentStack: errorInfo.componentStack,
    });
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;

      return (
        <div className="flex min-h-screen items-center justify-center bg-background p-6">
          <div className="max-w-md text-center space-y-4">
            <AlertCircle className="mx-auto h-12 w-12 text-destructive" />
            <h2 className="text-xl font-semibold">Algo deu errado</h2>
            <p className="text-muted-foreground text-sm">
              Um erro inesperado ocorreu. Nossa equipe foi notificada.
            </p>
            <Button
              onClick={() => {
                this.setState({ hasError: false });
                window.location.href = "/dashboard";
              }}
            >
              Voltar ao Dashboard
            </Button>
            {import.meta.env.DEV && this.state.error && (
              <pre className="mt-4 text-left text-xs bg-muted p-4 rounded-lg overflow-auto max-h-48">
                {this.state.error.stack}
              </pre>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
