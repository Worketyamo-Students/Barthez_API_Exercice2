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

// Journalisations
app.use(morgan('combined'));

// Documentation
setupSwagger(app);

// Export
export default app;
