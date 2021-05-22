"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCookieExpDate = exports.getUnixTime = void 0;
var getUnixTime = function () {
    return Math.floor(Date.now() / 1000);
};
exports.getUnixTime = getUnixTime;
var getCookieExpDate = function () {
    return new Date(Date.now() + 14 * 86400 * 1000);
};
exports.getCookieExpDate = getCookieExpDate;
