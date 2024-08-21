import { Response } from "express";
import { HOURS_OF_WORKS, HttpCode } from "../core/constants";
import errors from "../functions/error";
import sendMail from "../functions/sendmail";
import prisma from "../core/config/prisma";
import { customRequest } from "../middlewares/auth-middleware";
import calculateAbscenceHours from "../functions/calculAbscencesHours";


const abscencesControllers = {
    abscencesHours: async (req: customRequest, res: Response) =>{
        try {
            // fetch employeID from authentification
            const employeeID = req.employee?.employe_id;            
            if(!employeeID) return res.status(HttpCode.UNAUTHORIZED).json({msg: "authentification error !"})

            const totalHours = await calculateAbscenceHours(employeeID)

            // Return success message
            res
                .status(HttpCode.CREATED)
                .json({msg: `Total Abscences Hours for this month is: ${totalHours}!`})
        } catch (error) {
            return errors.serverError(res, error);
        }
    },

    abscencesAdjustments: async (req: customRequest, res: Response) =>{
        try {
            // fetch employeID from authentification
            const employeeID = req.employee?.employe_id;            
            if(!employeeID) return res.status(HttpCode.UNAUTHORIZED).json({msg: "authentification error !"})

            // Check if user employee exist
            const employee = await prisma.employee.findUnique({where: {employe_id: employeeID}})
            if(!employee) return res.status(HttpCode.BAD_REQUEST).json({msg: "employee not found !"});

            //  Fetch hours salary
            const totalHours = await calculateAbscenceHours(employeeID);

            // fetch salary of this employee
            const employeeSalary = employee.salary;
            const hoursSalary = (employeeSalary)/(HOURS_OF_WORKS*30);
            
            // Amount Reduction
            const reduction = hoursSalary * totalHours;

            const newSalary = parseFloat((employeeSalary - reduction).toFixed(2));

            // Send Notification to user about his attendance, abcences hours, and new salary
            const message = `
                For this month, 
                you hadever <b>${totalHours}</b> hours of absence. 
                compared to your salary <b>${employeeSalary}</b>, 
                you will have a reduction of <b>${reduction}</b>, 
                your new salary amounts to: <b>${newSalary}</b>.
            `;
            sendMail(
                employee.email, 
                'The Dark Agence, Monthly Rapport',
                {name:employee.name , content: message}
            )

            // Return success message
            res
                .status(HttpCode.OK)
                .json({msg: `Old salary was: ${employeeSalary}, abscences Hours is totaly: ${totalHours}, the new salary his: ${newSalary}!`})
        } catch (error) {
            return errors.serverError(res, error);
        }
    }
}
export default abscencesControllers;