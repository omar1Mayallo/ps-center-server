import cors from "cors";
import express from "express";
import mongoSanitize from "express-mongo-sanitize";
import rateLimit from "express-rate-limit";
import helmet from "helmet";
import hpp from "hpp";
import morgan from "morgan";
import "reflect-metadata";
import authRouter from "./auth/auth.router";
import env from "./config/env";
import deviceRouter from "./devices/device.router";
import globalErrorMiddleware from "./middlewares/error";
import {routeNotFoundError} from "./middlewares/error/errors";
import userRouter from "./users/user.router";
import snackRouter from "./snacks/snacks.router";
import gameSessionsRouter from "./game-sessions/gameSessions.router";

//_________EXPRESS_APP_________//
const app = express();

//___________________________MIDDLEWARES___________________________//
//_________ENABLE_CROSS_ORIGIN_RESOURCES_SHARING_________//
app.use(cors());
app.options("*", cors());

// 1)_[SECURITY]-{CROSS_SITE_SCRIPTING(XSS)}_HELMET_HEADERS_
// @desc Helmet helps you secure your Express apps by setting various HTTP headers. It's not a silver bullet, but it can help!, The top-level helmet function is a wrapper around 15 smaller middlewares, using it at top level in middlewares stack.
app.use(helmet());

// 2)_[SECURITY]-{BRUTE_FORCE_ATTACK_&_DENIAL_OF_SERVICE(DOS)_ATTACK}_RATE_LIMITING_
// @descOfAttack[BRUTE_FORCE_ATTACK] A brute force attack is a commonly used attack for cracking passwords. These attacks are the cyber-equivalent of a situation we often see in movies: a door is locked, and a character has a key ring with no idea of which key fits into the lock. Time is running out. The owner will be there any moment now. So, the person tries one key after another, quickly, till one key fits. That’s a brute force attack for you. The attackers keep trying multiple combinations of usernames and passwords till they find one that works.
// @descOfAttack[DENIAL_OF_SERVICE(DOS)_ATTACK] A Denial-of Service (DOS) attack is intended to shut down a website/system so that users are unable to access it. This is done by sending junk requests to overwhelming the site/system.
// @protection we used a rate limiter to number of requests done per amount of time by using (express-rate-limiter)
const limiter = rateLimit({
  // maximum 1000 requests per hour
  max: 1000,
  windowMs: 60 * 60 * 1000,
  message: "Too many requests, please try again in one hour",
});
app.use(env.SERVER_URL, limiter);

// 3) Morgan (HTTP requests LOGGER)
if (env.NODE_ENV === "development") app.use(morgan("dev"));

// 4) Body parser (express.json() is a built express middleware that convert request body to JSON)
app.use(
  express.json({
    // 	Controls the maximum request body size
    limit: "15kb",
  })
);

// 5)_[SECURITY]-{CROSS_SITE_SCRIPTING(XSS)_&_NO_SQL_INJECTION_ATTACK}_DATA_SANITIZATION_
// @descOfAttack[NO_SQL_INJECTION_ATTACK] NoSQL injection is a vulnerability that lets a malicious hacker introduce (inject) undesired code into database queries executed by NoSQL databases.
// @descOfAttack[CROSS_SITE_SCRIPTING(XSS)] Cross-Site Scripting (XSS) attacks are a type of injection, in which malicious scripts are injected into otherwise benign and trusted websites. XSS attacks occur when an attacker uses a web application to send malicious code, generally in the form of a browser side script, to a different end user. Flaws that allow these attacks to succeed are quite widespread and occur anywhere a web application uses input from a user within the output it generates without validating or encoding it. An attacker can use XSS to send a malicious script to an unsuspecting user. The end user’s browser has no way to know that the script should not be trusted, and will execute the script. Because it thinks the script came from a trusted source, the malicious script can access any cookies, session tokens, or other sensitive information retained by the browser and used with that site. These scripts can even rewrite the content of the HTML page.

// a)protect from No Sql Injection
app.use(mongoSanitize());

// 6) HPP (protect against HTTP Parameter Pollution)
app.use(hpp());

//___________________________ROUTES___________________________//
// 1) Base Routes
app.use("/api/auth", authRouter);
app.use("/api/users", userRouter);
app.use("/api/devices", deviceRouter);
app.use("/api/game-sessions", gameSessionsRouter);
app.use("/api/snacks", snackRouter);

// 2) 404 Urls
app.all("*", routeNotFoundError);

//_____________________GLOBAL_ERROR_MIDDLEWARE_____________________//
app.use(globalErrorMiddleware);

export default app;
