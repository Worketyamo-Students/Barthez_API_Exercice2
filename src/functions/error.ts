import { Response } from "express";
import { HttpCode } from "../core/constants";


const errors = {
    serverError: (res: Response, error: unknown) => {
        // throw error message
        console.log(error);
        
        // throw response message
        res
        .status(HttpCode.INTERNAL_SERVER_ERROR)
        .json({msg: "Internal server error !"})
    }
}

export default errors;