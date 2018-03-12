import {IInterceptor, IInterceptorContext, Interceptor} from "@tsed/common";
import {MyService} from "../services/MyService";

@Interceptor()
export class PermissionInterceptor implements IInterceptor {

    constructor(myService: MyService) {
        console.log(myService);
    }

    aroundInvoke(ctx: IInterceptorContext) {
        console.log("=====>");
        const data = ctx.proceed();
    }
}