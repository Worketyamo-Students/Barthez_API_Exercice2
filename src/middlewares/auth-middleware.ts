import { NextFunction, Request, Response } from "express";
import { HttpCode } from "../core/constants";
import employeeToken from "../functions/jwt";

interface IEmployee {
    employe_id: string;
    name: string; 
    email: string; 
    password: string; 
    post: string; 
    salary: number;
}

export interface customRequest extends Request{
    employee?: IEmployee;
}

export const auth = {
    authToken: async(req: customRequest, res: Response, next: NextFunction) => {
        try {
            const accessToken = req.header('authorization')?.split(" ")[1] || "";
            if(!accessToken || accessToken.startsWith('Bearer '))return res.status(HttpCode.UNAUTHORIZED).json({msg: "Access token not found or not format well !"});
           
            const employeeData = employeeToken.verifyAccessToken(accessToken);             
            if(!employeeData) return res.status(HttpCode.UNAUTHORIZED).json({msg: "failed to decode access token !"});

            req.employee = employeeData;
            next();
        } catch (error) {
            return(
                res
                    .status(HttpCode.INTERNAL_SERVER_ERROR)
                    .json({msg: "error when try to authenticate."})
            ) 
        }
    } 
}
