import * as dotenv from "dotenv";
dotenv.config();

import "reflect-metadata";
import express from "express";
import { AppDataSource } from "./config/database";
import logger from "./config/logger"; // assuming you have Winston setup
import { env } from "./config/env";

const app = express();
app.use(express.json());

// Health check endpoint
app.get("/health", (req, res) => res.json({ status: "ok", timestamp: new Date() }));

// Start server only after DB connection
AppDataSource.initialize()
  .then(() => {
    logger.info("Database connected successfully");
    const server = app.listen(env.port, () => {
      logger.info(`Server running on http://localhost:${env.port}`);
    });

    // Graceful shutdown
    const shutdown = async (signal: string) => {
      logger.info(`${signal} received, closing server...`);
      server.close(async () => {
        await AppDataSource.destroy();
        logger.info("Database connection closed");
        process.exit(0);
      });
    };

    process.on("SIGTERM", () => shutdown("SIGTERM"));
    process.on("SIGINT", () => shutdown("SIGINT"));
  })
  .catch((err: unknown) => {
    logger.error("Database connection failed:", err);
    process.exit(1);
  });