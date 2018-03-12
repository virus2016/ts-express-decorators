import {registerService} from "../../di/registries/ProviderRegistry";

export interface IInterceptorContext {
    target: any;
    method: string;
    args: any[];
    proceed: <T>(err?: Error) => T;
}

export interface IInterceptor {
    aroundInvoke(ctx: IInterceptorContext): any;
}

export function Interceptor(): Function {
    return (target: any): void => {
        registerService(target);
        return target;
    };
}
