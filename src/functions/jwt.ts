import jwt from "jsonwebtoken"
import dotenv from "dotenv"
import { readFileSync } from "fs";

dotenv.config();

interface Ipayload {
    employe_id: string;
    name: string; 
    email: string; 
    password: string; 
    post: string; 
    salary: number;
}

const employeeToken = {
    accessToken: (payload: Ipayload) => {
        const signOption = {
            algorithm: process.env.JWT_ALGORITHM as jwt.Algorithm,
            expiresIn: process.env.JWT_ACCESS_EXPIRES_IN as string
        } 

        const privateKey = readFileSync(process.env.JWT_PRIVATE_KEY as string, "utf-8");
        return jwt.sign(payload, privateKey, signOption) as string;
    },

    verifyAccessToken: (token: string) => {
        try {
            const publicKey = readFileSync(process.env.JWT_PUBLIC_KEY as string, "utf-8");
            return jwt.verify(token, publicKey) as Ipayload;
        } catch (error) {
            console.error(`Invalide access token: ${error}`)
        }
    },

    // REFRESH TOKEN ET SES FONCTIONS
    refreshToken: (payload: Ipayload) => {
        const signOption = {
            algorithm: process.env.JWT_ALGORITHM as jwt.Algorithm,
            expiresIn: process.env.JWT_REFRESH_EXPIRES_IN as string
        };

        const privateKey = readFileSync(process.env.JWT_REFRESH_PRIVATE_KEY as string, "utf-8") as string;
        return jwt.sign(payload, privateKey, signOption);
    },

    verifyRefreshToken: (refreshToken: string) => {
        try {
            const publicKey = readFileSync(process.env.JWT_REFRESH_PUBLIC_KEY as string, "utf-8");
            
            return jwt.verify(refreshToken, publicKey) as Ipayload;
        } catch (error) {
            console.error(`token invalide: ${error}`);
        }
    },
};

export default employeeToken;