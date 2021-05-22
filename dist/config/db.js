"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.pool = void 0;
var pg_1 = require("pg");
var dotenv_1 = require("dotenv");
dotenv_1.config();
exports.pool = new pg_1.Pool({
    user: process.env.PG_USER,
    host: process.env.PG_HOST,
    database: process.env.PG_DB,
    password: process.env.PG_PASSWORD,
    port: Number(process.env.PG_PORT),
    max: 2,
});
