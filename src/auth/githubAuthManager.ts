import * as vscode from 'vscode';
import { Octokit } from '@octokit/rest';
import { getLogger } from '../utils/logger';

/**
 * GitHub OAuth scopes required for the extension
 * Using minimal scopes following principle of least privilege
 */
const GITHUB_SCOPES = ['repo', 'read:org'];

/**
 * GitHub Authentication Manager
 * Handles secure OAuth authentication using VS Code's built-in Authentication API
 * Implements singleton pattern and follows zero-trust principles
 */
export class GitHubAuthManager {
  private static instance: GitHubAuthManager;
  private logger = getLogger();
  private currentSession: vscode.AuthenticationSession | undefined;
  private octokit: Octokit | undefined;

  private constructor() {
    // Listen for authentication session changes
    vscode.authentication.onDidChangeSessions(async (e) => {
      if (e.provider.id === 'github') {
        this.logger.info('GitHub authentication session changed');
        await this.refreshSession();
      }
    });
  }

  /**
   * Get singleton instance
   */
  public static getInstance(): GitHubAuthManager {
    if (!GitHubAuthManager.instance) {
      GitHubAuthManager.instance = new GitHubAuthManager();
    }
    return GitHubAuthManager.instance;
  }

  /**
   * Refresh session from VS Code's authentication provider
   * Called after session changes
   */
  private async refreshSession(): Promise<void> {
    try {
      // Try to get existing session without creating a new one
      this.currentSession = await vscode.authentication.getSession('github', GITHUB_SCOPES, {
        createIfNone: false,
      });

      if (this.currentSession) {
        this.octokit = new Octokit({ auth: this.currentSession.accessToken });
        this.logger.debug('Session refreshed successfully');
      } else {
        this.octokit = undefined;
        this.logger.debug('No active session found');
      }
    } catch (error) {
      this.logger.error('Failed to refresh session', error);
      this.currentSession = undefined;
      this.octokit = undefined;
    }
  }

  /**
   * Authenticate with GitHub using OAuth
   * Opens browser for user to complete OAuth flow
   * 
   * @returns Promise<boolean> - true if authentication successful, false otherwise
   */
  public async authenticate(): Promise<boolean> {
    try {
      this.logger.info('Initiating GitHub OAuth authentication');

      // Request authentication session, creating one if needed
      const session = await vscode.authentication.getSession('github', GITHUB_SCOPES, {
        createIfNone: true,
      });

      if (!session) {
        this.logger.warn('Authentication cancelled by user');
        return false;
      }

      this.currentSession = session;
      this.octokit = new Octokit({ auth: session.accessToken });

      this.logger.info('GitHub authentication successful', {
        accountLabel: session.account.label,
        scopes: session.scopes,
      });

      return true;
    } catch (error) {
      this.logger.error('GitHub authentication failed', error);
      this.currentSession = undefined;
      this.octokit = undefined;
      return false;
    }
  }

  /**
   * Check if user is currently authenticated
   * Does not prompt user for authentication
   * 
   * @returns Promise<boolean> - true if authenticated, false otherwise
   */
  public async isAuthenticated(): Promise<boolean> {
    try {
      // Check for existing session without prompting
      const session = await vscode.authentication.getSession('github', GITHUB_SCOPES, {
        createIfNone: false,
        silent: true,
      });

      const isAuth = !!session;
      this.logger.debug(`Authentication status: ${isAuth ? 'authenticated' : 'not authenticated'}`);

      if (session && !this.currentSession) {
        // Update cached session if we found one
        this.currentSession = session;
        this.octokit = new Octokit({ auth: session.accessToken });
      }

      return isAuth;
    } catch (error) {
      this.logger.error('Failed to check authentication status', error);
      return false;
    }
  }

  /**
   * Ensure user is authenticated, prompting if necessary
   * Useful as a guard before sensitive operations
   * 
   * @returns Promise<boolean> - true if authenticated (or user completes auth), false otherwise
   */
  public async ensureAuthenticated(): Promise<boolean> {
    const isAuth = await this.isAuthenticated();

    if (isAuth) {
      this.logger.debug('User already authenticated');
      return true;
    }

    this.logger.info('User not authenticated, prompting for authentication');
    return await this.authenticate();
  }

  /**
   * Get authenticated Octokit instance
   * Returns undefined if not authenticated
   * 
   * @returns Octokit instance or undefined
   */
  public getOctokit(): Octokit | undefined {
    if (!this.octokit) {
      this.logger.warn('Attempted to get Octokit instance while not authenticated');
    }
    return this.octokit;
  }

  /**
   * Get GitHub username of authenticated user
   * Returns undefined if not authenticated
   * 
   * @returns Promise<string | undefined> - GitHub username or undefined
   */
  public async getUsername(): Promise<string | undefined> {
    if (!this.currentSession) {
      this.logger.warn('Attempted to get username while not authenticated');
      return undefined;
    }

    return this.currentSession.account.label;
  }

  /**
   * Logout from GitHub
   * Removes authentication session
   * 
   * @returns Promise<boolean> - true if logout successful, false otherwise
   */
  public async logout(): Promise<boolean> {
    try {
      if (!this.currentSession) {
        this.logger.info('No active session to logout from');
        return true;
      }

      this.logger.info('Logging out from GitHub');

      // VS Code doesn't expose removeSession directly, but we can get a fresh session
      // and the user can manage sessions through VS Code's account menu
      // For now, we just clear our cached data
      const username = this.currentSession.account.label;
      this.currentSession = undefined;
      this.octokit = undefined;

      this.logger.info(`Logged out from GitHub (${username})`);
      await vscode.window.showInformationMessage(
        `Logged out from GitHub. To completely remove the session, use VS Code's account menu.`
      );

      return true;
    } catch (error) {
      this.logger.error('Failed to logout', error);
      return false;
    }
  }
}

/**
 * Get GitHub auth manager instance (convenience function)
 */
export function getGitHubAuthManager(): GitHubAuthManager {
  return GitHubAuthManager.getInstance();
}
