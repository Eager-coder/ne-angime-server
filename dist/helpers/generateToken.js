"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateTokens = void 0;
var jsonwebtoken_1 = require("jsonwebtoken");
var generateTokens = function (user) {
    var user_id = user.user_id, username = user.username, email = user.email;
    var access_token = jsonwebtoken_1.sign({ user_id: user_id, email: email, username: username }, process.env.ACCESS_TOKEN_SECRET, {
        expiresIn: "10s",
    });
    var refresh_token = jsonwebtoken_1.sign({ user_id: user_id }, process.env.REFRESH_TOKEN_SECRET, {
        expiresIn: "30d",
    });
    return { access_token: access_token, refresh_token: refresh_token };
};
exports.generateTokens = generateTokens;
