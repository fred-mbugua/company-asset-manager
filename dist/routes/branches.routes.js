"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const branch_controller_1 = __importDefault(require("../controllers/branch.controller"));
const router = (0, express_1.Router)();
router.post('/', branch_controller_1.default.create);
router.get('/', branch_controller_1.default.findAll);
exports.default = router;
