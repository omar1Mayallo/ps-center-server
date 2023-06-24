import express from "express";
import {login, register} from "./auth.controller";
import {loginValidation, registerValidation} from "./auth.dto";

const router = express.Router();

router.route("/register").post(registerValidation, register);

router.route("/login").post(loginValidation, login);

export default router;
