import { Router } from "express";
import employeeControllers from "../controllers/employees-controllers";

const employee = Router();

// Inscription of new employee
employee.post('/', employeeControllers.inscription);

// Connexion of employee
employee.post('/login', employeeControllers.connexion);

// Deconnexion of employee
employee.post('/logout/:employe_id', employeeControllers.deconnexion);

// consultation of employee
employee.get('/profile/:employe_id', employeeControllers.consultEmployee);

// update employee
employee.put('/profile/:employe_id', employeeControllers.updateEmployeeData);

// Delete employee
employee.delete('/profile/:employe_id', employeeControllers.deleteEmployee);

export default employee;