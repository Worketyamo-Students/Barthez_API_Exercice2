// src/core/config/env.ts

import 'dotenv/config';
import { get } from 'env-var';

export const envs = {
	PORT: get('PORT').required().asPortNumber(),
	API_PREFIX: get('DEFAULT_API_PREFIX').default('/api/v1').asString(),
	NODE_ENV: get('NODE_ENV').default('development').asString(),
	MONGO_INITDB_ROOT_USERNAME: get('MONGO_INITDB_ROOT_USERNAME').default('admin').asString(),
	MONGO_INITDB_ROOT_PASSWORD: get('MONGO_INITDB_ROOT_PASSWORD').default('test123').asString(),
	MONGO_DB_NAME: get('MONGO_DB_NAME').default('worketyamo').asString()

	// JWT_ALGORITHM="PS256"
	// JWT_ACCESS_EXPIRES_IN="1h"
	// JWT_REFRESH_EXPIRES_IN="30d"
	// JWT_PRIVATE_KEY="./keys/private.key"
	// JWT_PUBLIC_KEY="./keys/public.key"
	// JWT_REFRESH_PRIVATE_KEY="./keys/refresh-private.key"
	// JWT_REFRESH_PUBLIC_KEY="./keys/refresh-public.key"
	
	// # configuration of mail sender
	// EMAIL_HOST="smtp.gmail.com"
	// EMAIL="kenwoubarthez@gmail.com"
	// PASSWORD="yuzf avhj bzce kxmk "
	// # PORT="465"
	// SECURITY=true
};

export const CONNECTION_STRING = `mongodb://${envs.MONGO_INITDB_ROOT_USERNAME}:${envs.MONGO_INITDB_ROOT_PASSWORD}@172.28.0.2:27017/${envs.MONGO_DB_NAME}?authSource=admin`;
