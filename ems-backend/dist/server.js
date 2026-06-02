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
