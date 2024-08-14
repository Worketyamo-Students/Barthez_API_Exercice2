import { Router } from "express";
import attendanceControllers from "../controllers/attendances-controllers";
import { validate, validator } from "../functions/validator";

const attendance = Router();

attendance.post(
    '/check-in',
    validator.validateAttendance, 
    validate, 
    attendanceControllers.beginOfAttendance
);

attendance.post(
    '/check-out', 
    validator.validateAttendance, 
    validate, 
    attendanceControllers.endOfAttendance
);

attendance.get(
    '/', 
    validator.validateAttendance, 
    validate,
    attendanceControllers.consultAttendances
);

export default attendance;