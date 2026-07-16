import { describe, it, expect, vi } from 'vitest';

describe('logger', () => {
  it('exports all required methods', async () => {
    const { logger } = await import('@/lib/logger');
    
    expect(typeof logger.log).toBe('function');
    expect(typeof logger.warn).toBe('function');
    expect(typeof logger.error).toBe('function');
    expect(typeof logger.info).toBe('function');
    expect(typeof logger.debug).toBe('function');
  });

  it('methods can be called without throwing', async () => {
    const { logger } = await import('@/lib/logger');
    
    expect(() => logger.log('test')).not.toThrow();
    expect(() => logger.warn('test')).not.toThrow();
    expect(() => logger.error('test')).not.toThrow();
    expect(() => logger.info('test')).not.toThrow();
    expect(() => logger.debug('test')).not.toThrow();
  });

  it('handles multiple arguments', async () => {
    const { logger } = await import('@/lib/logger');
    
    expect(() => logger.log('arg1', 'arg2', { key: 'value' })).not.toThrow();
  });
});
