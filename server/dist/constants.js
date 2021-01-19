"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FORGET_PASSWORD_PREFIX = exports.BACKEND_URL = exports.FRONTEND_URL = exports.COOKIE_NAME = exports.__prod__ = void 0;
exports.__prod__ = process.env.NODE_ENV === 'production';
exports.COOKIE_NAME = "quid";
exports.FRONTEND_URL = "http://localhost:3000";
exports.BACKEND_URL = "http://localhost:4000";
exports.FORGET_PASSWORD_PREFIX = "forget-password:";
//# sourceMappingURL=constants.js.map