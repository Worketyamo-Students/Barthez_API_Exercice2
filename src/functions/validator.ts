import { body } from "express-validator";

const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z]).{5,}$/;

const validator = {
    validateEmployee: [
        // Validation of employee name
        body('name')
            .exists().withMessage('name is required !')
            .trim().notEmpty().withMessage('name cannot be empty !')
            .isString().withMessage('name should have a string !')
            .isLength({min:3}).withMessage('name is to short !')
            .isLength({max: 25}).withMessage('name is too long !')
        ,
        // Validatoion of employee email
        body('email')
            .exists().withMessage('email is required !')
            .trim().notEmpty().withMessage('email can\'t be empty !')
            .isEmail().withMessage('invalid email !')
        ,
        // validation of employee password
        body('password')
            .exists().withMessage('required password !')
            .trim().notEmpty().withMessage('password can\'t be empty!')
            .matches(passwordRegex).withMessage('password too week !')
        ,
        body('post')
            .exists().withMessage('post is required !')
            .trim().notEmpty().withMessage('post cannot be empty !')
            .isString().withMessage('post should have a string !')
            .isLength({min:2}).withMessage('post is too short !')
            .isLength({max: 25}).withMessage('post is too long !')
        ,
        body('salary')
            .exists().withMessage('salary is required !')
            .trim().notEmpty().withMessage('salary cannot be empty !')
            .isInt({min: 500, max: 100000000}).withMessage('invalid salary !')
        ,
    ],

    validateBook: [
        // validation of title
        body('title')
            .exists().withMessage('Le titre est requis !')
            .trim().notEmpty().withMessage('Le titre ne doit pas etre vide !')
            .isString().withMessage('le titre doit etre une chaine de caractere !')
            .isLength({min: 3}).withMessage('titre trop court !')
            .isLength({max: 30}).withMessage('titre trop long !')
        ,
        //validation of author
        body('author')
            .exists().withMessage('Le name de l\'autheur est requis !')
            .trim().notEmpty().withMessage('Le name de l\'autheur ne doit pas etre vide !')
            .isString().withMessage('le name de l\'autheur doit etre une chaine de caractere !')
            .isLength({min: 3}).withMessage('name de l\'autheur trop court !')
            .isLength({max: 30}).withMessage('name de l\'autheur trop long !')
        ,
        //Validation of description
        body('description')
            .exists().withMessage('La description est requis !')
            .trim().notEmpty().withMessage('La description ne doit pas etre vide !')
            .isString().withMessage('la description doit etre une chaine de caractere !')
            .isLength({min: 3}).withMessage('description trop courte !')
            .isLength({max: 120}).withMessage('description trop longue !')
        ,
        //validation of publicateYear
        body('publicateYear')
            //Add a contraint obout the type number
            .exists().withMessage('L\'année est requis !')
            .isInt({min: 1700, max: (new Date).getFullYear()})
            .withMessage('l\'année de publicatiion doit etre une années valide !')
        ,

        // validation of ISBN
        body('ISBN')
            .optional() // l'ISBN est facultatif
            .isISBN().withMessage("Format ISBN incorrect !")
        ,
    ],

    validateNotification: [
        
        //validation of message
        body('message')
            .exists().withMessage('Le message de est requis !')
            .trim().notEmpty().withMessage('le message ne peut etre vide')
            .isString().withMessage('le message doit etre une chaine de caractere !')
            .isLength({min: 4}).withMessage('message trop court')
            .isLength({max: 500}).withMessage('message trop long')
        ,
    ],

    validateLoand: [
        // validation de l'id de l'utilisateur entrer
        body('employeeID')
            .exists().withMessage('L\'ID de l\'utilisateur est requis !')
            .trim().notEmpty().withMessage('L\'ID de l\'utilisateur ne peut etre vide')
            .isMongoId().withMessage('Format de l\'ID invalide !')
        ,
        // validation de l'id du livre
        body('bookID')
            .exists().withMessage('L\'ID du livre est requis !')
            .trim().notEmpty().withMessage('L\'ID du livre ne peut etre vide')
            .isMongoId().withMessage('Format de l\'ID invalide !')
        ,
    ]
}
export default validator;