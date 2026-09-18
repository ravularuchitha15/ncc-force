require('dotenv').config();
const app = require('./src/app');
const { connectDB, disconnectDB } = require('./src/config/db');

const PORT = process.env.PORT || 5000;

// Connect to Database and start server
const startServer = async () => {
  try {
    await connectDB();

    const server = app.listen(PORT, () => {
      console.log('====================================================');
      console.log(` SMART NCC CADET MANAGEMENT SYSTEM — BACKEND API `);
      console.log(` Environment : ${process.env.NODE_ENV || 'development'}`);
      console.log(` Server Port : ${PORT}`);
      console.log(` Health Check: http://localhost:${PORT}/api/health`);
      console.log('====================================================');
    });

    // Graceful shutdown handling
    const shutdown = async (signal) => {
      console.log(`\n[Server] Received ${signal}. Gracefully terminating...`);
      server.close(async () => {
        console.log('[Server] HTTP server closed.');
        await disconnectDB();
        process.exit(0);
      });

      // Force terminate after 10s if graceful shutdown hangs
      setTimeout(() => {
        console.error('[Server] Forced shutdown due to timeout.');
        process.exit(1);
      }, 10000);
    };

    process.on('SIGINT', () => shutdown('SIGINT'));
    process.on('SIGTERM', () => shutdown('SIGTERM'));

    process.on('unhandledRejection', (err) => {
      console.error('[Server] Unhandled Promise Rejection:', err);
    });

    process.on('uncaughtException', (err) => {
      console.error('[Server] Uncaught Exception:', err);
      process.exit(1);
    });
  } catch (error) {
    console.error(`[Server] Failed to initialize server: ${error.message}`);
    process.exit(1);
  }
};

startServer();
