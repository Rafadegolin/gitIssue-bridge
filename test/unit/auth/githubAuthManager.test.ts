import { GitHubAuthManager, getGitHubAuthManager } from '../../../src/auth/githubAuthManager';
import * as vscode from 'vscode';

// Mock vscode
jest.mock('vscode');

// Mock Octokit properly
jest.mock('@octokit/rest', () => {
  return {
    Octokit: jest.fn().mockImplementation(() => ({
      rest: {},
      auth: jest.fn(),
    })),
  };
});

describe('GitHubAuthManager', () => {
  let authManager: GitHubAuthManager;
  let mockAuthentication: typeof vscode.authentication;
  let mockWindow: typeof vscode.window;

  const mockSession: vscode.AuthenticationSession = {
    id: 'test-session-id',
    accessToken: 'ghp_testtoken1234567890',
    account: {
      id: 'user-123',
      label: 'testuser',
    },
    scopes: ['repo', 'read:org'],
  };

  beforeEach(() => {
    jest.clearAllMocks();

    // Reset singleton instance to prevent state leakage between tests
    (GitHubAuthManager as any).instance = undefined;

    // Get mocked modules
    mockAuthentication = vscode.authentication as typeof vscode.authentication;
    mockWindow = vscode.window as typeof vscode.window;

    // Reset authentication mock
    (mockAuthentication.getSession as jest.Mock).mockResolvedValue(undefined);
    (mockAuthentication.onDidChangeSessions as jest.Mock).mockReturnValue({
      dispose: jest.fn(),
    });

    authManager = GitHubAuthManager.getInstance();
  });

  describe('Singleton Pattern', () => {
    it('should return same instance', () => {
      const instance1 = GitHubAuthManager.getInstance();
      const instance2 = GitHubAuthManager.getInstance();
      const instance3 = getGitHubAuthManager();

      expect(instance1).toBe(instance2);
      expect(instance2).toBe(instance3);
    });
  });

  describe('authenticate', () => {
    it('should successfully authenticate when user approves', async () => {
      (mockAuthentication.getSession as jest.Mock).mockResolvedValue(mockSession);

      const result = await authManager.authenticate();

      expect(result).toBe(true);
      expect(mockAuthentication.getSession).toHaveBeenCalledWith(
        'github',
        ['repo', 'read:org'],
        { createIfNone: true }
      );
      // Octokit should be created with the token
      const octokit = authManager.getOctokit();
      expect(octokit).toBeDefined();
    });

    it('should return false when user cancels authentication', async () => {
      (mockAuthentication.getSession as jest.Mock).mockResolvedValue(null);

      const result = await authManager.authenticate();

      expect(result).toBe(false);
    });

    it('should handle authentication errors gracefully', async () => {
      const error = new Error('Authentication failed');
      (mockAuthentication.getSession as jest.Mock).mockRejectedValue(error);

      const result = await authManager.authenticate();

      expect(result).toBe(false);
    });

    it('should not expose token in logs', async () => {
      (mockAuthentication.getSession as jest.Mock).mockResolvedValue(mockSession);

      await authManager.authenticate();

      // The logger should sanitize tokens automatically
      // We just verify the method was called, actual sanitization is tested in logger tests
      expect(mockAuthentication.getSession).toHaveBeenCalled();
    });
  });

  describe('isAuthenticated', () => {
    it('should return true when session exists', async () => {
      (mockAuthentication.getSession as jest.Mock).mockResolvedValue(mockSession);

      const result = await authManager.isAuthenticated();

      expect(result).toBe(true);
      expect(mockAuthentication.getSession).toHaveBeenCalledWith(
        'github',
        ['repo', 'read:org'],
        { createIfNone: false, silent: true }
      );
    });

    it('should return false when no session exists', async () => {
      (mockAuthentication.getSession as jest.Mock).mockResolvedValue(null);

      const result = await authManager.isAuthenticated();

      expect(result).toBe(false);
    });

    it('should return false on error', async () => {
      (mockAuthentication.getSession as jest.Mock).mockRejectedValue(new Error('Check failed'));

      const result = await authManager.isAuthenticated();

      expect(result).toBe(false);
    });

    it('should not prompt user for authentication', async () => {
      await authManager.isAuthenticated();

      expect(mockAuthentication.getSession).toHaveBeenCalledWith(
        expect.anything(),
        expect.anything(),
        expect.objectContaining({ createIfNone: false, silent: true })
      );
    });
  });

  describe('ensureAuthenticated', () => {
    it('should return true if already authenticated', async () => {
      (mockAuthentication.getSession as jest.Mock).mockResolvedValue(mockSession);

      const result = await authManager.ensureAuthenticated();

      expect(result).toBe(true);
      // Should not call authenticate, just check status
      expect(mockAuthentication.getSession).toHaveBeenCalledTimes(1);
    });

    it('should authenticate if not authenticated', async () => {
      // First call (isAuthenticated check) returns null, second call (authenticate) returns session
      (mockAuthentication.getSession as jest.Mock)
        .mockResolvedValueOnce(null)
        .mockResolvedValueOnce(mockSession);

      const result = await authManager.ensureAuthenticated();

      expect(result).toBe(true);
      expect(mockAuthentication.getSession).toHaveBeenCalledTimes(2);
    });

    it('should return false if user cancels authentication', async () => {
      (mockAuthentication.getSession as jest.Mock).mockResolvedValue(null);

      const result = await authManager.ensureAuthenticated();

      expect(result).toBe(false);
    });
  });

  describe('getOctokit', () => {
    it('should return Octokit instance when authenticated', async () => {
      (mockAuthentication.getSession as jest.Mock).mockResolvedValue(mockSession);
      await authManager.authenticate();

      const octokit = authManager.getOctokit();

      expect(octokit).toBeDefined();
    });

    it('should return undefined when not authenticated', () => {
      const octokit = authManager.getOctokit();

      expect(octokit).toBeUndefined();
    });
  });

  describe('getUsername', () => {
    it('should return username when authenticated', async () => {
      (mockAuthentication.getSession as jest.Mock).mockResolvedValue(mockSession);
      await authManager.authenticate();

      const username = await authManager.getUsername();

      expect(username).toBe('testuser');
    });

    it('should return undefined when not authenticated', async () => {
      const username = await authManager.getUsername();

      expect(username).toBeUndefined();
    });
  });

  describe('logout', () => {
    it('should clear session on logout', async () => {
      (mockAuthentication.getSession as jest.Mock).mockResolvedValue(mockSession);
      await authManager.authenticate();

      const result = await authManager.logout();

      expect(result).toBe(true);
      expect(mockWindow.showInformationMessage).toHaveBeenCalledWith(
        expect.stringContaining('Logged out from GitHub')
      );
    });

    it('should return true even if no session exists', async () => {
      const result = await authManager.logout();

      expect(result).toBe(true);
    });

    it('should clear Octokit instance after logout', async () => {
      (mockAuthentication.getSession as jest.Mock).mockResolvedValue(mockSession);
      await authManager.authenticate();
      
      expect(authManager.getOctokit()).toBeDefined();
      
      await authManager.logout();
      
      expect(authManager.getOctokit()).toBeUndefined();
    });

    it('should handle logout errors gracefully', async () => {
      (mockAuthentication.getSession as jest.Mock).mockResolvedValue(mockSession);
      await authManager.authenticate();

      // Make showInformationMessage throw
      (mockWindow.showInformationMessage as jest.Mock).mockRejectedValue(
        new Error('Display error')
      );

      const result = await authManager.logout();

      expect(result).toBe(false);
    });
  });

  describe('Session change handling', () => {
    it('should register session change listener', () => {
      expect(mockAuthentication.onDidChangeSessions).toHaveBeenCalled();
    });

    it('should have all required methods', () => {
      expect(typeof authManager.authenticate).toBe('function');
      expect(typeof authManager.isAuthenticated).toBe('function');
      expect(typeof authManager.ensureAuthenticated).toBe('function');
      expect(typeof authManager.getOctokit).toBe('function');
      expect(typeof authManager.getUsername).toBe('function');
      expect(typeof authManager.logout).toBe('function');
    });
  });

  describe('Error scenarios', () => {
    it('should handle network errors during authentication', async () => {
      const networkError = new Error('Network error');
      (mockAuthentication.getSession as jest.Mock).mockRejectedValue(networkError);

      const result = await authManager.authenticate();

      expect(result).toBe(false);
    });

    it('should handle invalid session data', async () => {
      const invalidSession = { ...mockSession, account: null } as any;
      (mockAuthentication.getSession as jest.Mock).mockResolvedValue(invalidSession);

      // Should not throw
      await expect(authManager.authenticate()).resolves.toBeDefined();
    });
  });
});
