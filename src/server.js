const app = require('./app');
const sequelize = require('./config/database');
const env = require('./config/env');
const registerGlobalExceptionHandlers = require('./middleware/global-exception-handler');

let server;
let isShuttingDown = false;

async function startServer() {
  try {
    await sequelize.authenticate();

    server = app.listen(env.port, () => {
      console.log(`Server running on port ${env.port} in ${env.nodeEnv} mode`);
    });
  } catch (error) {
    console.error('Unable to start server:', error);
    await shutdown('startupFailure', 1);
  }
}

async function shutdown(reason, exitCode = 0) {
  if (isShuttingDown) return;
  isShuttingDown = true;

  console.log(`${reason} received. Shutting down gracefully.`);

  try {
    if (server) {
      await new Promise((resolve, reject) => {
        server.close((error) => (error ? reject(error) : resolve()));
      });
    }

    await sequelize.close();
  } catch (error) {
    console.error('Error during graceful shutdown:', error);
    exitCode = 1;
  } finally {
    process.exit(exitCode);
  }
}

registerGlobalExceptionHandlers({
  shutdown,
  logger: console,
});

startServer();
