"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const activity_log_controller_1 = __importDefault(require("../controllers/activity-log.controller"));
const auth_middleware_1 = __importDefault(require("../middleware/auth.middleware"));
const role_middleware_1 = require("../middleware/role.middleware");
const roles_1 = require("../constants/roles");
const router = (0, express_1.Router)();
router.get('/', auth_middleware_1.default, (0, role_middleware_1.authorizeRoles)(roles_1.Roles.SUPER_ADMIN), activity_log_controller_1.default.listLogs);
exports.default = router;
