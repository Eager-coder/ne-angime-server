"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
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
Object.defineProperty(exports, "__esModule", { value: true });
var express_1 = require("express");
var auth_middlware_1 = require("../../middlewares/auth.middlware");
var db_1 = require("../../config/db");
var router = express_1.Router();
router.post("/request/:addressee_id", auth_middlware_1.verifyAuth, function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var addressee_id, user_id, existingLink, error_1;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 3, , 4]);
                addressee_id = req.params.addressee_id;
                user_id = res.locals.user.user_id;
                if (Number(addressee_id) === Number(user_id)) {
                    return [2 /*return*/, res.status(400).json({ message: "Can't request to yourself" })];
                }
                return [4 /*yield*/, db_1.pool.query("\n\t\tSELECT * FROM friends \n\t\tWHERE \n\t\t\t(requester_id = $1 AND addressee_id = $2) \n\t\tOR\n\t\t\t(requester_id = $2 AND addressee_id = $1)", [user_id, addressee_id])];
            case 1:
                existingLink = (_a.sent()).rows;
                if (existingLink.length) {
                    if (existingLink[0].requester_id == user_id && !existingLink[0].is_approved) {
                        return [2 /*return*/, res.status(400).json({ message: "Request already sent" })];
                    }
                    if (existingLink[0].requester_id == user_id && existingLink[0].is_approved) {
                        return [2 /*return*/, res.status(400).json({ message: "You are already friends" })];
                    }
                    if (existingLink[0].addressee_id == user_id && !existingLink[0].is_approved) {
                        return [2 /*return*/, res.status(400).json({ message: "The user has already sent you a request" })];
                    }
                    if (existingLink[0].addressee_id == user_id && existingLink[0].is_approved) {
                        return [2 /*return*/, res.status(400).json({ message: "You are already friends" })];
                    }
                }
                return [4 /*yield*/, db_1.pool.query("\n    INSERT INTO friends \n      (requester_id, addressee_id, is_approved) \n    VALUES\n      ($1, $2, FALSE)\n  ", [user_id, addressee_id])];
            case 2:
                _a.sent();
                res.json({ message: "Request has sent" });
                return [3 /*break*/, 4];
            case 3:
                error_1 = _a.sent();
                console.log("ADD TO FRIENDS REQUEST", error_1.message);
                res.status(500).json({ message: "Oops! Something went wrong." });
                return [3 /*break*/, 4];
            case 4: return [2 /*return*/];
        }
    });
}); });
router.get("/all", auth_middlware_1.verifyAuth, function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var user_id, userList, incoming_requests, error_2;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 3, , 4]);
                user_id = res.locals.user.user_id;
                return [4 /*yield*/, db_1.pool.query("\n\t\tSELECT \n\t\t\tusers.user_id as user_id, users.username, firstname, lastname, avatar, is_approved \n\t\tFROM \n\t\t\tfriends \n\t\tLEFT JOIN \n\t\t\tusers\n\t\tON addressee_id = users.user_id\n\t\tWHERE friends.requester_id = $1 \n\t\t", [user_id])];
            case 1:
                userList = (_a.sent()).rows;
                return [4 /*yield*/, db_1.pool.query("\n\t\tSELECT \n\t\t\tusers.user_id as user_id, users.username, users.username, firstname, lastname, avatar, is_approved \n\t\tFROM \n\t\t\tfriends \n\t\tLEFT JOIN \n\t\t\tusers\n\t\tON requester_id = users.user_id\n\t\tWHERE friends.addressee_id = $1 AND is_approved = FALSE\n\t\t", [user_id])];
            case 2:
                incoming_requests = (_a.sent()).rows;
                res.json({
                    data: {
                        friends: userList
                            .filter(function (user) { return user.is_approved; })
                            .map(function (user) { return (__assign(__assign({}, user), { status: "friend" })); }),
                        outcoming_requests: userList
                            .filter(function (user) { return !user.is_approved; })
                            .map(function (user) { return (__assign(__assign({}, user), { status: "outcoming_request" })); }),
                        incoming_requests: incoming_requests.map(function (user) { return (__assign(__assign({}, user), { status: "incoming_request" })); }),
                    },
                });
                return [3 /*break*/, 4];
            case 3:
                error_2 = _a.sent();
                console.log("GET ALL FRIENDS", error_2.message);
                res.status(500).json({ message: "Oops! Something went wrong." });
                return [3 /*break*/, 4];
            case 4: return [2 /*return*/];
        }
    });
}); });
router.post("/approve/:requester_id", auth_middlware_1.verifyAuth, function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var requester_id, user_id, existingLink, error_3;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 4, , 5]);
                requester_id = req.params.requester_id;
                user_id = res.locals.user.user_id;
                if (Number(requester_id) === Number(user_id)) {
                    return [2 /*return*/, res.status(400).json({ message: "Can't request to yourself" })];
                }
                return [4 /*yield*/, db_1.pool.query("\n\t\t\tSELECT * FROM friends \n\t\t\tWHERE requester_id = $1 AND addressee_id = $2\n\t\t\t", [requester_id, user_id])];
            case 1:
                existingLink = (_a.sent()).rows;
                if (!existingLink.length)
                    return [2 /*return*/, res.status(400).json({ message: "No friend request was found on that user" })];
                if (existingLink.length && existingLink[0].is_approved)
                    return [2 /*return*/, res.status(400).json({ message: "The user is already in your friend list" })];
                return [4 /*yield*/, db_1.pool.query("\n\t\t\tUPDATE friends SET is_approved = TRUE \n\t\t\tWHERE requester_id = $1 AND addressee_id = $2\n\t\t", [requester_id, user_id])];
            case 2:
                _a.sent();
                return [4 /*yield*/, db_1.pool.query("\n    INSERT INTO friends \n      (requester_id, addressee_id, is_approved) \n    VALUES\n      ($1, $2, TRUE)\n\t\t ON CONFLICT (requester_id, addressee_id) \n\t\t DO UPDATE SET is_approved = TRUE\n  ", [user_id, requester_id])];
            case 3:
                _a.sent();
                res.json({ message: "You are now friends" });
                return [3 /*break*/, 5];
            case 4:
                error_3 = _a.sent();
                console.log("APPROVE FRIEND", error_3.message);
                res.status(500).json({ message: "Oops! Something went wrong." });
                return [3 /*break*/, 5];
            case 5: return [2 /*return*/];
        }
    });
}); });
router.delete("/remove/:friend_id", auth_middlware_1.verifyAuth, function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var friend_id, user_id, existingLink, error_4;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 4, , 5]);
                friend_id = req.params.friend_id;
                user_id = res.locals.user.user_id;
                if (user_id == friend_id) {
                    return [2 /*return*/, res.status(400).json({ message: "Can't delete yourself from user list" })];
                }
                return [4 /*yield*/, db_1.pool.query("\n\t\tSELECT * FROM friends \n\t\tWHERE requester_id = $1 AND addressee_id = $2 AND is_approved = TRUE", [user_id, friend_id])];
            case 1:
                existingLink = (_a.sent()).rows;
                if (!existingLink.length) {
                    return [2 /*return*/, res.status(400).json({ message: "The user is not in your friend list" })];
                }
                return [4 /*yield*/, db_1.pool.query("\n\t\t\tUPDATE friends SET is_approved = FALSE \n\t\t\tWHERE requester_id = $1 AND addressee_id = $2", [friend_id, user_id])];
            case 2:
                _a.sent();
                return [4 /*yield*/, db_1.pool.query("\n\t\t\tDELETE FROM friends \n\t\t\tWHERE requester_id = $1 AND addressee_id = $2", [user_id, friend_id])];
            case 3:
                _a.sent();
                res.json({ message: "User removed from friend list" });
                return [3 /*break*/, 5];
            case 4:
                error_4 = _a.sent();
                console.log("DELETE FRIEND", error_4.message);
                res.status(500).json({ message: "Oops! Something went wrong." });
                return [3 /*break*/, 5];
            case 5: return [2 /*return*/];
        }
    });
}); });
router.delete("/cancel_request/:addressee_id", auth_middlware_1.verifyAuth, function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var user_id, addressee_id, existingLink, error_5;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 3, , 4]);
                user_id = res.locals.user.user_id;
                addressee_id = req.params.addressee_id;
                return [4 /*yield*/, db_1.pool.query("\n\tSELECT * FROM friends \n\tWHERE requester_id = $1 AND addressee_id = $2 \n\tAND is_approved = FALSE", [user_id, addressee_id])];
            case 1:
                existingLink = (_a.sent()).rows;
                if (!existingLink.length) {
                    return [2 /*return*/, res.status(400).json({ message: "You haven't send request to the user" })];
                }
                return [4 /*yield*/, db_1.pool.query("\n\tDELETE from friends WHERE \n\trequester_id = $1 AND addressee_id = $2 \n\tAND is_approved = FALSE", [user_id, addressee_id])];
            case 2:
                _a.sent();
                res.json({ message: "Request has calceled" });
                return [3 /*break*/, 4];
            case 3:
                error_5 = _a.sent();
                console.log("CANCEL REQUEST", error_5.message);
                res.status(500).json({ message: "Oops! Something went wrong." });
                return [3 /*break*/, 4];
            case 4: return [2 /*return*/];
        }
    });
}); });
exports.default = router;
// STATUESES
// friend
// incoming_request
// outcoming_request
