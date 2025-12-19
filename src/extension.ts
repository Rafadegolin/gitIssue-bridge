import * as vscode from 'vscode';

/**
 * Extension activation entry point
 * Called when VS Code activates the extension
 */
export function activate(context: vscode.ExtensionContext): void {
  console.log('🚀 GitIssue Bridge is activating...');

  // Register test command
  const testCommand = vscode.commands.registerCommand('gitissue-bridge.test', async () => {
    await vscode.window.showInformationMessage('✅ GitIssue Bridge is active! Setup complete.');
  });

  context.subscriptions.push(testCommand);

  // Show welcome message on first activation
  const hasShownWelcome = context.globalState.get<boolean>('hasShownWelcome');
  if (!hasShownWelcome) {
    void showWelcomeMessage(context);
  }

  console.log('✅ GitIssue Bridge activated successfully');
}

/**
 * Extension deactivation
 * Called when VS Code deactivates the extension
 */
export function deactivate(): void {
  console.log('👋 GitIssue Bridge deactivated');
}

/**
 * Show welcome message on first activation
 */
async function showWelcomeMessage(context: vscode.ExtensionContext): Promise<void> {
  const action = await vscode.window.showInformationMessage(
    '👋 Welcome to GitIssue Bridge! This is your first time using the extension.',
    'Got it!',
    'Show Test'
  );

  if (action === 'Show Test') {
    await vscode.commands.executeCommand('gitissue-bridge.test');
  }

  await context.globalState.update('hasShownWelcome', true);
}
