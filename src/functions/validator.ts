import { NextFunction, Request, Response } from "express";
import { body, param, query, validationResult } from "express-validator";
import { HttpCode } from "../core/constants";

const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z]).{5,}$/;

export const validator = {
    validateEmployee: [
        // Validation of employee name
        body('name')
            .exists().withMessage('name is required !')
            .trim().notEmpty().withMessage('name cannot be empty !')
            .isString().withMessage('name should have a string !')
            .isLength({min:3}).withMessage('name is to short !')
            .isLength({max: 25}).withMessage('name is too long !')
        ,
        // Validatoion of employee email
        body('email')
            .exists().withMessage('email is required !')
            .trim().notEmpty().withMessage('email can\'t be empty !')
            .isEmail().withMessage('invalid email !')
        ,
        // validation of employee password
        body('password')
            .exists().withMessage('required password !')
            .trim().notEmpty().withMessage('password can\'t be empty!')
            .matches(passwordRegex).withMessage('password should content at less 5 string, 1 uppercase, and 1 lowercase !')
        ,
        body('post')
            .exists().withMessage('post is required !')
            .trim().notEmpty().withMessage('post cannot be empty !')
            .isString().withMessage('post should have a string !')
            .isLength({min:2}).withMessage('post is too short !')
            .isLength({max: 25}).withMessage('post is too long !')
        ,
        body('salary')
            .exists().withMessage('salary is required !')
            .trim().notEmpty().withMessage('salary cannot be empty !')
            .isInt({min: 1000, max: 100000000}).withMessage('invalid salary !')
        ,
    ],
 
    validateEmployeeLogin: [
        // Validatoion of employee email
        body('email')
            .exists().withMessage('email is required !')
            .trim().notEmpty().withMessage('email can\'t be empty !')
            .isEmail().withMessage('invalid email !')
        ,

    ],

    validateEmployeeID: [
        param('employee_id')
            .exists().withMessage('email is required !')
            .isMongoId().withMessage("employee ID passed in params should be a valid format !")
        ,
    ],

    validateAttendance: [
        // validation of employeeID
        body('employeeID')
            .exists().withMessage('required employee id !')
            .trim().notEmpty().withMessage('employee id can\'t be empty !')
            .isMongoId().withMessage('invalid employee id format !')
        ,
    ],

    validateAbsence: [        
        // validation of employeeID
        body('employeeID')
            .exists().withMessage('required employee id !')
            .trim().notEmpty().withMessage('employee id can\'t be empty !')
            .isMongoId().withMessage('invalid employee id format !')
        ,
        query('start')
            .exists().withMessage('start date is required in query !')
            .isDate().withMessage('start date should be a valid date format !')
        ,
        query('end')
            .exists().withMessage('end date is required in query !')
            .isDate().withMessage('end date should be a valid date format !')
        ,
    ],
}
    
export const validate = (req: Request, res: Response, next: NextFunction) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(HttpCode.UNPROCESSABLE_ENTITY).json({ errors: errors.array() })
    }
    next();
}
  