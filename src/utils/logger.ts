import * as vscode from 'vscode';

/**
 * Log levels for the logger
 */
export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
}

/**
 * Centralized logging service with automatic sensitive data sanitization
 * Implements singleton pattern to ensure single instance across extension
 */
export class Logger {
  private static instance: Logger;
  private outputChannel: vscode.OutputChannel;
  private logLevel: LogLevel = LogLevel.INFO;

  /**
   * Patterns for detecting sensitive data
   */
  private readonly sensitivePatterns = [
    // GitHub tokens: ghp_, gho_, ghs_, ghr_
    { pattern: /ghp_[a-zA-Z0-9]{36}/g, replacement: 'ghp_[REDACTED]' },
    { pattern: /gho_[a-zA-Z0-9]{36}/g, replacement: 'gho_[REDACTED]' },
    { pattern: /ghs_[a-zA-Z0-9]{36}/g, replacement: 'ghs_[REDACTED]' },
    { pattern: /ghr_[a-zA-Z0-9]{36}/g, replacement: 'ghr_[REDACTED]' },
    // Generic tokens (40+ chars of alphanumeric)
    { pattern: /\b[a-f0-9]{40,}\b/gi, replacement: '[REDACTED_TOKEN]' },
    // Authorization headers
    {
      pattern: /authorization:\s*bearer\s+[^\s]+/gi,
      replacement: 'authorization: bearer [REDACTED]',
    },
    {
      pattern: /authorization:\s*token\s+[^\s]+/gi,
      replacement: 'authorization: token [REDACTED]',
    },
  ];

  /**
   * Sensitive field names to redact
   */
  private readonly sensitiveFields = [
    'token',
    'password',
    'secret',
    'apiKey',
    'api_key',
    'accessToken',
    'access_token',
    'refreshToken',
    'refresh_token',
    'privateKey',
    'private_key',
    'authorization',
  ];

  private constructor() {
    this.outputChannel = vscode.window.createOutputChannel('GitIssue Bridge');
  }

  /**
   * Get singleton instance
   */
  public static getInstance(): Logger {
    if (!Logger.instance) {
      Logger.instance = new Logger();
    }
    return Logger.instance;
  }

  /**
   * Set minimum log level
   */
  public setLogLevel(level: LogLevel): void {
    this.logLevel = level;
    this.info(`Log level set to ${LogLevel[level]}`);
  }

  /**
   * Get current log level
   */
  public getLogLevel(): LogLevel {
    return this.logLevel;
  }

  /**
   * Show output channel in VS Code
   */
  public show(): void {
    this.outputChannel.show();
  }

  /**
   * Hide output channel
   */
  public hide(): void {
    this.outputChannel.hide();
  }

  /**
   * Clear all logs
   */
  public clear(): void {
    this.outputChannel.clear();
  }

  /**
   * Sanitize sensitive data from message
   */
  private sanitize(message: string): string {
    let sanitized = message;

    // Apply pattern-based sanitization
    for (const { pattern, replacement } of this.sensitivePatterns) {
      sanitized = sanitized.replace(pattern, replacement);
    }

    return sanitized;
  }

  /**
   * Sanitize object by redacting sensitive fields
   */
  private sanitizeObject(obj: unknown): unknown {
    if (obj === null || obj === undefined) {
      return obj;
    }

    if (typeof obj !== 'object') {
      return obj;
    }

    if (Array.isArray(obj)) {
      return obj.map(item => this.sanitizeObject(item));
    }

    const sanitized: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(obj)) {
      const lowerKey = key.toLowerCase();
      if (this.sensitiveFields.some(field => lowerKey.includes(field.toLowerCase()))) {
        sanitized[key] = '[REDACTED]';
      } else if (typeof value === 'object' && value !== null) {
        sanitized[key] = this.sanitizeObject(value);
      } else {
        sanitized[key] = value;
      }
    }

    return sanitized;
  }

  /**
   * Format message with optional data
   */
  private formatMessage(level: string, message: string, data?: unknown): string {
    const timestamp = new Date().toISOString();
    let formatted = `[${timestamp}] [${level}] ${this.sanitize(message)}`;

    if (data !== undefined) {
      try {
        const sanitizedData = this.sanitizeObject(data);
        const dataStr = JSON.stringify(sanitizedData, null, 2);
        formatted += `\n${this.sanitize(dataStr)}`;
      } catch (error) {
        formatted += `\n[Error formatting data: ${error}]`;
      }
    }

    return formatted;
  }

  /**
   * Log debug message
   */
  public debug(message: string, data?: unknown): void {
    if (this.logLevel <= LogLevel.DEBUG) {
      const formatted = this.formatMessage('DEBUG', message, data);
      this.outputChannel.appendLine(formatted);
    }
  }

  /**
   * Log info message
   */
  public info(message: string, data?: unknown): void {
    if (this.logLevel <= LogLevel.INFO) {
      const formatted = this.formatMessage('INFO', message, data);
      this.outputChannel.appendLine(formatted);
    }
  }

  /**
   * Log warning message
   */
  public warn(message: string, data?: unknown): void {
    if (this.logLevel <= LogLevel.WARN) {
      const formatted = this.formatMessage('WARN', message, data);
      this.outputChannel.appendLine(formatted);
    }
  }

  /**
   * Log error message
   */
  public error(message: string, error?: unknown, data?: unknown): void {
    if (this.logLevel <= LogLevel.ERROR) {
      let errorDetails = '';

      if (error instanceof Error) {
        errorDetails = `\nError: ${error.message}\nStack: ${this.sanitize(error.stack || '')}`;
      } else if (error) {
        errorDetails = `\nError: ${JSON.stringify(this.sanitizeObject(error))}`;
      }

      const formatted = this.formatMessage('ERROR', message + errorDetails, data);
      this.outputChannel.appendLine(formatted);
    }
  }

  /**
   * Dispose logger resources
   */
  public dispose(): void {
    this.outputChannel.dispose();
  }
}

/**
 * Get logger instance (convenience function)
 */
export function getLogger(): Logger {
  return Logger.getInstance();
}
