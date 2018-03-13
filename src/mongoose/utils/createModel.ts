import {ConverterService, IConverterOptions, InjectorService} from "@tsed/common";
import {getClass, nameOf, Store} from "@tsed/core";
import * as mongoose from "mongoose";
import {MongooseModel} from "../interfaces/MongooseModel";

/**
 * Create an instance of mongoose.model from a class.
 *
 * @param {Type<any>} target Class attached to the schema and model.
 * @param {"mongoose".Schema} schema Schema that will be attached to the model.
 * @param name model name
 * @param collection (optional, induced from model name)
 * @param skipInit whether to skip initialization (defaults to false)
 * @returns {Model<T extends Document>}
 */
export function createModel<T>(target: any, schema: mongoose.Schema, name: string = nameOf(target), collection?: string, skipInit?: boolean): MongooseModel<T> {

    Store.from(target).set("mongooseModelName", name);

    target.prototype.serialize = function (options: IConverterOptions) {
        const {checkRequiredValue, ignoreCallback} = options;
        return InjectorService.get<ConverterService>(ConverterService).serializeClass(this, {
            type: getClass(target),
            checkRequiredValue,
            ignoreCallback
        });
    };

    schema.loadClass(target);
    const modelInstance = mongoose.model(name, schema, collection, skipInit);

    return modelInstance as any;
    /*const proxyModel = new Proxy(modelInstance, {
        construct(target, args) {
            const obj = {};
            args[0] = deepExtends(obj, args[0]);
            return new target(...args);
        }
    });

    return proxyModel as any; // proxyModel as any;*/
}