"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const config_service_js_1 = require("../config/config.service.js");
const connectDb = async (port, app) => {
    try {
        await mongoose_1.default.connect(config_service_js_1.DB_URI);
        app.listen(port, () => {
            console.log(`Server is running on port ${port}`);
        });
        console.log("Connected to MongoDB");
    }
    catch (error) {
        console.error("Error:", error);
    }
};
exports.default = connectDb;
//# sourceMappingURL=connectDB.js.map