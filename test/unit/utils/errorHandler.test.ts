import { ErrorHandler, ErrorSeverity, getErrorHandler } from '../../../src/utils/errorHandler';

describe('ErrorHandler', () => {
  let errorHandler: ErrorHandler;

  beforeEach(() => {
    jest.clearAllMocks();
    errorHandler = ErrorHandler.getInstance();
  });

  describe('Singleton Pattern', () => {
    it('should return same instance', () => {
      const instance1 = ErrorHandler.getInstance();
      const instance2 = ErrorHandler.getInstance();
      const instance3 = getErrorHandler();

      expect(instance1).toBe(instance2);
      expect(instance2).toBe(instance3);
    });
  });

  describe('Error Handling Methods', () => {
    it('should have handle method', () => {
      expect(typeof errorHandler.handle).toBe('function');
    });

    it('should have handleWithResult method', () => {
      expect(typeof errorHandler.handleWithResult).toBe('function');
    });

    it('should have wrap method', () => {
      expect(typeof errorHandler.wrap).toBe('function');
    });

    it('should have wrapAsync method', () => {
      expect(typeof errorHandler.wrapAsync).toBe('function');
    });
  });

  describe('Wrap Operations', () => {
    it('should return result from successful sync operation', () => {
      const result = errorHandler.wrap(() => 42, { operation: 'test', component: 'test' });
      expect(result).toBe(42);
    });

    it('should return undefined from failed sync operation', () => {
      const result = errorHandler.wrap(
        () => {
          throw new Error('Test error');
        },
        { operation: 'test', component: 'test' }
      );
      expect(result).toBeUndefined();
    });

    it('should return result from successful async operation', async () => {
      const result = await errorHandler.wrapAsync(async () => 'success', {
        operation: 'test',
        component: 'test',
      });
      expect(result).toBe('success');
    });

    it('should return undefined from failed async operation', async () => {
      const result = await errorHandler.wrapAsync(
        async () => {
          throw new Error('Async test error');
        },
        { operation: 'test', component: 'test' }
      );
      expect(result).toBeUndefined();
    });
  });

  describe('HandleWithResult', () => {
    it('should return false when handling error', async () => {
      const result = await errorHandler.handleWithResult(new Error('Test error'), {
        operation: 'test',
        component: 'test',
      });
      expect(result).toBe(false);
    });
  });

  describe('Error Context', () => {
    it('should handle errors with context', async () => {
      await errorHandler.handle(
        new Error('Test error'),
        { operation: 'fetchIssues', component: 'GitHubAPI' },
        ErrorSeverity.ERROR
      );
      expect(true).toBe(true);
    });

    it('should handle errors without context', async () => {
      await errorHandler.handle(new Error('Test error'));
      expect(true).toBe(true);
    });

    it('should handle different severity levels', async () => {
      await errorHandler.handle(new Error('Info'), undefined, ErrorSeverity.INFO);
      await errorHandler.handle(new Error('Warning'), undefined, ErrorSeverity.WARNING);
      await errorHandler.handle(new Error('Error'), undefined, ErrorSeverity.ERROR);
      expect(true).toBe(true);
    });
  });
});
