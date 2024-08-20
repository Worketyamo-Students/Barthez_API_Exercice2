import { Router } from "express";
import employeeControllers from "../controllers/employees-controllers";
import { validator, validate } from '../functions/validator';
import { auth } from "../middlewares/auth-middleware";

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
    '/logout', 
    auth.authToken,
    employeeControllers.deconnexion
);

// consultation of employee
employee.get(
    '/profile', 
    auth.authToken,
    employeeControllers.consultEmployee
);

// update employee
employee.put(
    '/profile', 
    validator.validateEmployee, 
    validate, 
    auth.authToken,
    employeeControllers.updateEmployeeData
);

// Delete employee
employee.delete(
    '/profile', 
    auth.authToken,
    employeeControllers.deleteEmployee
);

employee.post(
    '/refresh/:employeeID',
    employeeControllers.refreshAccessToken
);

export default employee;