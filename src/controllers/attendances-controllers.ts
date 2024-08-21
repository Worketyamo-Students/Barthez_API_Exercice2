import { Response } from "express";
import { customRequest } from "../middlewares/auth-middleware";
import { HOURS_OF_WORKS, HttpCode, MAX_BEGIN_HOURS, MAX_END_HOURS } from "../core/constants";
import errors from "../functions/error";
import sendMail from "../functions/sendmail";
import prisma from "../core/config/prisma";

const attendanceControllers = {
    //* Saving Comming Hours
    beginOfAttendance: async (req: customRequest, res: Response) =>{
        try {
            // fetch employeID from authentification
            const employeeID = req.employee?.employe_id;            
            if(!employeeID) return res.status(HttpCode.UNAUTHORIZED).json({msg: "authentification error !"})

            // Check if user employee exist
            const employee = await prisma.employee.findUnique({where: {employe_id: employeeID}})
            if(!employee) return res.status(HttpCode.BAD_REQUEST).json({msg: "employee not found !"});
  
            // Initialise date
            const today = new Date()
            const dateOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate())
            
            // Check if employee had ever sign  in
            const attendanceExist = await prisma.attendance.findFirst({where: {
                employeeID: employee.employe_id,
                date: dateOfToday
            }})
            if(attendanceExist) return res.status(HttpCode.CONFLICT).json({msg: "Attendance already recorded for today !"});

            // Get Coming Hours
            let commingHours = today.getHours();
            let commingMinute = today.getMinutes();
            
            // Rounded hours and minutes
            if(commingMinute >= 45){
                commingHours+=1;
                commingMinute = 0;
            }else if(commingMinute >= 15){
                commingMinute = 30;
            }else{
                commingMinute = 0;
            }
            commingHours = Math.min(commingHours, MAX_END_HOURS);

            today.setHours(commingHours, commingMinute, 0, 0);
            
            // Get abscence hours and create abscence hours if necessary
            const abscencesHours = commingHours - MAX_BEGIN_HOURS;
            if(abscencesHours > 0){
                await prisma.absence.create({
                    data: {
                        employeeID: employeeID,
                        date: dateOfToday,
                        absenceHours: abscencesHours
                    }
                })
            }

            // Save comming Hours
            const attendance = await prisma.attendance.create({
                data:{
                    employeeID: employee.employe_id,
                    date: dateOfToday,
                    startTime: today,
                } 
            });
            if(!attendance) return res.status(HttpCode.NOT_FOUND).json({msg: 'error ading attendance !'})
    
            // Return success message
            res
                .status(HttpCode.CREATED)
                .json({msg: `comming hours save for the  ${attendance.startTime.getDate()}/${attendance.startTime.getMonth()+1}/${attendance.startTime.getFullYear()}, at ${attendance.startTime.getHours()}H ${attendance.startTime.getMinutes()}Min`})!
        } catch (error) {
            return errors.serverError(res, error);
        }
    },


    /*  END TIME 
        PLUS SAVE
        ABSCENCE
        HOURS
    */

    //* Saving Comme out Hours
    endOfAttendance: async (req: customRequest, res: Response) =>{
        try {
            // fetch employeID from authentification
            const employeeID = req.employee?.employe_id;            
            if(!employeeID) return res.status(HttpCode.UNAUTHORIZED).json({msg: "authentification error !"})

            // Check if user employee exist
            const employee = await prisma.employee.findUnique({where: {employe_id: employeeID}})
            if(!employee) return res.status(HttpCode.BAD_REQUEST).json({msg: "employee not found !"});

            // Initialise date
            const today = new Date()
            const dateOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate())
            
            // Check if employee had ever signin In the morning 
            const attendance = await prisma.attendance.findFirst({where: {
                employeeID,
                date: dateOfToday
            }})
            if(!attendance) return res.status(HttpCode.BAD_REQUEST).json({msg: "did not register upon arrival"});
            
            // Check if employee ever recorded the evening


            // Get Coming Hours and Set time of ending time of the day
            let endingHours = today.getHours();
            let endingMinutes = today.getMinutes();
            if(endingMinutes >= 45){
                endingHours+=1;
                endingMinutes = 0;
            }else if(endingMinutes >= 15){
                endingMinutes = 30;
            }else{
                endingMinutes = 0;
            }
            endingHours = Math.min(endingHours, MAX_END_HOURS);
            today.setHours(endingHours, endingMinutes, 0, 0);
     
            const beginHours = attendance.startTime.getHours();
            const hours_worked = endingHours - beginHours;

            // Get abscence hours
            const newAbscencesHours = Math.max(HOURS_OF_WORKS - hours_worked, 0);
            let totalAbscenceHours = newAbscencesHours;

            // fetch abscences hours of morning
            const previousAbscence = await prisma.absence.findFirst({
                where: {
                    employeeID,
                    date: dateOfToday
                }
            })
            
            if(previousAbscence) {                
                totalAbscenceHours = Math.min(newAbscencesHours + previousAbscence.absenceHours, HOURS_OF_WORKS);

                // update abscence hours
                await prisma.absence.update({
                    where: { 
                        absence_id: previousAbscence.absence_id
                    },
                    data: {employeeID,date: dateOfToday, absenceHours: totalAbscenceHours}
                })
            } else {
                totalAbscenceHours = newAbscencesHours;

                // create abscence hours
                await prisma.absence.create({
                    data: { employeeID, date: dateOfToday, absenceHours: totalAbscenceHours}
                })
            }

            // sort by date all the attendance of that employee 
            const updateAttendance = await prisma.attendance.update({
                where: {
                    attendance_id: attendance.attendance_id
                },
                data: {
                    endTime: today
                }
            });
            if(!updateAttendance) return res.status(HttpCode.NOT_FOUND).json({msg: "error when added end of attendance!"})
            
            // Send Notification to user about his attendance, returned and abcences hours
                let message = `
                    you came to work today at ${updateAttendance.startTime.getHours()}:${updateAttendance.startTime.getMinutes()} A.M, 
                    and you returned at ${updateAttendance.endTime?.getHours()}h${updateAttendance.endTime?.getMinutes()}min
                `;
                message += totalAbscenceHours > 0 ? `that's ${totalAbscenceHours} hours of absence, this will have repercussions on your salary!` 
                                                  :  'you were not late, thank you for your hard work !'

            sendMail(
                employee.email, 
                'the Dark Agence, Daily Rapport',
                {name:employee.name , content: message}
            )

            // Return success message
            res
                .status(HttpCode.CREATED)
                .json({msg: `return hour save for the  ${attendance.startTime.getDate()}/${attendance.startTime.getMonth()+1}/${attendance.startTime.getFullYear()}, at ${attendance.startTime.getHours()}H ${attendance.startTime.getMinutes()}Min`})!
        } catch (error) {
            return errors.serverError(res, error);
        }
    },



    /*  END TIME 
        PLUS SAVE
        ABSCENCE
        HOURS
    */

    //* consult employee Attendances

    consultAttendances: async (req: customRequest, res: Response) =>{
        try {
            // fetch employeID from authentification
            const employeeID = req.employee?.employe_id;            
            if(!employeeID) return res.status(HttpCode.UNAUTHORIZED).json({msg: "authentification error !"})

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
                    endTime: true,
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