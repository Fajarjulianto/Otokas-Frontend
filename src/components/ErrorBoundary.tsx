import React from "react";
import { Text, TouchableOpacity, View } from "react-native";

type ErrorBoundaryState = {
  hasError: boolean;
  error?: Error;
};

type ErrorBoundaryProps = {
  children: React.ReactNode;
};

/**
 * Global Error Boundary — catches unhandled JS errors in the
 * React component tree and renders a fallback UI instead of
 * crashing the entire application.
 */
export class ErrorBoundary extends React.Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // TODO: Send to crash reporting service (Sentry, Bugsnag, etc.)
    if (__DEV__) {
      console.error("ErrorBoundary caught:", error, errorInfo);
    }
  }

  private handleRetry = () => {
    this.setState({ hasError: false, error: undefined });
  };

  render() {
    if (this.state.hasError) {
      return (
        <View
          style={{
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
            padding: 32,
            backgroundColor: "#f8fafc",
          }}
        >
          <View
            style={{
              width: 72,
              height: 72,
              borderRadius: 36,
              backgroundColor: "#fee2e2",
              justifyContent: "center",
              alignItems: "center",
              marginBottom: 20,
            }}
          >
            <Text style={{ fontSize: 32 }}>⚠️</Text>
          </View>
          <Text
            style={{
              fontSize: 20,
              fontWeight: "bold",
              color: "#1e293b",
              textAlign: "center",
              marginBottom: 8,
            }}
          >
            Terjadi Kesalahan
          </Text>
          <Text
            style={{
              fontSize: 14,
              color: "#94a3b8",
              textAlign: "center",
              lineHeight: 22,
              marginBottom: 24,
              paddingHorizontal: 16,
            }}
          >
            Aplikasi mengalami masalah yang tidak terduga. Silakan coba lagi.
          </Text>
          {__DEV__ && this.state.error && (
            <View
              style={{
                backgroundColor: "#fef2f2",
                borderWidth: 1,
                borderColor: "#fecaca",
                borderRadius: 12,
                padding: 12,
                marginBottom: 20,
                width: "100%",
              }}
            >
              <Text
                style={{ fontSize: 12, color: "#dc2626", fontFamily: "monospace" }}
                numberOfLines={5}
              >
                {this.state.error.message}
              </Text>
            </View>
          )}
          <TouchableOpacity
            onPress={this.handleRetry}
            activeOpacity={0.85}
            style={{
              backgroundColor: "#1e3a8a",
              paddingHorizontal: 32,
              paddingVertical: 14,
              borderRadius: 16,
            }}
          >
            <Text style={{ color: "white", fontWeight: "bold", fontSize: 16 }}>
              Coba Lagi
            </Text>
          </TouchableOpacity>
        </View>
      );
    }

    return this.props.children;
  }
}
