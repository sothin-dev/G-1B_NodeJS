"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const activity_log_service_1 = __importDefault(require("../services/activity-log.service"));
const api_response_1 = require("../utils/api-response");
class ActivityLogController {
    async listLogs(req, res, next) {
        try {
            const result = await activity_log_service_1.default.listLogs({
                search: req.query.search,
                action: req.query.action,
                dateFrom: req.query.dateFrom,
                dateTo: req.query.dateTo,
            });
            return (0, api_response_1.successResponse)(res, 'Activity logs retrieved', result);
        }
        catch (error) {
            next(error);
        }
    }
}
exports.default = new ActivityLogController();
