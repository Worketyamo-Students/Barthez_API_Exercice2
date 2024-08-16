import { NextFunction, Request, Response } from "express";
import { HttpCode } from "../core/constants";
import employeeToken from "../functions/jwt";

const auth = {
    authToken: async(req: Request, res: Response, next: NextFunction) => {
        try {
            const accessToken = req.header('authorization')?.split(" ")[1] || "";
            if(!accessToken || accessToken.startsWith('Bearer '))return res.status(HttpCode.UNAUTHORIZED).json({msg: "Access token not found !"});
           
            const employeeData = employeeToken.verifyAccessToken(accessToken);             
            if(!employeeData) return res.status(HttpCode.BAD_REQUEST).json({msg: "failed to decode access token !"});


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

export default auth;