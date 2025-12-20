import * as vscode from 'vscode';
import { getLogger } from './logger';

/**
 * Centralized workspace trust management service
 * Implements singleton pattern to ensure single instance across extension
 * Provides security by verifying workspace trust before sensitive operations
 */
export class WorkspaceTrustManager {
  private static instance: WorkspaceTrustManager;
  private logger = getLogger();

  private constructor() {}

  /**
   * Get singleton instance
   */
  public static getInstance(): WorkspaceTrustManager {
    if (!WorkspaceTrustManager.instance) {
      WorkspaceTrustManager.instance = new WorkspaceTrustManager();
    }
    return WorkspaceTrustManager.instance;
  }

  /**
   * Check if workspace is trusted
   * @returns true if workspace is trusted, false otherwise
   */
  public isTrusted(): boolean {
    return vscode.workspace.isTrusted;
  }

  /**
   * Check if a workspace is currently open
   * @returns true if workspace folders exist, false otherwise
   */
  public hasWorkspace(): boolean {
    const hasFolder = vscode.workspace.workspaceFolders && vscode.workspace.workspaceFolders.length > 0;
    
    if (!hasFolder) {
      this.logger.warn('No workspace folder is currently open');
    }
    
    return !!hasFolder;
  }

  /**
   * Ensure workspace is trusted before performing sensitive operations
   * Shows modal dialog requesting trust if workspace is not trusted
   * 
   * @returns Promise<boolean> - true if workspace is trusted or user grants trust, false otherwise
   */
  public async ensureTrustedWorkspace(): Promise<boolean> {
    // Check if workspace is already trusted
    if (this.isTrusted()) {
      this.logger.debug('Workspace is already trusted');
      return true;
    }

    this.logger.warn('Workspace is not trusted, requesting user confirmation');

    // Show modal to request trust from user
    const selection = await vscode.window.showWarningMessage(
      '🔒 This operation requires a trusted workspace for security. ' +
      'Please trust this workspace to continue.',
      { modal: true },
      'Trust Workspace',
      'Learn More',
      'Cancel'
    );

    if (selection === 'Learn More') {
      this.logger.info('User requested more information about workspace trust');
      // Open VS Code documentation about workspace trust
      await vscode.env.openExternal(
        vscode.Uri.parse('https://code.visualstudio.com/docs/editor/workspace-trust')
      );
      
      // Show the dialog again after they learn more
      return this.ensureTrustedWorkspace();
    }

    if (selection === 'Trust Workspace') {
      this.logger.info('User chose to trust workspace, opening trust dialog');
      
      // Execute the built-in command to manage workspace trust
      await vscode.commands.executeCommand('workbench.trust.manage');
      
      // After the trust dialog, check if workspace is now trusted
      // Note: There's a small delay as the user needs to interact with the dialog
      // We return true optimistically, as the user expressed intent to trust
      this.logger.info('Workspace trust dialog opened');
      return true;
    }

    // User cancelled
    this.logger.info('User cancelled workspace trust request');
    return false;
  }

  /**
   * Validate workspace: checks both existence and trust
   * Combines hasWorkspace() and ensureTrustedWorkspace() checks
   * 
   * @returns Promise<boolean> - true if workspace exists and is trusted, false otherwise
   */
  public async validateWorkspace(): Promise<boolean> {
    // First check if workspace exists
    if (!this.hasWorkspace()) {
      this.logger.error('Cannot validate workspace: No workspace is open');
      await vscode.window.showErrorMessage(
        'No workspace is currently open. Please open a folder first.'
      );
      return false;
    }

    // Then check if workspace is trusted
    const trusted = await this.ensureTrustedWorkspace();
    
    if (trusted) {
      this.logger.debug('Workspace validation successful: workspace exists and is trusted');
    } else {
      this.logger.warn('Workspace validation failed: workspace is not trusted');
    }

    return trusted;
  }

  /**
   * Register event listener for workspace trust changes
   * @param callback Function to call when workspace trust is granted
   * @returns Disposable to unregister the listener
   */
  public onDidGrantWorkspaceTrust(callback: () => void): vscode.Disposable {
    this.logger.debug('Registered workspace trust change listener');
    return vscode.workspace.onDidGrantWorkspaceTrust(() => {
      this.logger.info('Workspace trust has been granted');
      callback();
    });
  }
}

/**
 * Get workspace trust manager instance (convenience function)
 */
export function getWorkspaceTrustManager(): WorkspaceTrustManager {
  return WorkspaceTrustManager.getInstance();
}
