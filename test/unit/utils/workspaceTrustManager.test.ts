import {
  WorkspaceTrustManager,
  getWorkspaceTrustManager,
} from '../../../src/utils/workspaceTrustManager';
import * as vscode from 'vscode';

// Mock vscode module
jest.mock('vscode');

describe('WorkspaceTrustManager', () => {
  let trustManager: WorkspaceTrustManager;
  let mockWorkspace: typeof vscode.workspace;
  let mockWindow: typeof vscode.window;
  let mockEnv: typeof vscode.env;
  let mockCommands: typeof vscode.commands;

  beforeEach(() => {
    jest.clearAllMocks();
    trustManager = WorkspaceTrustManager.getInstance();

    // Get references to mocked modules
    mockWorkspace = vscode.workspace as typeof vscode.workspace;
    mockWindow = vscode.window as typeof vscode.window;
    mockEnv = vscode.env as typeof vscode.env;
    mockCommands = vscode.commands as typeof vscode.commands;

    // Reset workspace to trusted state with folders by default
    (mockWorkspace as any).isTrusted = true;
    (mockWorkspace as any).workspaceFolders = [
      { uri: { fsPath: '/mock/workspace' }, name: 'mock-workspace', index: 0 },
    ];
  });

  describe('Singleton Pattern', () => {
    it('should return same instance', () => {
      const instance1 = WorkspaceTrustManager.getInstance();
      const instance2 = WorkspaceTrustManager.getInstance();
      const instance3 = getWorkspaceTrustManager();

      expect(instance1).toBe(instance2);
      expect(instance2).toBe(instance3);
    });
  });

  describe('isTrusted', () => {
    it('should return true when workspace is trusted', () => {
      (mockWorkspace as any).isTrusted = true;

      const result = trustManager.isTrusted();

      expect(result).toBe(true);
    });

    it('should return false when workspace is not trusted', () => {
      (mockWorkspace as any).isTrusted = false;

      const result = trustManager.isTrusted();

      expect(result).toBe(false);
    });
  });

  describe('hasWorkspace', () => {
    it('should return true when workspace folders exist', () => {
      (mockWorkspace as any).workspaceFolders = [
        { uri: { fsPath: '/test' }, name: 'test', index: 0 },
      ];

      const result = trustManager.hasWorkspace();

      expect(result).toBe(true);
    });

    it('should return false when no workspace folders exist', () => {
      (mockWorkspace as any).workspaceFolders = [];

      const result = trustManager.hasWorkspace();

      expect(result).toBe(false);
    });

    it('should return false when workspaceFolders is undefined', () => {
      (mockWorkspace as any).workspaceFolders = undefined;

      const result = trustManager.hasWorkspace();

      expect(result).toBe(false);
    });
  });

  describe('ensureTrustedWorkspace', () => {
    it('should return true immediately if workspace is already trusted', async () => {
      (mockWorkspace as any).isTrusted = true;

      const result = await trustManager.ensureTrustedWorkspace();

      expect(result).toBe(true);
      expect(mockWindow.showWarningMessage).not.toHaveBeenCalled();
    });

    it('should show modal when workspace is not trusted', async () => {
      (mockWorkspace as any).isTrusted = false;
      (mockWindow.showWarningMessage as jest.Mock).mockResolvedValue('Cancel');

      await trustManager.ensureTrustedWorkspace();

      expect(mockWindow.showWarningMessage).toHaveBeenCalledWith(
        expect.stringContaining('This operation requires a trusted workspace'),
        { modal: true },
        'Trust Workspace',
        'Learn More',
        'Cancel'
      );
    });

    it('should return false when user cancels', async () => {
      (mockWorkspace as any).isTrusted = false;
      (mockWindow.showWarningMessage as jest.Mock).mockResolvedValue('Cancel');

      const result = await trustManager.ensureTrustedWorkspace();

      expect(result).toBe(false);
    });

    it('should return false when user dismisses modal', async () => {
      (mockWorkspace as any).isTrusted = false;
      (mockWindow.showWarningMessage as jest.Mock).mockResolvedValue(undefined);

      const result = await trustManager.ensureTrustedWorkspace();

      expect(result).toBe(false);
    });

    it('should open trust dialog when user clicks Trust Workspace', async () => {
      (mockWorkspace as any).isTrusted = false;
      (mockWindow.showWarningMessage as jest.Mock).mockResolvedValue('Trust Workspace');
      (mockCommands.executeCommand as jest.Mock).mockResolvedValue(undefined);

      const result = await trustManager.ensureTrustedWorkspace();

      expect(mockCommands.executeCommand).toHaveBeenCalledWith('workbench.trust.manage');
      expect(result).toBe(true);
    });

    it('should open documentation when user clicks Learn More and then show modal again', async () => {
      (mockWorkspace as any).isTrusted = false;
      
      // First call returns "Learn More", second call returns "Cancel"
      (mockWindow.showWarningMessage as jest.Mock)
        .mockResolvedValueOnce('Learn More')
        .mockResolvedValueOnce('Cancel');
      
      (mockEnv.openExternal as jest.Mock).mockResolvedValue(true);

      const result = await trustManager.ensureTrustedWorkspace();

      expect(mockEnv.openExternal).toHaveBeenCalledWith(
        expect.objectContaining({
          // The Uri.parse is mocked, so we just check it was called
        })
      );
      expect(mockWindow.showWarningMessage).toHaveBeenCalledTimes(2);
      expect(result).toBe(false); // Second call returned Cancel
    });
  });

  describe('validateWorkspace', () => {
    it('should return true when workspace exists and is trusted', async () => {
      (mockWorkspace as any).isTrusted = true;
      (mockWorkspace as any).workspaceFolders = [{ uri: { fsPath: '/test' }, name: 'test', index: 0 }];

      const result = await trustManager.validateWorkspace();

      expect(result).toBe(true);
    });

    it('should return false and show error when no workspace is open', async () => {
      (mockWorkspace as any).workspaceFolders = undefined;
      (mockWindow.showErrorMessage as jest.Mock).mockResolvedValue(undefined);

      const result = await trustManager.validateWorkspace();

      expect(result).toBe(false);
      expect(mockWindow.showErrorMessage).toHaveBeenCalledWith(
        'No workspace is currently open. Please open a folder first.'
      );
    });

    it('should return false when workspace exists but is not trusted and user cancels', async () => {
      (mockWorkspace as any).isTrusted = false;
      (mockWorkspace as any).workspaceFolders = [{ uri: { fsPath: '/test' }, name: 'test', index: 0 }];
      (mockWindow.showWarningMessage as jest.Mock).mockResolvedValue('Cancel');

      const result = await trustManager.validateWorkspace();

      expect(result).toBe(false);
    });

    it('should return true when workspace exists but is not trusted and user grants trust', async () => {
      (mockWorkspace as any).isTrusted = false;
      (mockWorkspace as any).workspaceFolders = [{ uri: { fsPath: '/test' }, name: 'test', index: 0 }];
      (mockWindow.showWarningMessage as jest.Mock).mockResolvedValue('Trust Workspace');
      (mockCommands.executeCommand as jest.Mock).mockResolvedValue(undefined);

      const result = await trustManager.validateWorkspace();

      expect(result).toBe(true);
    });
  });

  describe('onDidGrantWorkspaceTrust', () => {
    it('should register event listener', () => {
      const callback = jest.fn();
      const mockDisposable = { dispose: jest.fn() };
      (mockWorkspace.onDidGrantWorkspaceTrust as jest.Mock).mockReturnValue(mockDisposable);

      const disposable = trustManager.onDidGrantWorkspaceTrust(callback);

      expect(mockWorkspace.onDidGrantWorkspaceTrust).toHaveBeenCalled();
      expect(disposable).toBe(mockDisposable);
    });

    it('should call callback when trust is granted', () => {
      const callback = jest.fn();
      let trustCallback: () => void = () => {};
      
      (mockWorkspace.onDidGrantWorkspaceTrust as jest.Mock).mockImplementation((cb) => {
        trustCallback = cb;
        return { dispose: jest.fn() };
      });

      trustManager.onDidGrantWorkspaceTrust(callback);
      
      // Simulate trust being granted
      trustCallback();

      expect(callback).toHaveBeenCalled();
    });
  });

  describe('Methods exist', () => {
    it('should have all required methods', () => {
      expect(typeof trustManager.isTrusted).toBe('function');
      expect(typeof trustManager.hasWorkspace).toBe('function');
      expect(typeof trustManager.ensureTrustedWorkspace).toBe('function');
      expect(typeof trustManager.validateWorkspace).toBe('function');
      expect(typeof trustManager.onDidGrantWorkspaceTrust).toBe('function');
    });
  });
});
