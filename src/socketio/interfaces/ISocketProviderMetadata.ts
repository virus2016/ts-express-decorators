import {ISocketHandlerMetadata} from "./ISocketHandlerMetadata";

/**
 * @experimental
 */
export enum SocketProviderTypes {
    SERVICE = "service",
    MIDDLEWARE = "middleware",
}

/**
 * @experimental
 */
export interface ISocketProviderMetadata {
    type: SocketProviderTypes;
    namespace?: string;
    injectNamespace?: string;
    handlers: {
        [propertyKey: string]: ISocketHandlerMetadata
    };
}