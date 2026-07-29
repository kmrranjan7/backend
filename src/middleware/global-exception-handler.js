function registerGlobalExceptionHandlers({ shutdown, logger = console }) {
  if (typeof shutdown !== 'function') {
    throw new TypeError('shutdown must be a function');
  }

  process.on('uncaughtException', (error) => {
    logger.error('Uncaught exception:', error);
    void shutdown('uncaughtException', 1);
  });

  process.on('unhandledRejection', (reason) => {
    const error = reason instanceof Error ? reason : new Error(String(reason));
    logger.error('Unhandled promise rejection:', error);
    void shutdown('unhandledRejection', 1);
  });

  process.on('SIGTERM', () => {
    void shutdown('SIGTERM', 0);
  });

  process.on('SIGINT', () => {
    void shutdown('SIGINT', 0);
  });
}

module.exports = registerGlobalExceptionHandlers;
