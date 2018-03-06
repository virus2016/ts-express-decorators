import {MiddlewareRegistry, MiddlewareType, ProviderStorable} from "@tsed/common";
import {Store} from "@tsed/core";
import * as SocketIO from "socket.io";
import {$log} from "ts-log-debug";
import {ISocketHandlerMetadata} from "../interfaces/ISocketHandlerMetadata";
import {ISocketParamMetadata} from "../interfaces/ISocketParamMetadata";
import {ISocketProviderMetadata} from "../interfaces/ISocketProviderMetadata";

import {SocketFilters} from "../interfaces/SocketFilters";
import {SocketReturnsTypes} from "../interfaces/SocketReturnsTypes";

/**
 * @experimental
 */
export class SocketHandlersBuilder {
    private socketProviderMetadata: ISocketProviderMetadata;

    constructor(private provider: ProviderStorable<any>) {
        this.socketProviderMetadata = this.provider.store.get("socketIO");
    }

    /**
     *
     * @returns {any}
     */
    public build(nsp: SocketIO.Namespace) {
        const {instance} = this.provider;

        if (instance.$onDisconnect) {
            const handler = this.socketProviderMetadata.handlers["$onDisconnect"] || {};
            handler.eventName = "disconnect";
            handler.methodClassName = "$onDisconnect";

            this.socketProviderMetadata.handlers["$onDisconnect"] = handler;
        }

        nsp.on("connection", (socket) => this.onConnection(socket, nsp));

        instance._nspSession = new Map();
        instance[this.socketProviderMetadata.injectNamespace || "nsp"] = nsp;

        if (instance.$onNamespaceInit) {
            instance.$onNamespaceInit(nsp);
        }
    }

    /**
     *
     * @param {SocketIO.Socket} socket
     * @param {SocketIO.Namespace} nsp
     */
    private onConnection(socket: SocketIO.Socket, nsp: SocketIO.Namespace) {
        const {instance} = this.provider;

        this.buildHandlers(socket, nsp);
        this.createSession(socket);

        socket.on("disconnect", () => {
            this.destroySession(socket);
        });

        if (instance.$onConnection) {
            const config = this.socketProviderMetadata.handlers.$onConnection;
            config.methodClassName = "$onConnection";

            this.invoke(config, [], socket, nsp);
        }
    }

    /**
     *
     * @param {SocketIO.Socket} socket
     */
    private createSession(socket: SocketIO.Socket) {
        this.provider.instance._nspSession.set(socket.id, new Map());
    }

    /**
     *
     * @param {SocketIO.Socket} socket
     */
    private destroySession(socket: SocketIO.Socket) {
        this.provider.instance._nspSession.delete(socket.id);
    }

    /**
     *
     * @param {SocketIO.Socket} socket
     * @param {SocketIO.Namespace} nsp
     */
    private buildHandlers(socket: SocketIO.Socket, nsp: SocketIO.Namespace) {
        Object
            .keys(this.socketProviderMetadata.handlers)
            .filter(key => key !== "$onConnection")
            .forEach((propertyKey: string) => {

                const handlerMetadata: ISocketHandlerMetadata = this.socketProviderMetadata.handlers[propertyKey];
                const eventName = handlerMetadata.eventName;

                socket.on(eventName, (...args) => {
                    this.runQeue(handlerMetadata, args, socket, nsp);
                });
            });
    }

    /**
     *
     * @param {ISocketHandlerMetadata} handlerMetadata
     * @param args
     * @param {SocketIO.Socket} socket
     * @param {SocketIO.Namespace} nsp
     * @returns {(parameters) => Promise<void>}
     */
    private runQueue(handlerMetadata: ISocketHandlerMetadata, args: any[], socket: SocketIO.Socket, nsp: SocketIO.Namespace) {
        const {returns} = handlerMetadata;

        const p = Promise.resolve(args);

        if (handlerMetadata.useBefore) {
            handlerMetadata.useBefore.map((target) => this.bindMiddleware(target, p));
        }

        p.then((args) => this.invoke(this.provider.instance, method, {args, socket, nsp}));
        p.then((data) => {
            if (returns) {
                SocketHandlersBuilder
                    .sendResponse(returns.eventName, returns.type, data, {args, socket, nsp});
            }
        });

        if (handlerMetadata.useAfter) {
            handlerMetadata.useAfter.map((target) => this.bindMiddleware(target, p));
        }

        return p.catch((er) => {
            /* istanbul ignore next */
            $log.error(handlerMetadata.eventName, er);
            /* istanbul ignore next */
            process.exit(-1);
        });
    }

    /**
     *
     * @param target
     * @param promise
     * @returns {(args: any[]) => Promise<any[]>}
     */
    private bindMiddleware = (target, promise) => {
        const middlewareProvider = MiddlewareRegistry.get(target);
        const instance = middlewareMeta.instance;
        const handlerMetadata: ISocketHandlerMetadata = Store.from(instance).get("socketIO");

        if (middlewareProvider.type === MiddlewareType.ERROR) {
            promise.catch((err) =>
                this.invoke(instance, handlerMetadata, {err, socket, nsp})
            );
        } else {
            promise.then(async (args: any[]) => {
                const result = await this.invoke(instance, handlerMetadata, {args, socket, nsp});
                return result === undefined ? args : result;
            });
        }
    };
    /**
     *
     * @param target
     * @returns {(err, args: any[]) => Promise<any[]>}
     */
    private bindErrorMiddleware = (target) => {
        const instance = MiddlewareRegistry.get(target).instance;
        const middlewareMetadata: ISocketHandlerMetadata = Store.from(instance).get("socketIO");

        return async (err, args: any[]) => {
            const result = await this.invoke(instance, middlewareMetadata, {err, args, socket, nsp});
            return result === undefined ? args : result;
        };
    };

    /**
     *
     * @returns {Promise<any>}
     * @param instance
     * @param handlerMetadata
     * @param scope
     */
    private async invoke(instance: any, handlerMetadata: ISocketHandlerMetadata, scope): Promise<void> {
        const {methodClassName} = handlerMetadata;
        const parameters = this.buildParameters(handlerMetadata.parameters, scope);

        return await instance[methodClassName](...parameters);
    }

    private async invokeMiddleware(handlerMetadata: ISocketHandlerMetadata, scope: any): Promise<void> {

        // try {
        const {instance} = this.provider;
        const {methodClassName, returns} = handlerMetadata;
        const parameters = this.buildParameters(handlerMetadata.parameters, scope);

        const result = await instance[methodClassName](...parameters);

        if (returns) {
            SocketHandlersBuilder.sendResponse(returns.eventName, returns.type, result, scope);
        }
    }

    /**
     *
     * @param parameters
     * @param scope
     * @returns {any[]}
     */
    private buildParameters(parameters: { [key: number ]: ISocketParamMetadata }, scope: any): any[] {
        const store = Store.from(this.provider.instance);
        return Object
            .keys(parameters || [])
            .map(
                (index: any) => {
                    const param: ISocketParamMetadata = parameters[index];

                    switch (param.filter) {
                        case SocketFilters.ARGS:

                            if (param.mapIndex !== undefined) {
                                return scope.args[param.mapIndex];
                            }

                            return scope.args;

                        case SocketFilters.SOCKET :
                            return scope.socket;

                        case SocketFilters.NSP:
                            return scope.nsp;

                        case SocketFilters.SESSION :
                            return this.provider.instance._nspSession.get(scope.socket.id);
                    }
                }
            );
    }

    /**
     *
     * @param {string} eventName
     * @param {SocketReturnsTypes} type
     * @param response
     * @param scope
     */
    private static sendResponse(eventName: string, type: SocketReturnsTypes, response: any, scope: any) {
        switch (type) {
            case SocketReturnsTypes.BROADCAST:
                scope.nsp.emit(eventName, response);
                break;
            case SocketReturnsTypes.BROADCAST_OTHERS:
                scope.socket.broadcast.emit(eventName, response);
                break;
            case SocketReturnsTypes.EMIT:
                scope.socket.emit(eventName, response);
                break;
        }
    }
}


