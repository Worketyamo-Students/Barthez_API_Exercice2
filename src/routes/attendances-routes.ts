import { Router } from "express";
import attendanceControllers from "../controllers/attendances-controllers";

const attendance = Router();

attendance.post('/check-in', attendanceControllers.beginOfAttendance);
attendance.post('/check-out', attendanceControllers.endOfAttendance);
attendance.get('/', attendanceControllers.consultAttendances);

export default attendance;