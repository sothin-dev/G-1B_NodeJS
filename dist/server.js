"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config"); // ← moved to line 1, replaces dotenv import + dotenv.config()
require("reflect-metadata");
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const database_1 = require("./config/database");
const error_middleware_1 = require("./middleware/error.middleware");
const index_routes_1 = __importDefault(require("./routes/index.routes"));
// Validate required environment variables at startup
const requiredEnvVars = ['JWT_SECRET', 'JWT_REFRESH_SECRET', 'DB_HOST', 'DB_NAME'];
const missing = requiredEnvVars.filter((v) => !process.env[v]);
if (missing.length > 0) {
    console.error(`Missing required env vars: ${missing.join(', ')}`);
    console.error('Please add them to your .env file. See .env.example for reference.');
    process.exit(1);
}
const app = (0, express_1.default)();
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.use('/api/v1', index_routes_1.default);
app.use(error_middleware_1.errorMiddleware);
const PORT = process.env.PORT || 5000;
database_1.AppDataSource.initialize()
    .then(() => {
    console.log('Database connected');
    app.listen(PORT, () => console.log(`Server running on port http://localhost:${PORT}`));
})
    .catch((err) => console.error('DB connection failed:', err));
exports.default = app;
