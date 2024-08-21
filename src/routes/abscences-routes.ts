import { Router } from "express";
import abscencesControllers from "../controllers/abscences-controllers";
import { auth } from "../middlewares/auth-middleware";


const abscence = Router();

abscence.get(
    '/attendance/absences', 
    auth.authToken,
    abscencesControllers.abscencesHours
);

abscence.get(
    '/salary', 
    auth.authToken,
    abscencesControllers.abscencesAdjustments
);

export default abscence;