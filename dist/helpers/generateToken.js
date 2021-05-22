"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateTokens = void 0;
var jsonwebtoken_1 = require("jsonwebtoken");
var generateTokens = function (user) {
    var user_id = user.user_id, username = user.username, email = user.email;
    var accessToken = jsonwebtoken_1.sign({ user_id: user_id, email: email, username: username }, process.env.ACCESS_TOKEN_SECRET, {
        expiresIn: "5m",
    });
    var refreshToken = jsonwebtoken_1.sign({ user_id: user_id }, process.env.REFRESH_TOKEN_SECRET, {
        expiresIn: "10m",
    });
    return { accessToken: accessToken, refreshToken: refreshToken };
};
exports.generateTokens = generateTokens;
