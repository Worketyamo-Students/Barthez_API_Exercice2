import { Request, Response } from "express";
import { HttpCode } from "../core/constants";
import errors from "../functions/error";
import sendMail from "../functions/sendmail";
import prisma from "../core/config/prisma";
import { customRequest } from "../middlewares/auth-middleware";


const abscencesControllers = {
    abscencesHours: async (req: customRequest, res: Response) =>{
        try {
            // fetch employeID from authentification
            const employeeID = req.employee?.employe_id;            
            if(!employeeID) return res.status(HttpCode.UNAUTHORIZED).json({msg: "authentification error !"})

            // Check if user employee exist
            const employee = await prisma.employee.findUnique({where: {employe_id: employeeID}})
            if(!employee) return res.status(HttpCode.BAD_REQUEST).json({msg: "employee not found !"});

            const {start, end} = req.query;
            if(!start || !end) return res.json({msg: "You should specified de begin and the end date to get total abscence hours !"})

            // Defines the date with the value that user enter
            const today = new Date();
            const startDate = new Date(start as string);
            const endDate = new Date(end as string);
            
            // Check if the defines value are logic and correct
            if(startDate > today) return res.status(HttpCode.BAD_REQUEST).json({msg: "please enter a correct start date !"});
            if(endDate < startDate || endDate < today) return res.status(HttpCode.BAD_REQUEST).json({msg: "please enter a correct end date !"});

            // Fetch abscences for the specified period
            const absences = await prisma.absence.findMany({
                where: {
                    employeeID,
                    date: {
                        gte: startDate,
                        lte: endDate
                    }
                }
            });
            if(!absences) return res.status(HttpCode.NOT_FOUND).json({msg: "Error fetching absences!"});
            if(absences.length === 0) res.status(HttpCode.NO_CONTENT).json({msg: "No abscence save for this employee, he is perfect !"});

            // Calculate total Hours
            let totalHours = 0;
            absences.forEach((abscence) => {
                totalHours += abscence.absenceHours;
            })
            
            // Return success message
            res
                .status(HttpCode.CREATED)
                .json({msg: `Total Abscences Hours for this period: ${totalHours}!`})
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

            const {start, end} = req.query;
            if(!start || !end) return res.json({msg: "You should specified de begin and the end date to get total abscence hours !"})
            
            // Defines the date with the value that user enter
            const today = new Date();
            const startDate = new Date(start as string);
            const endDate = new Date(end as string);
            
            // Check if the defines value are logic and correct
            if(startDate > today) return res.status(HttpCode.BAD_REQUEST).json({msg: "please enter a correct start date !"});
            if(endDate < startDate || endDate < today) return res.status(HttpCode.BAD_REQUEST).json({msg: "please enter a correct end date !"});

            // Fetch abscences for the specified period
            const absences = await prisma.absence.findMany({
                where: {
                    employeeID,
                    date: {
                        gte: startDate,
                        lte: endDate
                    }
                }
            });
            if(!absences) return res.status(HttpCode.NOT_FOUND).json({msg: "Error fetching absences!"});
            if(absences.length === 0) res.status(HttpCode.NO_CONTENT).json({msg: "No abscence save for this employee, he is perfect !"});

            // Calculate total Hours
            let totalHours = 0;
            absences.forEach((abscence) => {
                totalHours += abscence.absenceHours;
            })
            
            // fetch salary of this employee
            const employeeSalary = employee.salary;
            const hoursSalary = (employeeSalary)/(8*30);
            
            // Amount Reduction
            const reduction = hoursSalary * totalHours;

            const newSalary = parseFloat((employeeSalary - reduction).toFixed(2));

            // Send Notification to user about his attendance, abcences hours, and new salary
            const message = `
                Over the period from <b>${startDate.getDate()}-${startDate.getMonth()+1}-${startDate.getFullYear()}</b> to 
                <b>${endDate.getDate()}-${endDate.getMonth()+1}-${endDate.getFullYear()}</b>, 
                you had <b>${totalHours}</b> hours of absence. 
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