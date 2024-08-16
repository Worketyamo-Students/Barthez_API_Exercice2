import { Router } from "express";
import employeeControllers from "../controllers/employees-controllers";
import { validator, validate } from '../functions/validator';
import auth from "../middlewares/auth-middleware";

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
    auth.authToken,
    employeeControllers.deconnexion
);

// consultation of employee
employee.get(
    '/profile/:employe_id?', 
    auth.authToken,
    employeeControllers.consultEmployee
);

// update employee
employee.put(
    '/profile/:employe_id', 
    validator.validateEmployee, 
    validate, 
    auth.authToken,
    employeeControllers.updateEmployeeData
);

// Delete employee
employee.delete(
    '/profile/:employe_id', 
    validator.validateEmployeeID, 
    validate, 
    auth.authToken,
    employeeControllers.deleteEmployee
);

employee.post(
    '/refresh/:employe_id',
    employeeControllers.refreshAccessToken
);

export default employee;