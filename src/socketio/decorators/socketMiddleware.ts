import {Middleware} from "@tsed/common";
import {SocketProviderTypes} from "../interfaces/ISocketProviderMetadata";

/**
 *
 * @returns {Function}
 * @constructor
 */
export function SocketMiddleware(): Function {
    return (target: Type<any>) => {

        store.merge("socketIO", {
            type: SocketProviderTypes.MIDDLEWARE,
            handlers: {
                use: {
                    methodClassName: "use"
                }
            }
        });

        return Middleware()(target);
    };
}