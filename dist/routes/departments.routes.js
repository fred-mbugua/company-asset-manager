"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const department_controller_1 = __importDefault(require("../controllers/department.controller"));
const middlewares_1 = require("../middlewares");
const router = (0, express_1.Router)();
router.get('/', department_controller_1.default.getAll);
router.get('/:id', department_controller_1.default.getById);
router.post('/', middlewares_1.authenticate, (0, middlewares_1.authorize)(['Admin']), department_controller_1.default.create);
router.put('/:id', middlewares_1.authenticate, (0, middlewares_1.authorize)(['Admin']), department_controller_1.default.update);
router.delete('/:id', middlewares_1.authenticate, (0, middlewares_1.authorize)(['Admin']), department_controller_1.default.delete);
exports.default = router;
