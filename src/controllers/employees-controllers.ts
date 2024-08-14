import { Request, Response } from "express";
import { HttpCode } from "../core/constants";
import errors from "../functions/error";
import { PrismaClient } from "@prisma/client";
import { comparePassword, hashText } from "../functions/bcrypt";
import employeeToken from "../functions/jwt";

const prisma = new PrismaClient();

const employeeControllers = {
    // function for inscription of employee
    inscription: async (req: Request, res: Response) =>{
        try {
            // fetch data from body
            const {name, email, password, post, salary} = req.body;            
            if(!name || !email || !password || !post || !salary) return res.status(HttpCode.BAD_REQUEST).json({msg: "All fields are mandatory !"})

            // Check if user ever exist
            const employeeExist = await prisma.employee.findUnique({where: {email}})
            if(employeeExist) return res.status(HttpCode.BAD_REQUEST).json({msg: "Email is ever used !"});
            
            const hashPassword = await hashText(password);
            if(!hashPassword) return res.status(HttpCode.BAD_REQUEST).json({msg: ""})

            const newEmployee = await prisma.employee.create({
                data: {
                    name,
                    email,
                    password: hashPassword,
                    post,
                    salary
                }
            });
            if(!newEmployee) return res.status(HttpCode.NOT_FOUND).json({msg: "Error when creating new employee !"});

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
            if(!isPassword) return res.status(HttpCode.BAD_REQUEST).json({msg: "incorrect password !"});

            // Save access token and refresh token
            employee.password = "";
            
            const accessToken = employeeToken.accessToken(employee)
            const refreshToken = employeeToken.refreshToken(employee);

            console.log(accessToken, refreshToken);

            res.setHeader('authorization', `Barear ${accessToken}`);
            res.cookie(
                `${employee.email}_key`,
                accessToken,
                {
                    httpOnly: true,
                    secure: true,
                    maxAge: 1000 * 60 * 60 * 24 * 3
                }
            );
            console.log(accessToken, refreshToken);

            // Return success message
            res
                .status(HttpCode.OK)
                .json({msg: "employee connected !"})
        } catch (error) {
            return errors.serverError(res, error);
        }
    },

    // function for deconnexion of employee
    deconnexion: async (req: Request, res: Response) =>{
        try {
            // fetch data from body
            const {employe_id} = req.params;
            if(!employe_id) return res.status(HttpCode.BAD_REQUEST).json({msg: "All fields are mandatory !"})
            
            // check if employee exist
            const employee = await prisma.employee.findUnique({where: {employe_id}});
            if(!employee) return res.status(HttpCode.NOT_FOUND).json({msg: "employee not exist"})
            
            // invalid access and refresh token
            res.setHeader('authorization', `Bearer `);
            res.clearCookie(
                `${employee.email}_key`,
                {
                    secure: true,
                    httpOnly: true,
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
    consultEmployee: async (req: Request, res: Response) =>{
        try {
            // fetch employee id from params
            const {employe_id} = req.params;
            let employee;
            
            if(employe_id){
                // check if employee exist
                const employeeExist = await prisma.employee.findUnique({where: {employe_id}});
                if(!employeeExist) return res.status(HttpCode.NOT_FOUND).json({msg: "employee not exist"})
    
                employee = await prisma.employee.findUnique({
                    where: {employe_id},
                    select: {
                        name: true,
                        email: true,
                        post: true,
                        salary: true
                    }
                });
                if(!employee) return res.status(HttpCode.NOT_FOUND).json({msg: "error when extracting employees data !"})
    
            }else{
                employee = await prisma.employee.findMany({
                    select: {
                        name: true,
                        email: true,
                        post: true,
                        salary: true
                    }
                });
                if(!employee) return res.status(HttpCode.NOT_FOUND).json({msg: "error when extracting employees data !"})                
                if(employee.length===0) res.status(HttpCode.NO_CONTENT).json({msg: "empty employee list!"});
            }            
                
            // Return success message
            res
                .status(HttpCode.OK)
                .json({msg: employee})
        } catch (error) {
            return errors.serverError(res, error);
        }
    },

    // function to update employee
    updateEmployeeData: async (req: Request, res: Response) =>{
        try {
            // fetch data from body
            const {employe_id} = req.params;
            if(!employe_id) return res.status(HttpCode.BAD_REQUEST).json({msg: "All fields are mandatory !"})

            // check if employee exist
            const employeeExist = await prisma.employee.findUnique({where: {employe_id}});
            if(!employeeExist) return res.status(HttpCode.NOT_FOUND).json({msg: "employee not exist"})

            // fetch data from body
            const {name, email, password, post, salary} = req.body;            

            const hashPassword = await hashText(password);
            if(!hashPassword) return res.status(HttpCode.BAD_REQUEST).json({msg: ""})

            const updateEmployee = await prisma.employee.update({
                where: {employe_id},
                data: { name, email, password: hashPassword, post, salary },
                select: { name: true, email: true, post: true, salary:true },
            });
            if(!updateEmployee) return res.status(HttpCode.NOT_FOUND).json({msg: "error when update employee !"});

            // Return success message
            res
                .status(HttpCode.CREATED)
                .json({msg: updateEmployee})
        } catch (error) {
            return errors.serverError(res, error);
        }
    },

    // function to delete employee
    deleteEmployee: async (req: Request, res: Response) =>{
        try {
            // fetch data from body
            const {employe_id} = req.params;
            if(!employe_id) return res.status(HttpCode.BAD_REQUEST).json({msg: "All fields are mandatory !"})
            
            // check if employee exist
            const employeeExist = await prisma.employee.findUnique({where: {employe_id}});
            if(!employeeExist) return res.status(HttpCode.NOT_FOUND).json({msg: "employee not exist"})
            
            const deleteEmployee = await prisma.employee.delete({where: {employe_id}});
            if(!deleteEmployee) return res.status(HttpCode.NOT_FOUND).json({msg: "error when delete employee !"})

            // Return success message
            res
                .status(HttpCode.OK)
                .json({msg: `${deleteEmployee.name} has been delete successfuly!`})
        } catch (error) {
            return errors.serverError(res, error);
        }
    }    
}

export default employeeControllers;
