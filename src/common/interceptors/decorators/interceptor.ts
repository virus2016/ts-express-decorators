import {registerService} from "../../di/registries/ProviderRegistry";

export function Interceptor(): Function {
    return (target: any): void => {
        registerService(target);
        return target;
    };
}
