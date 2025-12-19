import * as vscode from 'vscode';
import { getLogger } from './logger';

/**
 * Error severity levels
 */
export enum ErrorSeverity {
  INFO = 'info',
  WARNING = 'warning',
  ERROR = 'error',
}

/**
 * Context for error handling
 */
export interface ErrorContext {
  operation?: string;
  component?: string;
  metadata?: Record<string, unknown>;
}

/**
 * Centralized error handling service
 * Provides consistent error reporting and user notifications
 */
export class ErrorHandler {
  private static instance: ErrorHandler;
  private logger = getLogger();

  private constructor() {}

  /**
   * Get singleton instance
   */
  public static getInstance(): ErrorHandler {
    if (!ErrorHandler.instance) {
      ErrorHandler.instance = new ErrorHandler();
    }
    return ErrorHandler.instance;
  }

  /**
   * Get user-friendly error message
   */
  private getUserMessage(error: unknown): string {
    if (error instanceof Error) {
      // Map common errors to user-friendly messages
      if (error.message.includes('ENOTFOUND')) {
        return 'Network error: Unable to connect to GitHub. Please check your internet connection.';
      }
      if (error.message.includes('401') || error.message.includes('Unauthorized')) {
        return 'Authentication failed. Please sign in to GitHub again.';
      }
      if (error.message.includes('403') || error.message.includes('Forbidden')) {
        return 'Access denied. You may not have permission for this operation.';
      }
      if (error.message.includes('404') || error.message.includes('Not Found')) {
        return 'Resource not found. The requested item may have been deleted or moved.';
      }
      if (error.message.includes('rate limit')) {
        return 'GitHub API rate limit exceeded. Please try again later.';
      }

      return error.message;
    }

    if (typeof error === 'string') {
      return error;
    }

    return 'An unexpected error occurred. Please check the logs for more details.';
  }

  /**
   * Handle error with context and show to user
   */
  public async handle(
    error: unknown,
    context?: ErrorContext,
    severity: ErrorSeverity = ErrorSeverity.ERROR
  ): Promise<void> {
    const userMessage = this.getUserMessage(error);
    const operation = context?.operation || 'Unknown operation';
    const component = context?.component || 'Unknown component';

    // Log error with full context
    this.logger.error(`Error in ${component} during ${operation}`, error, context?.metadata);

    // Show appropriate notification to user
    const actions = ['Show Logs', 'Dismiss'];

    let selectedAction: string | undefined;

    switch (severity) {
      case ErrorSeverity.INFO:
        selectedAction = await vscode.window.showInformationMessage(userMessage, ...actions);
        break;
      case ErrorSeverity.WARNING:
        selectedAction = await vscode.window.showWarningMessage(userMessage, ...actions);
        break;
      case ErrorSeverity.ERROR:
        selectedAction = await vscode.window.showErrorMessage(userMessage, ...actions);
        break;
    }

    // Handle user action
    if (selectedAction === 'Show Logs') {
      this.logger.show();
    }
  }

  /**
   * Handle error and return boolean success indicator
   */
  public async handleWithResult(
    error: unknown,
    context?: ErrorContext,
    severity: ErrorSeverity = ErrorSeverity.ERROR
  ): Promise<boolean> {
    await this.handle(error, context, severity);
    return false;
  }

  /**
   * Show error message without logging (for validation errors)
   */
  public async showValidationError(message: string): Promise<void> {
    await vscode.window.showWarningMessage(`Validation Error: ${message}`);
  }

  /**
   * Show success message
   */
  public async showSuccess(message: string): Promise<void> {
    await vscode.window.showInformationMessage(`✅ ${message}`);
  }

  /**
   * Show info message with optional actions
   */
  public async showInfo(message: string, ...actions: string[]): Promise<string | undefined> {
    return await vscode.window.showInformationMessage(message, ...actions);
  }

  /**
   * Wrap async operation with error handling
   */
  public async wrapAsync<T>(
    operation: () => Promise<T>,
    context: ErrorContext
  ): Promise<T | undefined> {
    try {
      return await operation();
    } catch (error) {
      await this.handle(error, context);
      return undefined;
    }
  }

  /**
   * Wrap sync operation with error handling
   */
  public wrap<T>(operation: () => T, context: ErrorContext): T | undefined {
    try {
      return operation();
    } catch (error) {
      void this.handle(error, context);
      return undefined;
    }
  }
}

/**
 * Get error handler instance (convenience function)
 */
export function getErrorHandler(): ErrorHandler {
  return ErrorHandler.getInstance();
}
