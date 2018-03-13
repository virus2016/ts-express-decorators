export interface IInterceptorContext {
    target: any;
    method: string;
    args: any[];
    proceed: <T = any>(err?: Error) => T;
}