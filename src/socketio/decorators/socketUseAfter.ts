import {Store, Type} from "@tsed/core";

export function SocketUseBefore(middleware: Type<any>) {
    return (target: any, propertyKey: string, descriptor: PropertyDescriptor) => {
        Store.from(target).merge("socketIO", {
            handlers: {
                [propertyKey]: {
                    useAfter: [
                        middleware
                    ]
                }
            }
        });
    };
}
