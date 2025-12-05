/**
 * Error Boundary Component
 * 
 * Catches React errors and displays a user-friendly fallback UI.
 * Integrates with Sentry for error reporting.
 */

import { logToReactotron } from '@/services/monitoring/reactotron';
import * as Sentry from '@sentry/react-native';
import * as Updates from 'expo-updates';
import React, { Component, ErrorInfo, ReactNode } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { Button, Card, Text, useTheme } from 'react-native-paper';
import { IconSymbol } from './icon-symbol';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onReset?: () => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

/**
 * Error boundary with fallback UI and retry functionality
 * 
 * @example
 * ```tsx
 * <ErrorBoundary>
 *   <MyComponent />
 * </ErrorBoundary>
 * ```
 */
export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log error to console in development
    console.error('Error Boundary caught an error:', error, errorInfo);

    // Log to Reactotron
    logToReactotron('Error Boundary caught error', {
      error: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
    });

    // Send to Sentry
    Sentry.captureException(error, {
      contexts: {
        react: {
          componentStack: errorInfo.componentStack,
        },
      },
      level: 'error',
    });

    this.setState({
      errorInfo,
    });
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });

    if (this.props.onReset) {
      this.props.onReset();
    }
  };

  handleReload = async () => {
    try {
      // In development, just reset the error boundary
      if (__DEV__) {
        this.handleReset();
        return;
      }

      // In production, check for updates
      const update = await Updates.checkForUpdateAsync();
      if (update.isAvailable) {
        await Updates.fetchUpdateAsync();
        await Updates.reloadAsync();
      } else {
        // No update available, just reset
        this.handleReset();
      }
    } catch (error) {
      console.error('Error checking for updates:', error);
      this.handleReset();
    }
  };

  render() {
    if (this.state.hasError) {
      // Custom fallback provided
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default fallback UI
      return <ErrorFallback error={this.state.error} onReset={this.handleReset} onReload={this.handleReload} />;
    }

    return this.props.children;
  }
}

/**
 * Default error fallback component
 */
const ErrorFallback: React.FC<{
  error: Error | null;
  onReset: () => void;
  onReload: () => void;
}> = ({ error, onReset, onReload }) => {
  // Can't use hooks in class component, so we'll use a functional wrapper
  return <ErrorFallbackWithTheme error={error} onReset={onReset} onReload={onReload} />;
};

const ErrorFallbackWithTheme: React.FC<{
  error: Error | null;
  onReset: () => void;
  onReload: () => void;
}> = ({ error, onReset, onReload }) => {
  const theme = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Card style={styles.card} mode="elevated">
          <Card.Content style={styles.cardContent}>
            {/* Error Icon */}
            <View style={[styles.iconContainer, { backgroundColor: theme.colors.errorContainer }]}>
              <IconSymbol
                name="exclamationmark.triangle.fill"
                size={48}
                color={theme.colors.error}
              />
            </View>

            {/* Error Title */}
            <Text variant="headlineSmall" style={styles.title}>
              Something went wrong
            </Text>

            {/* Error Message */}
            <Text variant="bodyMedium" style={[styles.message, { color: theme.colors.onSurfaceVariant }]}>
              We encountered an unexpected error. This has been reported to our team.
            </Text>

            {/* Error Details (Development Only) */}
            {__DEV__ && error && (
              <Card style={[styles.errorCard, { backgroundColor: theme.colors.errorContainer }]}>
                <Card.Content>
                  <Text
                    variant="labelSmall"
                    style={[styles.errorTitle, { color: theme.colors.error }]}
                  >
                    Error Details (Development Only)
                  </Text>
                  <Text
                    variant="bodySmall"
                    style={[styles.errorMessage, { color: theme.colors.onErrorContainer }]}
                  >
                    {error.message}
                  </Text>
                  {error.stack && (
                    <ScrollView style={styles.stackScroll} horizontal>
                      <Text
                        variant="bodySmall"
                        style={[styles.stackTrace, { color: theme.colors.onErrorContainer }]}
                      >
                        {error.stack}
                      </Text>
                    </ScrollView>
                  )}
                </Card.Content>
              </Card>
            )}

            {/* Action Buttons */}
            <View style={styles.actions}>
              <Button mode="contained" onPress={onReset} style={styles.button}>
                Try Again
              </Button>
              
              <Button mode="outlined" onPress={onReload} style={styles.button}>
                {__DEV__ ? 'Reset' : 'Reload App'}
              </Button>
            </View>

            {/* Help Text */}
            <Text
              variant="bodySmall"
              style={[styles.helpText, { color: theme.colors.onSurfaceVariant }]}
            >
              If the problem persists, please contact support.
            </Text>
          </Card.Content>
        </Card>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 16,
  },
  card: {
    maxWidth: 500,
    alignSelf: 'center',
    width: '100%',
  },
  cardContent: {
    alignItems: 'center',
    padding: 24,
  },
  iconContainer: {
    width: 96,
    height: 96,
    borderRadius: 48,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  title: {
    marginBottom: 12,
    textAlign: 'center',
  },
  message: {
    marginBottom: 24,
    textAlign: 'center',
    lineHeight: 22,
  },
  errorCard: {
    width: '100%',
    marginBottom: 24,
  },
  errorTitle: {
    fontWeight: 'bold',
    marginBottom: 8,
  },
  errorMessage: {
    marginBottom: 8,
    fontFamily: 'monospace',
  },
  stackScroll: {
    maxHeight: 200,
  },
  stackTrace: {
    fontFamily: 'monospace',
    fontSize: 10,
  },
  actions: {
    width: '100%',
    gap: 12,
    marginBottom: 16,
  },
  button: {
    width: '100%',
  },
  helpText: {
    textAlign: 'center',
    fontStyle: 'italic',
  },
});
