"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.errors = exports.AppError = void 0;
var AppError = /** @class */ (function (_super) {
    __extends(AppError, _super);
    function AppError(statusCode, code, message) {
        var _this = _super.call(this, message) || this;
        _this.statusCode = statusCode;
        _this.code = code;
        _this.name = 'AppError';
        return _this;
    }
    return AppError;
}(Error));
exports.AppError = AppError;
exports.errors = {
    unauthorized: function (message) {
        if (message === void 0) { message = 'Sin sesión'; }
        return new AppError(401, 'UNAUTHORIZED', message);
    },
    notFound: function (message) {
        if (message === void 0) { message = 'Recurso no encontrado'; }
        return new AppError(404, 'NOT_FOUND', message);
    },
    invalidCredentials: function () { return new AppError(401, 'INVALID_CREDENTIALS', 'Credenciales inválidas'); },
    emailTaken: function () { return new AppError(409, 'EMAIL_TAKEN', 'El email ya existe'); },
    linkExists: function () { return new AppError(409, 'LINK_EXISTS', 'Ya existe un vínculo activo: desvincula primero'); },
    linkInvalid: function (message) {
        if (message === void 0) { message = 'Código o documento inválidos'; }
        return new AppError(401, 'LINK_INVALID', message);
    },
    noActiveLink: function (message) {
        if (message === void 0) { message = 'Sin vínculo activo con ninguna IPS'; }
        return new AppError(409, 'NO_ACTIVE_LINK', message);
    },
    ipsUnavailable: function (message) {
        if (message === void 0) { message = 'La IPS no respondió'; }
        return new AppError(503, 'IPS_UNAVAILABLE', message);
    },
    validation: function (message) { return new AppError(422, 'VALIDATION', message); },
    internal: function (message) {
        if (message === void 0) { message = 'Error interno'; }
        return new AppError(500, 'INTERNAL', message);
    },
};
