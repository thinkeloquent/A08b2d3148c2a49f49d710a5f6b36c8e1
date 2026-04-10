import { Sequelize } from 'sequelize';
import { PostgresConfig } from './config.js';
import type { PostgresConfigOptions } from './config.js';
import { DatabaseConnectionError } from './exceptions.js';

const TRUTHY_ENV_VALUES = new Set(['1', 'true', 'yes', 'on']);

function readBooleanEnv(...keys: string[]): boolean {
    for (const key of keys) {
        const value = process.env[key];
        if (!value) {
            continue;
        }

        if (TRUTHY_ENV_VALUES.has(value.trim().toLowerCase())) {
            return true;
        }
    }

    return false;
}

function createSequelizeLogger() {
    return (message: string, timing?: number) => {
        if (typeof timing === 'number') {
            console.log(`[sequelize ${timing}ms] ${message}`);
            return;
        }
        console.log(`[sequelize] ${message}`);
    };
}

export function getPostgresClient(config: PostgresConfig | PostgresConfigOptions): Sequelize {
    if (!(config instanceof PostgresConfig)) {
        config = new PostgresConfig(config);
    }

    const dialectOptions = config.getSequelizeDialectOptions();
    const shouldLogSequelize = readBooleanEnv(
        'SEQUELIZE_LOGGING',
        'SEQUELIZE_VERBOSE',
        'CI_SEQUELIZE_VERBOSE',
    );
    const shouldLogQueryParameters = shouldLogSequelize || readBooleanEnv('SEQUELIZE_LOG_QUERY_PARAMETERS');

    return new Sequelize({
        dialect: 'postgres',
        host: config.host,
        port: config.port,
        username: config.username,
        password: config.password,
        database: config.database,
        schema: config.schema,
        logging: shouldLogSequelize ? createSequelizeLogger() : false,
        benchmark: shouldLogSequelize,
        logQueryParameters: shouldLogQueryParameters,
        define: {
            schema: config.schema,
        },
        pool: {
            max: config.maxConnections,
            min: 0,
            acquire: 30000,
            idle: 10000,
        },
        dialectOptions: dialectOptions,
    });
}

export async function checkConnection(client: Sequelize): Promise<boolean> {
    try {
        await client.authenticate();
        return true;
    } catch (error: unknown) {
        const err = error instanceof Error ? error : new Error(String(error));
        throw new DatabaseConnectionError(`Health check failed: ${err.message}`, err);
    }
}
