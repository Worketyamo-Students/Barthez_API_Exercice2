import { Router } from "express";
import abscencesControllers from "../controllers/abscences-controllers";



const abscence = Router();

abscence.get('/attendance/absences/:employeeID', abscencesControllers.abscencesHours);
abscence.get('/salary/:employeeID', abscencesControllers.abscencesAdjustments);

export default abscence;