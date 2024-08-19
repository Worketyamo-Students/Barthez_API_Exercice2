import { Router } from "express";
import attendanceControllers from "../controllers/attendances-controllers";
import { validate, validator } from "../functions/validator";
import { auth } from "../middlewares/auth-middleware";

const attendance = Router();

attendance.post(
    '/check-in',
    validator.validateAttendance, 
    validate, 
    auth.authToken,
    attendanceControllers.beginOfAttendance
);

attendance.post(
    '/check-out', 
    validator.validateAttendance, 
    validate, 
    auth.authToken,
    attendanceControllers.endOfAttendance
);

attendance.get(
    '/', 
    validator.validateAttendance, 
    validate,
    auth.authToken,
    attendanceControllers.consultAttendances
);

export default attendance;