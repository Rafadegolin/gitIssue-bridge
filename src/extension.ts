import * as vscode from 'vscode';
import { getLogger, LogLevel } from './utils/logger';
import { getErrorHandler } from './utils/errorHandler';
import { getWorkspaceTrustManager } from './utils/workspaceTrustManager';
import { getGitHubAuthManager } from './auth/githubAuthManager';

/**
 * Extension activation entry point
 * Called when VS Code activates the extension
 */
export function activate(context: vscode.ExtensionContext): void {
  const logger = getLogger();
  const errorHandler = getErrorHandler();

  logger.info('🚀 GitIssue Bridge is activating...');

  // Set log level from configuration (can be added to package.json later)
  const config = vscode.workspace.getConfiguration('gitissueBridge');
  const logLevel = config.get<string>('logLevel', 'info');
  logger.setLogLevel(LogLevel[logLevel.toUpperCase() as keyof typeof LogLevel] || LogLevel.INFO);

  // Register test command with workspace trust verification
  const testCommand = vscode.commands.registerCommand('gitissue-bridge.test', async () => {
    try {
      const trustManager = getWorkspaceTrustManager();
      
      // Validate workspace before executing
      const isValid = await trustManager.validateWorkspace();
      
      if (!isValid) {
        logger.warn('Test command cancelled: workspace validation failed');
        return;
      }
      
      logger.info('Test command executed in trusted workspace');
      await errorHandler.showSuccess('GitIssue Bridge is active! Setup complete.');
    } catch (error) {
      await errorHandler.handle(error, {
        operation: 'testCommand',
        component: 'Commands',
      });
    }
  });

  // Register command to show logs
  const showLogsCommand = vscode.commands.registerCommand('gitissue-bridge.showLogs', () => {
    logger.show();
  });

  // Register command to clear logs
  const clearLogsCommand = vscode.commands.registerCommand('gitissue-bridge.clearLogs', () => {
    logger.clear();
    logger.info('Logs cleared');
  });

  // Register command to test error handling
  const testErrorCommand = vscode.commands.registerCommand(
    'gitissue-bridge.testError',
    async () => {
      try {
        logger.debug('Testing error handling with sensitive data', {
          token: 'ghp_1234567890abcdefghijklmnopqrstuv123456',
          password: 'supersecret',
          username: 'testuser',
        });

        throw new Error('This is a test error to verify error handling');
      } catch (error) {
        await errorHandler.handle(error, {
          operation: 'testError',
          component: 'Testing',
        });
      }
    }
  );

  // Register GitHub authentication command
  const authenticateCommand = vscode.commands.registerCommand(
    'gitissue-bridge.authenticate',
    async () => {
      try {
        const authManager = getGitHubAuthManager();
        const success = await authManager.authenticate();
        
        if (success) {
          const username = await authManager.getUsername();
          await errorHandler.showSuccess(`Authenticated as @${username}`);
        }
      } catch (error) {
        await errorHandler.handle(error, {
          operation: 'authenticate',
          component: 'Authentication',
        });
      }
    }
  );

  // Register GitHub logout command
  const logoutCommand = vscode.commands.registerCommand(
    'gitissue-bridge.logout',
    async () => {
      try {
        const authManager = getGitHubAuthManager();
        await authManager.logout();
      } catch (error) {
        await errorHandler.handle(error, {
          operation: 'logout',
          component: 'Authentication',
        });
      }
    }
  );

  // Register show GitHub user command
  const showUserCommand = vscode.commands.registerCommand(
    'gitissue-bridge.showUser',
    async () => {
      try {
        const authManager = getGitHubAuthManager();
        const isAuth = await authManager.isAuthenticated();
        
        if (!isAuth) {
          await vscode.window.showInformationMessage(
            'Not authenticated. Use "Authenticate with GitHub" command first.'
          );
          return;
        }
        
        const username = await authManager.getUsername();
        await vscode.window.showInformationMessage(`Logged in as @${username}`);
      } catch (error) {
        await errorHandler.handle(error, {
          operation: 'showUser',
          component: 'Authentication',
        });
      }
    }
  );

  context.subscriptions.push(
    testCommand,
    showLogsCommand,
    clearLogsCommand,
    testErrorCommand,
    authenticateCommand,
    logoutCommand,
    showUserCommand,
    logger
  );

  // Show welcome message on first activation
  const hasShownWelcome = context.globalState.get<boolean>('hasShownWelcome');
  if (!hasShownWelcome) {
    void showWelcomeMessage(context, errorHandler);
  }

  logger.info('✅ GitIssue Bridge activated successfully');
}

/**
 * Extension deactivation
 * Called when VS Code deactivates the extension
 */
export function deactivate(): void {
  const logger = getLogger();
  logger.info('👋 GitIssue Bridge deactivated');
}

/**
 * Show welcome message on first activation
 */
async function showWelcomeMessage(
  context: vscode.ExtensionContext,
  errorHandler: ReturnType<typeof getErrorHandler>
): Promise<void> {
  const action = await errorHandler.showInfo(
    '👋 Welcome to GitIssue Bridge! This is your first time using the extension.',
    'Got it!',
    'Show Test',
    'View Logs'
  );

  if (action === 'Show Test') {
    await vscode.commands.executeCommand('gitissue-bridge.test');
  } else if (action === 'View Logs') {
    await vscode.commands.executeCommand('gitissue-bridge.showLogs');
  }

  await context.globalState.update('hasShownWelcome', true);
}
