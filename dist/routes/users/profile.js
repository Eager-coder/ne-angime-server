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
var router = express_1.Router();
var sharp_1 = __importDefault(require("sharp"));
var db_1 = require("../../config/db");
var auth_middlware_1 = require("../../middlewares/auth.middlware");
var cloudinary = require("cloudinary").v2;
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});
var uploadToCloudinary = function (image) {
    return new Promise(function (resolve, reject) {
        cloudinary.uploader
            .upload_stream({
            folder: "ne-angime-avatar",
        }, function (err, result) {
            if (err)
                return reject(err);
            return resolve(result);
        })
            .end(image);
    });
};
router.post("/avatar", auth_middlware_1.verifyAuth, function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var base64Img, bufferImg, formattedImgBuffer, result, error_1;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 5, , 6]);
                console.log(req.body);
                base64Img = req.body.avatar.split(";base64,").pop();
                if (!base64Img)
                    return [2 /*return*/, res.status(404).json({ message: "Please upload an image" })];
                bufferImg = Buffer.from(base64Img, "base64");
                return [4 /*yield*/, sharp_1.default(bufferImg)
                        .jpeg({ quality: 50, chromaSubsampling: "4:4:4", force: true })
                        .resize(250, 250)
                        .toBuffer()];
            case 1:
                formattedImgBuffer = _a.sent();
                return [4 /*yield*/, uploadToCloudinary(formattedImgBuffer)];
            case 2:
                result = _a.sent();
                if (!result.url) return [3 /*break*/, 4];
                return [4 /*yield*/, db_1.pool.query("UPDATE users SET avatar = $1 WHERE user_id = $2", [
                        result.url,
                        res.locals.user.user_id,
                    ])];
            case 3:
                _a.sent();
                _a.label = 4;
            case 4:
                res.json({ message: "Image successfully uploaded", url: result.url });
                return [3 /*break*/, 6];
            case 5:
                error_1 = _a.sent();
                console.log(error_1);
                res.status(500).json({ message: "Oops! Something went wrong!" });
                return [3 /*break*/, 6];
            case 6: return [2 /*return*/];
        }
    });
}); });
exports.default = router;
router.put("/username", auth_middlware_1.verifyAuth, function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var new_username, user_id, existing, error_2;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 3, , 4]);
                new_username = req.body.new_username;
                user_id = res.locals.user.user_id;
                if (!(new_username === null || new_username === void 0 ? void 0 : new_username.trim().length)) {
                    return [2 /*return*/, res.status(400).json({ message: "Username cannot be blank" })];
                }
                return [4 /*yield*/, db_1.pool.query("\n\t\t\tSELECT user_id FROM users \n\t\t\tWHERE username = $1 LIMIT 1", [new_username])];
            case 1:
                existing = (_a.sent()).rows;
                if (existing.length) {
                    return [2 /*return*/, res.status(400).json({ message: "Username is not available" })];
                }
                return [4 /*yield*/, db_1.pool.query("UPDATE users SET username = $1 WHERE user_id = $2", [new_username, user_id])];
            case 2:
                _a.sent();
                res.json({ message: "Username has been changed" });
                return [3 /*break*/, 4];
            case 3:
                error_2 = _a.sent();
                console.log("UPDATE USERNAME", error_2.message);
                res.status(500).json({ message: "Oops! Something went wrong!" });
                return [3 /*break*/, 4];
            case 4: return [2 /*return*/];
        }
    });
}); });
router.put("/email", auth_middlware_1.verifyAuth, function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var new_email, user_id, existing, error_3;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 3, , 4]);
                new_email = req.body.new_email;
                user_id = res.locals.user.user_id;
                if (!(new_email === null || new_email === void 0 ? void 0 : new_email.trim().length)) {
                    return [2 /*return*/, res.status(400).json({ message: "Email cannot be blank" })];
                }
                return [4 /*yield*/, db_1.pool.query("\n\t\t\tSELECT user_id FROM users WHERE email = $1 LIMIT 1", [new_email])];
            case 1:
                existing = (_a.sent()).rows;
                if (existing.length) {
                    return [2 /*return*/, res.status(400).json({ message: "Email is not available" })];
                }
                return [4 /*yield*/, db_1.pool.query("UPDATE users SET email = $1 WHERE user_id = $2", [new_email, user_id])];
            case 2:
                _a.sent();
                res.json({ message: "Email has been changed" });
                return [3 /*break*/, 4];
            case 3:
                error_3 = _a.sent();
                console.log("UPDATE EMAIl", error_3.message);
                res.status(500).json({ message: "Oops! Something went wrong!" });
                return [3 /*break*/, 4];
            case 4: return [2 /*return*/];
        }
    });
}); });
router.put("/about", auth_middlware_1.verifyAuth, function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var user_id, new_about, error_4;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                user_id = res.locals.user.user_id;
                new_about = req.body.new_about;
                if (!new_about.trim().length) {
                    return [2 /*return*/, res.status(400).json({ message: "Your about is empty" })];
                }
                return [4 /*yield*/, db_1.pool.query("UPDATE users SET about = $1 WHERE user_id = $2", [new_about, user_id])];
            case 1:
                _a.sent();
                res.json({ message: "Your about is updated" });
                return [3 /*break*/, 3];
            case 2:
                error_4 = _a.sent();
                console.log("UPDATE ABOUT", error_4.message);
                res.status(500).json({ message: "Oops! Something went wrong!" });
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); });
