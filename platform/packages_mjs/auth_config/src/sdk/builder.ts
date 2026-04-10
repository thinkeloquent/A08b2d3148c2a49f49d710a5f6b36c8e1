import { Logger, createLogger } from '../logger.js';
import { FetchAuthConfigSDK } from './index.js';

export class FetchAuthConfigSDKBuilder {
    private _logger?: Logger;
    private _logLevel?: string;

    withLogger(logger: Logger): this {
        this._logger = logger;
        return this;
    }

    withLogLevel(level: string): this {
        this._logLevel = level;
        return this;
    }

    build(): FetchAuthConfigSDK {
        if (this._logLevel) {
            process.env.LOG_LEVEL = this._logLevel;
        }

        const sdkLogger = this._logger || createLogger('fetch_auth_config.sdk', import.meta.url);
        return new FetchAuthConfigSDK(sdkLogger);
    }
}
