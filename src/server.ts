// src/server.ts
// Configurations de Middlewares
import express from 'express';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import { setupSwagger } from './swagger';
import morgan from 'morgan';
import { ONE_HUNDRED, SIXTY } from './core/constants';
import helmet from 'helmet'
import cors from 'cors'
import employee from './routes/employees-route';
import attendance from './routes/attendances-routes';
import abscence from './routes/abscences-routes';


const app = express();

// Securisations
app.use(helmet())
app.use(cors())

//globaux
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(compression());
app.use(
	rateLimit({
		max: ONE_HUNDRED,
		windowMs: SIXTY,
		message: 'Trop de Requete à partir de cette adresse IP '
	})
);

// Routes du programme
app.use(
	"/employees",
	rateLimit({
		max: 20,
		windowMs: 60000,
		handler: (req, res) => {
			res.status(429).json({msg: "Too much request from this address"})
		}
	}),
	employee
);

app.use(
	"/attendance",
	rateLimit({
		max: 20,
		windowMs: 60000,
		handler: (req, res) => {
			res.status(429).json({msg: "Too much request from this address"})
		}
	}),
	attendance
);

app.use(
	rateLimit({
		max: 20,
		windowMs: 60000,
		handler: (req, res) => {
			res.status(429).json({msg: "Too much request from this address"})
		}
	}),
	abscence
);

// Journalisations
app.use(morgan('combined'));

// Documentation
setupSwagger(app);

// Export application to app file
export default app;
