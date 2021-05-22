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
Object.defineProperty(exports, "__esModule", { value: true });
var express_1 = require("express");
var auth_middlware_1 = require("../../middlewares/auth.middlware");
var db_1 = require("../../config/db");
var router = express_1.Router();
router.post("/request/:addressee_id", auth_middlware_1.verifyAuth, function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var addressee_id, user_id, existingLink;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                addressee_id = req.params.addressee_id;
                user_id = res.locals.user.user_id;
                if (Number(addressee_id) === Number(user_id)) {
                    return [2 /*return*/, res.status(400).json({ message: "Can't request to yourself" })];
                }
                return [4 /*yield*/, db_1.pool.query("\n\t\tSELECT * FROM friends \n\t\tWHERE requester_id = $1 AND addressee_id = $2", [user_id, addressee_id])];
            case 1:
                existingLink = (_a.sent()).rows;
                if (existingLink.length) {
                    return [2 /*return*/, res.status(400).json({ message: "Request already sent" })];
                }
                return [4 /*yield*/, db_1.pool.query("\n    INSERT INTO friends \n      (requester_id, addressee_id, is_approved) \n    VALUES\n      ($1, $2, FALSE)\n  ", [user_id, addressee_id])];
            case 2:
                _a.sent();
                res.json({ message: "Request has sent" });
                return [2 /*return*/];
        }
    });
}); });
router.get("/all", auth_middlware_1.verifyAuth, function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var user_id, userList, incomingRequests;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                user_id = res.locals.user.user_id;
                return [4 /*yield*/, db_1.pool.query("\n\t\tSELECT \n\t\t\tusers.user_id as user_id, users.username, is_approved \n\t\tFROM \n\t\t\tfriends \n\t\tLEFT JOIN \n\t\t\tusers\n\t\tON addressee_id = users.user_id\n\t\tWHERE friends.requester_id = $1 \n\t\t", [user_id])];
            case 1:
                userList = (_a.sent()).rows;
                return [4 /*yield*/, db_1.pool.query("\n\t\tSELECT \n\t\t\tusers.user_id as user_id, users.username, is_approved \n\t\tFROM \n\t\t\tfriends \n\t\tLEFT JOIN \n\t\t\tusers\n\t\tON requester_id = users.user_id\n\t\tWHERE friends.addressee_id = $1 AND is_approved = FALSE\n\t\t", [user_id])];
            case 2:
                incomingRequests = (_a.sent()).rows;
                res.json({
                    data: {
                        friends: userList.filter(function (user) { return user.is_approved; }),
                        requests: userList.filter(function (user) { return !user.is_approved; }),
                        incomingRequests: incomingRequests,
                    },
                });
                return [2 /*return*/];
        }
    });
}); });
router.post("/approve/:requester_id", auth_middlware_1.verifyAuth, function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var requester_id, user_id, existingLink;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                requester_id = req.params.requester_id;
                user_id = res.locals.user.user_id;
                if (Number(requester_id) === Number(user_id)) {
                    return [2 /*return*/, res.status(400).json({ message: "Can't request to yourself" })];
                }
                return [4 /*yield*/, db_1.pool.query("\n\tSELECT * FROM friends WHERE \n\trequester_id = $1 AND addressee_id = $2\n\t", [requester_id, user_id])];
            case 1:
                existingLink = (_a.sent()).rows;
                if (!existingLink.length || existingLink[0].is_approved)
                    return [2 /*return*/, res.status(400).json({ message: "Something went wrong" })];
                return [4 /*yield*/, db_1.pool.query("\n    UPDATE friends SET is_approved = TRUE \n\t\tWHERE requester_id = $1 AND addressee_id = $2\n  ", [requester_id, user_id])];
            case 2:
                _a.sent();
                return [4 /*yield*/, db_1.pool.query("\n    INSERT INTO friends \n      (requester_id, addressee_id, is_approved) \n    VALUES\n      ($1, $2, TRUE)\n  ", [user_id, requester_id])];
            case 3:
                _a.sent();
                res.json({ message: "good" });
                return [2 /*return*/];
        }
    });
}); });
exports.default = router;
