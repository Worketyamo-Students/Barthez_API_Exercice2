// src/core/config/env.ts

import 'dotenv/config';
import { get } from 'env-var';

export const envs = {
	//  Global Informations
	PORT: get('PORT').required().asPortNumber(),
	API_PREFIX: get('DEFAULT_API_PREFIX').default('/api/v1').asString(),
	NODE_ENV: get('NODE_ENV').default('development').asString(),
	
	// DataBAse Inforlation
	MONGO_INITDB_ROOT_USERNAME: get('MONGO_INITDB_ROOT_USERNAME').default('admin').asString(),
	MONGO_INITDB_ROOT_PASSWORD: get('MONGO_INITDB_ROOT_PASSWORD').default('test123').asString(),
	MONGO_DB_NAME: get('MONGO_DB_NAME').default('worketyamo').asString(),
	
	// Information about jwt tokens
	JWT_ALGORITHM: get('JWT_ALGORITHM').default("RS256").asString(),
	JWT_ACCESS_EXPIRES_IN: get('JWT_ACCESS_EXPIRES_IN').default("20min").asString(),
	JWT_REFRESH_EXPIRES_IN: get('JWT_REFRESH_EXPIRES_IN').default("30d").asString(),
	JWT_PRIVATE_KEY: get('JWT_PRIVATE_KEY').default("./keys/private.key").asString(),
	JWT_PUBLIC_KEY: get('JWT_PUBLIC_KEY').default("./keys/public.key").asString(),
	JWT_REFRESH_PRIVATE_KEY: get('JWT_REFRESH_PRIVATE_KEY').default("./keys/refresh-private.key").asString(),
	JWT_REFRESH_PUBLIC_KEY: get('JWT_REFRESH_PUBLIC_KEY').default("./keys/refresh-public.key").asString(),

	// # configuration of mail sender
	MAIL_HOST: get('MAIL_HOST').default("gmail").asString(),
	MAIL_ADDRESS: get('MAIL_ADDRESS').default("address@gmail.com").asString(),
	MAIL_PASSWORD: get('MAIL_PASSWORD').default("password").asString(),
	MAIL_PORT: get('MAIL_PORT').required().asPortNumber(),
	MAIL_SECURITY: get('MAIL_SECURITY').default("false").asBool(),
};

export const CONNECTION_STRING = `mongodb://${envs.MONGO_INITDB_ROOT_USERNAME}:${envs.MONGO_INITDB_ROOT_PASSWORD}@172.28.0.2:27017/${envs.MONGO_DB_NAME}?authSource=admin`;
