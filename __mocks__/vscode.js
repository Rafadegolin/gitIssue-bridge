// Mock do VS Code API para testes
const mockOutputChannel = {
  appendLine: jest.fn(),
  append: jest.fn(),
  clear: jest.fn(),
  show: jest.fn(),
  hide: jest.fn(),
  dispose: jest.fn(),
  name: 'GitIssue Bridge',
};

const window = {
  createOutputChannel: jest.fn(() => mockOutputChannel),
  showInformationMessage: jest.fn(() => Promise.resolve(undefined)),
  showWarningMessage: jest.fn(() => Promise.resolve(undefined)),
  showErrorMessage: jest.fn(() => Promise.resolve(undefined)),
};

const workspace = {
  getConfiguration: jest.fn(() => ({
    get: jest.fn((key, defaultValue) => defaultValue),
  })),
};

const commands = {
  registerCommand: jest.fn(() => ({ dispose: jest.fn() })),
  executeCommand: jest.fn(() => Promise.resolve(undefined)),
};

const Uri = {
  file: jest.fn(path => ({ fsPath: path })),
  parse: jest.fn(path => ({ fsPath: path })),
};

const StatusBarAlignment = {
  Left: 1,
  Right: 2,
};

const ProgressLocation = {
  Notification: 15,
  Window: 10,
  SourceControl: 1,
};

module.exports = {
  window,
  workspace,
  commands,
  Uri,
  StatusBarAlignment,
  ProgressLocation,
};
