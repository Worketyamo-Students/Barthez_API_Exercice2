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

// Download all The keys at the beginin of our program
const privateKey = readFileSync(process.env.JWT_PRIVATE_KEY as string, "utf-8");
const publicKey = readFileSync(process.env.JWT_PUBLIC_KEY as string, "utf-8");
const privateKeyRefresh = readFileSync(process.env.JWT_REFRESH_PRIVATE_KEY as string, "utf-8") as string;
const publicKeyRefresh = readFileSync(process.env.JWT_REFRESH_PUBLIC_KEY as string, "utf-8");

const employeeToken = {
    accessToken: (payload: Ipayload) => {
        const signOption = {
            algorithm: process.env.JWT_ALGORITHM as jwt.Algorithm,
            expiresIn: process.env.JWT_ACCESS_EXPIRES_IN as string
        } 
        return jwt.sign(payload, privateKey, signOption) as string;
    },

    verifyAccessToken: (token: string) => {
        try {
            return jwt.verify(token, publicKey) as Ipayload;
        } catch (error) {
            console.error(`Invalide access token: ${error}`)
            throw error;
        }
    },

    // REFRESH TOKEN ET SES FONCTIONS
    refreshToken: (payload: Ipayload) => {
        const signOption = {
            algorithm: process.env.JWT_ALGORITHM as jwt.Algorithm,
            expiresIn: process.env.JWT_REFRESH_EXPIRES_IN as string
        };

        return jwt.sign(payload, privateKeyRefresh, signOption);
    },

    verifyRefreshToken: (refreshToken: string) => {
        try {
            return jwt.verify(refreshToken, publicKeyRefresh) as Ipayload;
        } catch (error) {
            console.error(`token invalide: ${error}`);
            throw error;
        }
    },
};

export default employeeToken;