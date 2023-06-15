import {Request, Response, NextFunction} from "express";
import {validate, ValidationError} from "class-validator";
import {BAD_REQUEST} from "http-status";
import {plainToInstance} from "class-transformer";

/*
@DESC : Role of this function is to get only the error messages from constraints object and put in string[]. You can see full structure of error object in class-validator docs. 

@NOTE : I need only the error messages to my frontend application you can also edit or use the full error object depending on the project that you want to build.
*/
function extractErrorMessages(errors: ValidationError[]): string[] {
  return errors.map((error) => Object.values(error.constraints!)).flat();
}

//_REFACTORING
function validateObject(obj: object, dto: any) {
  const objectInstance = plainToInstance(dto, obj);
  return validate(objectInstance!);
}

/*
@DESC : This is a validation middleware function to validate request(body, query, params) using class-validator

@NOTE : Why we use the plainToInstance method here?
The plainToInstance function is used to transform the plain JavaScript objects (req.body, req.query, and req.params) into instances of the DTO class. Then, the validate function from class-validator is called to perform the validation, and any validation errors are collected.
*/
export const validateRequest =
  (dto: any) => async (req: Request, res: Response, next: NextFunction) => {
    // 1) Init a err[] reference
    let errs: ValidationError[] = [];

    // 2) Validate incoming request
    // _REFACTORING
    async function validateAndPushErrors(obj: object) {
      if (Object.keys(obj).length > 0) {
        const validationErrors = await validateObject(obj, dto);
        errs.push(...validationErrors);
      }
    }

    await Promise.all([
      validateAndPushErrors(req.body),
      validateAndPushErrors(req.query),
      validateAndPushErrors(req.params),
    ]);

    // 3) Extract error messages from err[] reference
    const errors = extractErrorMessages(errs);

    // 4) If errors return it
    if (errors.length > 0) {
      return res.status(BAD_REQUEST).json({status: "validation-error", errors});
    }

    // 5) If no validation errors go to next middleware
    next();
  };
