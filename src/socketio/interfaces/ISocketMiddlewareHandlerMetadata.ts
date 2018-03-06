import {ISocketParamMetadata} from "./ISocketParamMetadata";
import {SocketReturnsTypes} from "./SocketReturnsTypes";

export interface ISocketMiddlewareHandlerMetadata {
    parameters: { [key: number]: ISocketParamMetadata };
    returns?: {
        type: SocketReturnsTypes;
        eventName: string;
    };
}