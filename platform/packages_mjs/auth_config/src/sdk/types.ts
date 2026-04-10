export interface SDKResult<T> {
    success: boolean;
    data?: T;
    error?: Error;
}

export interface OperationMetadata {
    name: string;
    description: string;
    parameters: string[];
}
