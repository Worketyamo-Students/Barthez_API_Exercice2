import { Request, Response } from "express";
import { HttpCode } from "../core/constants";
import errors from "../functions/error";
import { comparePassword, hashText } from "../functions/bcrypt";
import employeeToken from "../functions/jwt";
import sendMail from "../functions/sendmail";
import prisma from "../core/config/prisma";
import { customRequest } from "../middlewares/auth-middleware";

const employeeControllers = {
        // function for inscription of employee
    inscription: async (req: Request, res: Response) =>{
        try {
            // fetch data from body
            const {name, email, password, post, salary} = req.body;            
            if(!name || !email || !password || !post || !salary) return res.status(HttpCode.BAD_REQUEST).json({msg: "All fields are mandatory !"})

            // Check if user ever exist
            const employeeAlreadyExist = await prisma.employee.findUnique({where: {email}})
            if(employeeAlreadyExist) return res.status(HttpCode.BAD_REQUEST).json({msg: "Email is ever used !"});
            
            const hashPassword = await hashText(password);
            if(!hashPassword) return res.status(HttpCode.BAD_REQUEST).json({msg: "error trying to crypt password !"})

            const newEmployee = await prisma.employee.create({
                data: {
                    name,
                    email,
                    password: hashPassword,
                    post,
                    salary: parseInt(salary)
                }
            });
            if(!newEmployee) return res.status(HttpCode.NOT_FOUND).json({msg: "Error when creating new employee !"});

            sendMail(
                newEmployee.email, 
                {
                    name: newEmployee.name, 
                    content: "Merci de vous etre Inscrit !"
                }
            )

            // Return success message
            res
                .status(HttpCode.CREATED)
                .json({msg: "registration completed !"})
        } catch (error) {
            return errors.serverError(res, error);
        }
    },

    // function for connexion of employee
    connexion: async (req: Request, res: Response) =>{
        try {
            // fetch data from body
            const {email, password} = req.body;            
            if(!email || !password) return res.status(HttpCode.BAD_REQUEST).json({msg: "All fields are mandatory !"})
            
            // check if employee exist
            const employee = await prisma.employee.findUnique({where: {email}});
            if(!employee) return res.status(HttpCode.NOT_FOUND).json({msg: "employee not exist"})

            // Check if it's correct password
            const isPassword = await comparePassword(password, employee.password);
            if(!isPassword) return res.status(HttpCode.UNAUTHORIZED).json({msg: "incorrect password !"});

            // Save access token and refresh token
            employee.password = "";
            
            const accessToken = employeeToken.accessToken(employee)
            const refreshToken = employeeToken.refreshToken(employee);

            res.setHeader('authorization', `Bearer ${accessToken}`);
            res.cookie(
                `${employee.email}_key`,
                refreshToken,
                {
                    httpOnly: true,
                    secure: true,
                    maxAge: 1000 * 60 * 60 * 24 * 30
                }
            );
            
            // Return success message
            res
                .status(HttpCode.OK)
                .json({msg: "employee connected !"})
        } catch (error) {
            return errors.serverError(res, error);
        }
    },

    // function for deconnexion of employee
    deconnexion: async (req: customRequest, res: Response) =>{
        try {
            
            const employee = req.employee;
            if(!employee) return res.status(HttpCode.UNAUTHORIZED).json({msg: "Authentification failed !"})

            // invalid access and refresh token
            res.setHeader('authorization', `Bearer `);
            res.clearCookie(
                `${employee.email}_key`,
                {
                    secure: true,
                    httpOnly: true,
                }
            )

            sendMail(
                employee.email, 
                {
                    name: employee.name, 
                    content: "Vous venez de vous deconnectez de l'agence:Dark Agence; <br> Merci de vous reconnecter bientot !"
                }
            )

            // Return success message
            res
                .status(HttpCode.OK)
                .json({msg: "employee deconnected !"})
        } catch (error) {
            return errors.serverError(res, error);
        }
    },
    
    // function to consult employees
    consultEmployee: async (req: customRequest, res: Response) =>{
        try {
            const employee = req.employee;
            if(!employee) return res.status(HttpCode.UNAUTHORIZED).json({msg: "Authentification failed !"})

            const infoEmployee = {
                name: employee.name,
                email: employee.email,
                post: employee.post,
                salary: employee.salary
            }
            
            // Return success message
            res
                .status(HttpCode.OK)
                .json({msg: infoEmployee})
        } catch (error) {
            return errors.serverError(res, error);
        }
    },

    // function to update employee
    updateEmployeeData: async (req: customRequest, res: Response) =>{
        try {
           const employee = req.employee;
           if(!employee) return res.status(HttpCode.UNAUTHORIZED).json({msg: "Failed to authenticate employee !"});

           // fetch data from body
            const {name, email, password, post, salary} = req.body;            

            const hashPassword = await hashText(password);
            if(!hashPassword) return res.status(HttpCode.BAD_REQUEST).json({msg: ""})

            const updateEmployee = await prisma.employee.update({
                where: {employe_id: employee.employe_id},
                data: { name, email, password: hashPassword, post, salary: parseInt(salary) },
                select: { name: true, email: true, post: true, salary:true },
            });
            if(!updateEmployee) return res.status(HttpCode.NOT_FOUND).json({msg: "error when update employee !"});

            // Return success message
            res
                .status(HttpCode.CREATED)
                .json({msg: `${employee.name} has been modified successfuly. It's become:`, updateEmployee})
        } catch (error) {
            return errors.serverError(res, error);
        }
    },

    // function to delete employee
    deleteEmployee: async (req: customRequest, res: Response) =>{
        try {
            const employee = req.employee;
            if(!employee) return res.status(HttpCode.UNAUTHORIZED).json({msg: "Failed to authenticate employee !"});
             
            const deleteEmployee = await prisma.employee.delete(
                {where: 
                    {employe_id: employee.employe_id}
                }
            );
            if(!deleteEmployee) return res.status(HttpCode.NOT_FOUND).json({msg: "error when delete employee !"})
            

            // Return success message
            res
                .status(HttpCode.OK)
                .json({msg: `${deleteEmployee.name} has been delete successfuly!`})
        } catch (error) {
            return errors.serverError(res, error);
        }
    },

    // Function to refresh token
    refreshAccessToken: async(req: customRequest, res: Response) => {
        const employee = req.employee;
        if(!employee) return res.status(HttpCode.UNAUTHORIZED).json({msg: "Failed to authenticate employee !"});

        // Fetch refresh token of employee from cookie
        const refreshToken = req.cookies[`${employee.email}_key`]; 
        if(!refreshToken) return res.status(HttpCode.UNAUTHORIZED).json({msg: 'failed to fetch refreshtoken !'});
        
        // Decode refresh token
        const employeeData = employeeToken.verifyRefreshToken(refreshToken);
        if(!employeeData) return res.status(HttpCode.UNAUTHORIZED).json({msg: "invalid refresh token!" });
        employeeData.password = "";

        // Creating a new access an a nex refresh token
        const newAccessToken = employeeToken.accessToken(employeeData) 
        const newRefreshToken = employeeToken.refreshToken(employeeData)

        res.setHeader('authorization', `Bearer ${newAccessToken}`);
        res.cookie(
            `${employee.email}_key`,
            newRefreshToken,
            {
                httpOnly: true,
                secure: true,
                maxAge: 1000 * 60 * 60 * 24 * 30
            }
        );

    }
}

export default employeeControllers;
