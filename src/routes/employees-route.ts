import { Router } from "express";
import employeeControllers from "../controllers/employees-controllers";
import { validator, validate } from '../functions/validator';

const employee = Router();

// Inscription of new employee
employee.post(
    '/', 
    validator.validateEmployee, 
    validate, 
    employeeControllers.inscription
);

// Connexion of employee
employee.post(
    '/login', 
    validator.validateEmployeeLogin, 
    validate, 
    employeeControllers.connexion
);

// Deconnexion of employee
employee.post(
    '/logout/:employe_id', 
    validator.validateEmployeeID, 
    validate, 
    employeeControllers.deconnexion
);

// consultation of employee
employee.get(
    '/profile/:employe_id?', 
    employeeControllers.consultEmployee
);

// update employee
employee.put(
    '/profile/:employe_id', 
    validator.validateEmployee, 
    validate, 
    employeeControllers.updateEmployeeData
);

// Delete employee
employee.delete(
    '/profile/:employe_id', 
    validator.validateEmployeeID, 
    validate, 
    employeeControllers.deleteEmployee
);

export default employee;