import nodemailer from 'nodemailer'
import fs from 'fs';
import ejs from 'ejs';
import path from 'path'
import dotenv from 'dotenv'

dotenv.config();

interface ItemplateData {
    name: string,
    content: string
}
const emailConfig = {
    email: process.env.EMAIL as string,
    password: process.env.PASSWORD as string
}
const validateEmailConfig = () => {
    if(!emailConfig.email || !emailConfig.password){
        console.error("email address or password not config!");
        process.exit(1);
    }
};
validateEmailConfig();

// Configuration du transporteur de l'email
const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    // port: parseInt(process.env.PORT as string || "400"),
    port: 465,
    secure: true,
    auth: {
        user: emailConfig.email,
        pass: emailConfig.password,
    },
});

async function sendMail(receiver: string, templateData: ItemplateData) {
    try {
        // Lecture du contenu du template ejs
        const templatePath = path.join(__dirname + '/sendmail.ejs')
        const template = fs.readFileSync(templatePath, 'utf8')

        // Creer un rendu HTML avec les données lu dans le fichier ejs.
        const content = ejs.render(template, templateData)

        //options du message a envoyer
        const mailOptions = {
            from: emailConfig.email,
            to: receiver,
            subject: "Employee of Dark Agence",
            html: content
        }

        // Envoi du message
        await transporter.sendMail(mailOptions)
        console.log("message successfuly send");
    } catch (error) {
        console.error(`eeror when trying to send mail: ${error}`)
        throw error;
    }
}

export default sendMail;