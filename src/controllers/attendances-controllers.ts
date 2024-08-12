import { Request, Response } from "express";
import { HttpCode } from "../core/constants";
import errors from "../functions/error";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const attendanceControllers = {
    beginOfAttendance: async (req: Request, res: Response) =>{
        try {
            
            // Return success message
            res
                .status(HttpCode.CREATED)
                .json({msg: "registration completed !"})
        } catch (error) {
            return errors.serverError(res, error);
        }
    },

    endOfAttendance: async (req: Request, res: Response) =>{
        try {
            
            // Return success message
            res
                .status(HttpCode.CREATED)
                .json({msg: "registration completed !"})
        } catch (error) {
            return errors.serverError(res, error);
        }
    },

    consultAttendances: async (req: Request, res: Response) =>{
        try {
            
            // Return success message
            res
                .status(HttpCode.CREATED)
                .json({msg: "registration completed !"})
        } catch (error) {
            return errors.serverError(res, error);
        }
    }

}

export default attendanceControllers;