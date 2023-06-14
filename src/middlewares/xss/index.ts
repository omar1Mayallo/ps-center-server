import {RequestHandler} from "express";
import xss from "xss";

// XSS middleware
const sanitizeInput: RequestHandler = (req, _, next) => {
  // Sanitize req.body
  req.body = xss(req.body);

  // Continue to the next middleware
  next();
};
export default sanitizeInput;
