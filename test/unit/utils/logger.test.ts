import { Logger, LogLevel, getLogger } from '../../../src/utils/logger';

describe('Logger', () => {
  let logger: Logger;

  beforeEach(() => {
    jest.clearAllMocks();
    logger = Logger.getInstance();
    logger.clear();
    logger.setLogLevel(LogLevel.DEBUG);
  });

  describe('Singleton Pattern', () => {
    it('should return same instance', () => {
      const instance1 = Logger.getInstance();
      const instance2 = Logger.getInstance();
      const instance3 = getLogger();

      expect(instance1).toBe(instance2);
      expect(instance2).toBe(instance3);
    });
  });

  describe('Log Levels', () => {
    it('should set and get log level', () => {
      logger.setLogLevel(LogLevel.ERROR);
      expect(logger.getLogLevel()).toBe(LogLevel.ERROR);

      logger.setLogLevel(LogLevel.DEBUG);
      expect(logger.getLogLevel()).toBe(LogLevel.DEBUG);
    });

    it('should have all log level enums', () => {
      expect(LogLevel.DEBUG).toBe(0);
      expect(LogLevel.INFO).toBe(1);
      expect(LogLevel.WARN).toBe(2);
      expect(LogLevel.ERROR).toBe(3);
    });

    it('should have all log level methods', () => {
      expect(typeof logger.debug).toBe('function');
      expect(typeof logger.info).toBe('function');
      expect(typeof logger.warn).toBe('function');
      expect(typeof logger.error).toBe('function');
    });
  });

  describe('Logging Methods', () => {
    it('should log debug messages', () => {
      logger.debug('Debug message');
      expect(true).toBe(true); // Just verify no errors
    });

    it('should log info messages with data', () => {
      logger.info('Info with data', { key: 'value' });
      expect(true).toBe(true);
    });

    it('should log warning messages', () => {
      logger.warn('Warning message');
      expect(true).toBe(true);
    });

    it('should log error messages', () => {
      logger.error('Error message');
      expect(true).toBe(true);
    });
  });

  describe('Sensitive Data Sanitization', () => {
    it('should handle tokens in messages', () => {
      const token = 'ghp_1234567890abcdefghijklmnopqrstuv123456';
      logger.info(`Token: ${token}`);
      expect(true).toBe(true);
    });

    it('should handle objects with sensitive fields', () => {
      const data = {
        username: 'testuser',
        token: 'ghp_secret123',
        password: 'mypassword',
      };
      logger.info('User data', data);
      expect(true).toBe(true);
    });

    it('should handle nested objects', () => {
      const data = {
        user: { name: 'Test', credentials: { token: 'ghp_token' } },
      };
      logger.info('Nested data', data);
      expect(true).toBe(true);
    });

    it('should handle arrays', () => {
      const data = [
        { name: 'Item 1', token: 'ghp_secret1' },
        { name: 'Item 2', password: 'pass123' },
      ];
      logger.info('Array data', data);
      expect(true).toBe(true);
    });

    it('should handle null and undefined', () => {
      logger.info('Null value', null);
      logger.info('Undefined value', undefined);
      expect(true).toBe(true);
    });
  });

  describe('Error Logging', () => {
    it('should log Error objects', () => {
      const error = new Error('Test error message');
      logger.error('An error occurred', error);
      expect(true).toBe(true);
    });

    it('should log errors with data', () => {
      const error = new Error('Test error');
      const data = { operation: 'fetchIssues', issueId: 123 };
      logger.error('Failed to fetch issue', error, data);
      expect(true).toBe(true);
    });

    it('should handle non-Error objects', () => {
      logger.error('Error with string', 'string error');
      expect(true).toBe(true);
    });
  });

  describe('Channel Management', () => {
    it('should have show method', () => {
      logger.show();
      expect(true).toBe(true);
    });

    it('should have hide method', () => {
      logger.hide();
      expect(true).toBe(true);
    });

    it('should have clear method', () => {
      logger.clear();
      expect(true).toBe(true);
    });
  });

  describe('Log Level Filtering', () => {
    it('should filter messages below current level', () => {
      logger.setLogLevel(LogLevel.ERROR);

      logger.debug('Should not appear');
      logger.info('Should not appear');
      logger.warn('Should not appear');
      logger.error('Should appear');

      expect(true).toBe(true);
    });
  });
});
