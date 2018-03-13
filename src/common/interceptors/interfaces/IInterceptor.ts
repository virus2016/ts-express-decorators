import {IInterceptorContext} from "./IInterceptorContext";

export interface IInterceptor {
    aroundInvoke: (ctx: IInterceptorContext, options?: any) => any;
}