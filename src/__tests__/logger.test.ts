import { describe, it, expect, vi, beforeEach } from 'vitest';

const originalNodeEnv = process.env.NODE_ENV;

describe('logger', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('does not log when NODE_ENV is not development', async () => {
    process.env.NODE_ENV = 'production';
    
    vi.resetModules();
    const { logger } = await import('../lib/logger');
    
    const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
    logger.log('test');
    
    expect(consoleSpy).not.toHaveBeenCalled();
    consoleSpy.mockRestore();
    
    process.env.NODE_ENV = originalNodeEnv;
  });

  it('logs when NODE_ENV is development', async () => {
    process.env.NODE_ENV = 'development';
    
    vi.resetModules();
    const { logger } = await import('../lib/logger');
    
    const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
    logger.log('test message');
    
    expect(consoleSpy).toHaveBeenCalledWith('test message');
    consoleSpy.mockRestore();
    
    process.env.NODE_ENV = originalNodeEnv;
  });

  it('all methods call their respective console methods in development', async () => {
    process.env.NODE_ENV = 'development';
    
    vi.resetModules();
    const { logger } = await import('../lib/logger');
    
    const logSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const infoSpy = vi.spyOn(console, 'info').mockImplementation(() => {});
    const debugSpy = vi.spyOn(console, 'debug').mockImplementation(() => {});
    
    logger.log('log');
    logger.error('error');
    logger.warn('warn');
    logger.info('info');
    logger.debug('debug');
    
    expect(logSpy).toHaveBeenCalledWith('log');
    expect(errorSpy).toHaveBeenCalledWith('error');
    expect(warnSpy).toHaveBeenCalledWith('warn');
    expect(infoSpy).toHaveBeenCalledWith('info');
    expect(debugSpy).toHaveBeenCalledWith('debug');
    
    logSpy.mockRestore();
    errorSpy.mockRestore();
    warnSpy.mockRestore();
    infoSpy.mockRestore();
    debugSpy.mockRestore();
    
    process.env.NODE_ENV = originalNodeEnv;
  });
});
