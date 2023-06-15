import asyncHandler from "express-async-handler";
import {RequestHandler} from "express";
import APIError from "../utils/ApiError";
import {BAD_REQUEST, CREATED, OK} from "http-status";
import User from "../users/user.model";
import {generateSendToken} from "../utils/tokenHandler";
import {UserLoginDto, UserRegisterDto} from "./auth.dto";

// ---------------------------------
// @desc    Register
// @route   POST  /auth/register
// @access  Public
// ---------------------------------
export const register: RequestHandler<unknown, unknown, UserRegisterDto> =
  asyncHandler(async (req, res, next) => {
    const {username, email, password} = req.body;
    console.log(username, email, password);
    //_A) CHECK _//
    // 1) If all data entered
    if (!username || !email || !password) {
      return next(new APIError("Please fill all fields", BAD_REQUEST));
    }
    // 2) If email is already exist
    const userExist = await User.findOne({email});
    if (userExist) {
      return next(
        new APIError(
          "Email is already exist , please enter new email",
          BAD_REQUEST
        )
      );
    }

    //_B) CREATE_NEW_USER_//
    const newUser = await User.create({
      username,
      email,
      password,
    });

    //_C) GENERATE_AND_SEND_TOKEN_TO_RESPONSE_//
    generateSendToken(res, newUser, CREATED);
  });

// ---------------------------------
// @desc    login
// @route   POST  /auth/login
// @access  Public
// ---------------------------------
export const login: RequestHandler<unknown, unknown, UserLoginDto> =
  asyncHandler(async (req, res, next) => {
    const {email, password} = req.body;
    //_A) CHECK_//
    // 1) If all data entered
    if (!email || !password) {
      return next(new APIError("Please fill all fields", BAD_REQUEST));
    }
    // 2) If user exists and password is true
    const user = await User.findOne({email}).select("+password");
    if (!user || !(await user.isCorrectPassword(password, user.password))) {
      return next(new APIError("Invalid email or password", BAD_REQUEST));
    }

    //_B) GENERATE_AND_SEND_TOKEN_TO_RESPONSE_//
    generateSendToken(res, user, OK);
  });
