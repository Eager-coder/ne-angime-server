"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var express_1 = require("express");
var db_1 = require("../../config/db");
var bcryptjs_1 = __importDefault(require("bcryptjs"));
var jsonwebtoken_1 = require("jsonwebtoken");
var generateToken_1 = require("../../helpers/generateToken");
var router = express_1.Router();
router.post("/register", function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var stage, _a, username, firstname, lastname, users, existingUsername, error_1, _b, firstname, lastname, username, email, password1, password2, allUsernames, allEmails, hashedPassword, user, _c, access_token, refresh_token, error_2;
    var _d;
    return __generator(this, function (_e) {
        switch (_e.label) {
            case 0:
                stage = req.query.stage;
                if (!stage)
                    return [2 /*return*/, res.status(400).json({ message: "Please specify the stage" })];
                if (!(Number(stage) === 1)) return [3 /*break*/, 5];
                _e.label = 1;
            case 1:
                _e.trys.push([1, 3, , 4]);
                _a = req.body, username = _a.username, firstname = _a.firstname, lastname = _a.lastname;
                if (!firstname.trim() || !lastname.trim() || !username.trim())
                    return [2 /*return*/, res.status(400).json({ message: "Please fill all the fields" })];
                return [4 /*yield*/, db_1.pool.query("\n\t\t\t\tSELECT username FROM users WHERE username = $1\n\t\t\t", [username])];
            case 2:
                users = (_e.sent()).rows;
                existingUsername = (_d = users[0]) === null || _d === void 0 ? void 0 : _d.username;
                if (existingUsername && username === existingUsername)
                    return [2 /*return*/, res.status(400).json({ message: "User with this username already exists" })];
                return [2 /*return*/, res.status(200).json({ message: "Stage 1 passed!" })];
            case 3:
                error_1 = _e.sent();
                console.log("~REGISTER STAGE 1~", error_1);
                res.status(500).json({ message: "Oops! Something went wrong!" });
                return [3 /*break*/, 4];
            case 4: return [3 /*break*/, 12];
            case 5:
                if (!(Number(stage) === 2)) return [3 /*break*/, 12];
                _b = req.body, firstname = _b.firstname, lastname = _b.lastname, username = _b.username, email = _b.email, password1 = _b.password1, password2 = _b.password2;
                console.log(req.body);
                if (!(firstname === null || firstname === void 0 ? void 0 : firstname.trim()) ||
                    !(lastname === null || lastname === void 0 ? void 0 : lastname.trim()) ||
                    !(username === null || username === void 0 ? void 0 : username.trim()) ||
                    !(email === null || email === void 0 ? void 0 : email.trim()) ||
                    !(password1 === null || password1 === void 0 ? void 0 : password1.trim()) ||
                    !(password2 === null || password2 === void 0 ? void 0 : password2.trim()))
                    return [2 /*return*/, res.status(400).json({ message: "Please fill all the fields" })];
                if (username.includes("&"))
                    return [2 /*return*/, res.status(400).json({ message: "Do not add '&' symbol in the username" })];
                if (password1 !== password2)
                    return [2 /*return*/, res.status(400).json({ message: "Passwords don't match" })];
                if (password1.length < 8)
                    return [2 /*return*/, res.status(400).json({ message: "Password must be at least 8 characters long" })];
                _e.label = 6;
            case 6:
                _e.trys.push([6, 11, , 12]);
                return [4 /*yield*/, db_1.pool.query("\n      SELECT username from users WHERE username = $1\n    ", [username])];
            case 7:
                allUsernames = (_e.sent()).rows;
                if (allUsernames.length)
                    return [2 /*return*/, res.status(400).json({ message: "Username already exists" })];
                return [4 /*yield*/, db_1.pool.query("\n      SELECT email from users WHERE email = $1\n    ", [email])];
            case 8:
                allEmails = (_e.sent()).rows;
                if (allEmails.length)
                    return [2 /*return*/, res.status(400).json({ message: "Email already exists" })];
                hashedPassword = bcryptjs_1.default.hashSync(password1, 12);
                return [4 /*yield*/, db_1.pool.query("\n\t\t\t\tINSERT INTO users \n\t\t\t\t(username, firstname, lastname, email, password) \n\t\t\t\tVALUES ($1, $2, $3, $4, $5) \n\t\t\t\tRETURNING user_id\n\t\t\t", [username, firstname, lastname, email, hashedPassword])];
            case 9:
                user = (_e.sent()).rows[0];
                _c = generateToken_1.generateTokens({
                    user_id: user.user_id,
                    username: username,
                    email: email,
                }), access_token = _c.access_token, refresh_token = _c.refresh_token;
                return [4 /*yield*/, db_1.pool.query("\n\t\t\tINSERT INTO refresh_tokens (user_id, refresh_token) \n\t\t\tVALUES ($1, $2)", [user.user_id, refresh_token])];
            case 10:
                _e.sent();
                res.json({
                    message: "Welcome to Ne Angime!",
                    data: {
                        username: username,
                        firstname: firstname,
                        lastname: lastname,
                        email: email,
                        user_id: user.user_id,
                        access_token: access_token,
                        refresh_token: refresh_token,
                    },
                });
                return [3 /*break*/, 12];
            case 11:
                error_2 = _e.sent();
                console.log(error_2);
                res.status(500).json({ message: "Oops! Something went wrong!" });
                return [3 /*break*/, 12];
            case 12: return [2 /*return*/];
        }
    });
}); });
router.post("/login", function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var _a, username, password, rows, _b, hashedPassword, user_id, email, firstname, lastname, avatar, _c, access_token, refresh_token, error_3;
    return __generator(this, function (_d) {
        switch (_d.label) {
            case 0:
                _d.trys.push([0, 3, , 4]);
                _a = req.body, username = _a.username, password = _a.password;
                if (!username || !password)
                    return [2 /*return*/, res.status(400).json({ message: "Please fill all the fields" })];
                return [4 /*yield*/, db_1.pool.query("SELECT * FROM users WHERE username = $1", [username])];
            case 1:
                rows = (_d.sent()).rows;
                if (!rows.length)
                    return [2 /*return*/, res.status(400).json({ message: "User does not exist" })];
                _b = rows[0], hashedPassword = _b.password, user_id = _b.user_id, email = _b.email, firstname = _b.firstname, lastname = _b.lastname, avatar = _b.avatar;
                if (!bcryptjs_1.default.compareSync(password, hashedPassword))
                    return [2 /*return*/, res.status(400).json({ message: "Password is incorrect" })];
                _c = generateToken_1.generateTokens({ user_id: user_id, username: username, email: email }), access_token = _c.access_token, refresh_token = _c.refresh_token;
                return [4 /*yield*/, db_1.pool.query("\n\t\t\tINSERT INTO refresh_tokens (user_id, refresh_token) \n\t\t\tVALUES ($1, $2)", [user_id, refresh_token])];
            case 2:
                _d.sent();
                return [2 /*return*/, res.json({
                        message: "Welcome back!",
                        data: { username: username, firstname: firstname, lastname: lastname, email: email, avatar: avatar, user_id: user_id, access_token: access_token, refresh_token: refresh_token },
                    })];
            case 3:
                error_3 = _d.sent();
                console.log("LOGIN", error_3);
                res.status(500).json({ message: "Oops! Something went wrong!" });
                return [3 /*break*/, 4];
            case 4: return [2 /*return*/];
        }
    });
}); });
router.delete("/logout", function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var refresh_token, user_id, error_4;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                refresh_token = req.body.refresh_token;
                user_id = jsonwebtoken_1.verify(refresh_token, process.env.REFRESH_TOKEN_SECRET).user_id;
                return [4 /*yield*/, db_1.pool.query("\n\t\tDELETE FROM \n\t\t\trefresh_tokens \n\t\tWHERE \n\t\t\tuser_id = $1 AND refresh_token = $2", [user_id, refresh_token])];
            case 1:
                _a.sent();
                res.json({ message: "You are logged out" });
                return [3 /*break*/, 3];
            case 2:
                error_4 = _a.sent();
                console.log("LOGOUT", error_4.message);
                res.status(500).json({ message: "Oops! Something went wrong!" });
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); });
router.post("/refresh_token", function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var refresh_token, user, existingToken, _a, access_token, newrefresh_token, error_5;
    var _b;
    return __generator(this, function (_c) {
        switch (_c.label) {
            case 0:
                _c.trys.push([0, 3, , 4]);
                refresh_token = req.body.refresh_token;
                user = jsonwebtoken_1.verify(refresh_token, process.env.REFRESH_TOKEN_SECRET);
                return [4 /*yield*/, db_1.pool.query("SELECT * FROM refresh_tokens\n\t\t \t WHERE user_id = $1 AND refresh_token = $2", [user.user_id, refresh_token])];
            case 1:
                existingToken = (_c.sent()).rows;
                if (((_b = existingToken[0]) === null || _b === void 0 ? void 0 : _b.refresh_token) !== refresh_token) {
                    return [2 /*return*/, res.status(401).json({ message: "Unauthorized" })];
                }
                _a = generateToken_1.generateTokens(user), access_token = _a.access_token, newrefresh_token = _a.refresh_token;
                return [4 /*yield*/, db_1.pool.query("UPDATE refresh_tokens SET refresh_token = $1 \n\t\t\t WHERE user_id = $2 AND refresh_token = $3", [newrefresh_token, user.user_id, refresh_token])];
            case 2:
                _c.sent();
                console.log(user);
                res.json({ data: { access_token: access_token, refresh_token: newrefresh_token } });
                return [3 /*break*/, 4];
            case 3:
                error_5 = _c.sent();
                console.log(error_5.message);
                res.status(401).json({ message: "Unauthorized" });
                return [3 /*break*/, 4];
            case 4: return [2 /*return*/];
        }
    });
}); });
exports.default = router;
