import { Logger } from '../logger.js';
import { AuthConfig, AuthConfigInput, AuthConfigWithHeaders } from '../types/auth-config.js';
import { ValidationResult } from '../types/validation.js';
import { createAuthConfig } from '../create-auth-config.js';
import { toHeaders } from '../to-headers.js';
import { validateAuthConfig } from '../validate-auth-config.js';
import { getRequiredCredentials } from '../get-required-credentials.js';
import { CREDENTIAL_REQUIREMENTS } from '../constants/credential-requirements.js';
import { SDKResult, OperationMetadata } from './types.js';
import { FetchAuthConfigSDKBuilder } from './builder.js';
import { AuthType } from '@internal/auth-encoding';

export class FetchAuthConfigSDK {
    constructor(private logger: Logger) { }

    static create(): FetchAuthConfigSDKBuilder {
        return new FetchAuthConfigSDKBuilder();
    }

    get version(): string {
        return "0.1.0";
    }

    get credentialRequirements(): Record<string, string[]> {
        return CREDENTIAL_REQUIREMENTS;
    }

    get operations(): OperationMetadata[] {
        return [
            { name: "createConfig", description: "Create AuthConfig", parameters: ["input"] },
            { name: "encodeHeaders", description: "Encode to headers", parameters: ["config"] },
            { name: "validate", description: "Validate config", parameters: ["config"] },
            { name: "getRequirements", description: "Get required credentials", parameters: ["authType"] },
            { name: "listAuthTypes", description: "List valid auth types", parameters: [] },
        ];
    }

    createConfig(input: AuthConfigInput): SDKResult<AuthConfig | AuthConfigWithHeaders> {
        try {
            const result = createAuthConfig(input);
            return { success: true, data: result };
        } catch (error) {
            this.logger.error(`createConfig failed: ${error}`);
            return { success: false, error: error as Error };
        }
    }

    encodeHeaders(config: AuthConfig): SDKResult<Record<string, string>> {
        try {
            const result = toHeaders(config);
            return { success: true, data: result };
        } catch (error) {
            this.logger.error(`encodeHeaders failed: ${error}`);
            return { success: false, error: error as Error };
        }
    }

    validate(config: AuthConfig): SDKResult<ValidationResult> {
        try {
            const result = validateAuthConfig(config);
            return { success: true, data: result };
        } catch (error) {
            this.logger.error(`validate failed: ${error}`);
            return { success: false, error: error as Error };
        }
    }

    getRequirements(authType: AuthType): SDKResult<string[]> {
        try {
            const result = getRequiredCredentials(authType);
            return { success: true, data: result };
        } catch (error) {
            this.logger.error(`getRequirements failed: ${error}`);
            return { success: false, error: error as Error };
        }
    }

    listAuthTypes(): SDKResult<string[]> {
        try {
            // Using Object.keys on the requirements constant
            return { success: true, data: Object.keys(CREDENTIAL_REQUIREMENTS) };
        } catch (error) {
            this.logger.error(`listAuthTypes failed: ${error}`);
            return { success: false, error: error as Error };
        }
    }

    describe(operation: string): SDKResult<OperationMetadata> {
        const op = this.operations.find(o => o.name === operation);
        if (op) {
            return { success: true, data: op };
        }
        return { success: false, error: new Error(`Operation ${operation} not found`) };
    }
}
