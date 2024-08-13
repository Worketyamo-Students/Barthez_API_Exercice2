import jwt from "jsonwebtoken"
import dotenv from "dotenv"
import { readFileSync } from "fs";

dotenv.config();

interface Ipayload {
    name: string;
    email: string;
    password: string;
}

const userToken = {
    accessToken: (payload: Ipayload) => {
        const signOption = {
            algorithm: process.env.JWT_ALGORITHM as jwt.Algorithm,
            expiresIn: process.env.JWT_ACCESS_EXPIRES_IN as string
        } 
        console.log(signOption.algorithm, signOption.expiresIn)
        const privateKey = readFileSync(process.env.JWT_PRIVATE_KEY as string, "utf-8");
        return jwt.sign(payload, privateKey, signOption);
    },

    verifyAccessToken: (token: string) => {
        try {
            const publicKey = readFileSync(process.env.JWT_PUBLIC_KEY as string, "utf-8");
            return jwt.verify(token, publicKey) as Ipayload;
        } catch (error) {
            console.error(`Invalide access token: ${error}`)
        }
    },

    decodeAccessToken: (token: string) => {
        try {
            return jwt.decode(token)
        } catch (error) {
            console.error(`Une erreur est survenu lors du decodage: ${error}`);
        }
    },

    // REFRESH TOKEN ET SES FONCTIONS
    refreshToken: (payload: Ipayload) => {
        const signOption = {
            algorithm: process.env.JWT_ALGORITHM as jwt.Algorithm,
            expiresIn: process.env.JWT_REFRESH_EXPIRES_IN as string
        };
        const privateKey = readFileSync(process.env.JWT_REFRESH_PRIVATE_KEY as string, "utf-8");
        return jwt.sign(payload, privateKey, signOption);
    },

    verifyRefreshToken: (token: string) => {
        try {
            const publicKey = readFileSync(process.env.JWT_REFRESH_PUBLIC_KEY as string, "utf-8");
            return jwt.verify(token, publicKey) as Ipayload;
        } catch (error) {
            console.error(`token invalide ${error}`);
        }
    },

    decodeRefreshToken: (token: string) => {
        try {
            return jwt.decode(token)
        } catch (error) {
            console.error(`Une erreur est survenu lors du decodage du token: ${error}`);
        }
    }
};

export default userToken;