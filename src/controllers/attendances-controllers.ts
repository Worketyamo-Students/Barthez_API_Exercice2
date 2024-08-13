import { Request, Response } from "express";
import { HOURS_OF_WORKS, HttpCode } from "../core/constants";
import errors from "../functions/error";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const attendanceControllers = {
    // Saving Comming Hours
    beginOfAttendance: async (req: Request, res: Response) =>{
        try {
            // fetch employeID from body
            const {employeeID} = req.body;            
            if(!employeeID) return res.status(HttpCode.BAD_REQUEST).json({msg: "you should enter the employeID !"})

            // Check if user employee exist
            const employee = await prisma.employee.findUnique({where: {employe_id: employeeID}})
            if(!employee) return res.status(HttpCode.BAD_REQUEST).json({msg: "employee not found !"});
        
            // Initialise date
            const date = new Date()
            const dateOfToday = new Date(date.getFullYear(), date.getMonth(), date.getDate())
            
            // Check if employee had ever sign  in
            const attendanceExist = await prisma.attendance.findFirst({where: {
                employeeID,
                date: dateOfToday
            }})
            if(attendanceExist) return res.status(HttpCode.BAD_REQUEST).json({msg: "Has ever sign today"});

            // Save comming Hours
            const attendance = await prisma.attendance.create({
                data:{
                    employeeID,
                    date: dateOfToday,
                    startTime: date,
                } 
            });
            if(!attendance) return res.status(HttpCode.NOT_FOUND).json({msg: 'error when ading attendance !'})

            // Return success message
            res
                .status(HttpCode.CREATED)
                .json({msg: `comming hours save for the  ${attendance.startTime.getDate()}/${attendance.startTime.getMonth()+1}/${attendance.startTime.getFullYear()}, at ${attendance.startTime.getHours()}H ${attendance.startTime.getMinutes()}Min`})!
        } catch (error) {
            return errors.serverError(res, error);
        }
    },

    // Saving Comme out Hours
    endOfAttendance: async (req: Request, res: Response) =>{
        try {
            // fetch employeID from body
            const {employeeID} = req.body;            
            if(!employeeID) return res.status(HttpCode.BAD_REQUEST).json({msg: "you should enter the employeID !"})

            // Check if user employee exist
            const employeeExist = await prisma.employee.findUnique({where: {employe_id: employeeID}})
            if(!employeeExist) return res.status(HttpCode.BAD_REQUEST).json({msg: "employee not found !"});

            // Initialise date
            const date = new Date()
            const dateOfToday = new Date(date.getFullYear(), date.getMonth(), date.getDate())
            
            // Check if employee had ever signin In the morning 
            const attendance = await prisma.attendance.findFirst({where: {
                employeeID,
                date: dateOfToday
            }})
            if(!attendance) return res.status(HttpCode.BAD_REQUEST).json({msg: "did not register upon arrival"});
            
            if(typeof(attendance.endTime) !== "object") return res.status(HttpCode.BAD_REQUEST).json({msg: "has already signed for his returned !"});

            // sort by date all the attendance of that employee 
            const updateAttendance = await prisma.attendance.update({
                where: {
                    attendance_id: attendance.attendance_id
                },
                data: {
                    endTime: date
                }
            });
            if(!updateAttendance) return res.status(HttpCode.NOT_FOUND).json({msg: "error when added end of attendance!"})
            
            if(!updateAttendance.endTime) return res.status(HttpCode.BAD_REQUEST).json({msg: "should defined the end Time before to continue !"});
            
            // Automatically create abscence
            let abscenceHours = 0;
            
            // Calculate abscences hours.
            let startTime = updateAttendance.startTime.getHours();
            if(updateAttendance.startTime.getMinutes()>45){
                startTime += 1;
            }
            let endTime = updateAttendance.endTime.getHours();
            if(updateAttendance.endTime.getMinutes()>45){
                endTime += 1;
            }
            abscenceHours = HOURS_OF_WORKS - (endTime - startTime);
            
            if(abscenceHours < 0){
                abscenceHours = 0;
            }
            
            // Create abscence
            const createAbscence = await prisma.absence.create({
                data: {
                    employeeID,
                    date: dateOfToday,
                    absenceHours: abscenceHours,
                }
            });
            if(!createAbscence) return res.status(HttpCode.NOT_FOUND).json({msg: "error when creating abscence"});

            // Return success message
            res
                .status(HttpCode.CREATED)
                .json({msg: `return hour save for the  ${attendance.startTime.getDate()}/${attendance.startTime.getMonth()+1}/${attendance.startTime.getFullYear()}, at ${attendance.startTime.getHours()}H ${attendance.startTime.getMinutes()}Min`})!
        } catch (error) {
            return errors.serverError(res, error);
        }
    },

    consultAttendances: async (req: Request, res: Response) =>{
        try {
            // fetch employeID from body
            const {employeeID} = req.body;
            if(!employeeID) return res.status(HttpCode.BAD_REQUEST).json({msg: "you should enter the employeeID !"})

            // Check if user employee exist
            const employee = await prisma.employee.findUnique({where: {employe_id: employeeID}})
            if(!employee) return res.status(HttpCode.BAD_REQUEST).json({msg: "employee not found !"});
        
            // sort by date all the attendances of that employee 
            const attendances = await prisma.attendance.findMany({
                where: {
                    employeeID
                },
                orderBy: {
                    date: 'desc'
                },
                select: {
                    date: true,
                    startTime: true,
                    endTime: true
                }
            });
            if(!attendances || attendances.length === 0) return res.status(HttpCode.NOT_FOUND).json({msg: "Not attendance found for this employee !"})
            
            const infoAttendance = {
                employeInfo: {
                    "name": employee.name,
                    "email": employee.email,
                    "post": employee.post,
                    "salary": employee.salary
                },
                attendances
            }

            // Return success message
            res
                .status(HttpCode.OK)
                .json({msg: infoAttendance})
        } catch (error) {
            return errors.serverError(res, error);
        }
    }

}

export default attendanceControllers;