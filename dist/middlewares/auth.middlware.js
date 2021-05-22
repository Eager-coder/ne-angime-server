"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyAuth = void 0;
var jsonwebtoken_1 = require("jsonwebtoken");
var verifyAuth = function (req, res, next) {
    var _a, _b;
    try {
        console.log("Access Token", (_a = req.headers.authorization) === null || _a === void 0 ? void 0 : _a.split(" ")[1]);
        var token = (_b = req.headers.authorization) === null || _b === void 0 ? void 0 : _b.split(" ")[1];
        if (!token)
            return res.status(401).json({ message: "Unautorized" });
        var decoded = jsonwebtoken_1.verify(token, process.env.ACCESS_TOKEN_SECRET);
        res.locals.user = decoded;
        next();
    }
    catch (e) {
        console.error("VERIFY AUTH", e.message);
        res.status(401).json({ message: "Unautorized" });
    }
};
exports.verifyAuth = verifyAuth;
