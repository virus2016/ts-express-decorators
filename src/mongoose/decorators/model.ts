import * as mongoose from "mongoose";
import {createModel, createSchema} from "../utils";
import {registerModel} from "../utils/registerModel";

export interface ModelOptions {
    // definition?: mongoose.SchemaDefinition;
    schemaOptions?: mongoose.SchemaOptions;
    name?: string;
    collection?: string;
    skipInit?: boolean;
    plugins?: [{ plugin: (schema: mongoose.Schema, options?: any) => void, options?: any }];
}

/**
 * Define a class a Mongoose Model. The model can be injected to the Service, Controller, Middleware, Converters or Filter with
 * `@Inject` annotation.
 *
 * ### Example
 *
 * ```typescript
 * @Model()
 * export class EventModel {
 *   @Property()
 *   field: string;
 * }
 * ```
 *
 * Then inject the model into a service:
 *
 * ```typescript
 * class MyService {
 *    constructor(@Inject(EventModel) eventModel: MongooseModel<EventModel>) {
 *        eventModel.find().exec();
 *    }
 * }
 * ```
 *
 * ### Options
 *
 * - `schemaOptions` (mongoose.SchemaOptions): Option to configure the schema behavior.
 * - `name` (String): model name.
 * - `collection` (String): collection (optional, induced from model name).
 * - `skipInit` (Boolean): skipInit whether to skip initialization (defaults to false).
 *
 * @param {ModelOptions} options
 * @returns {(target: any) => void}
 * @decorator
 * @mongoose
 */
export function Model(options: ModelOptions = {}) {
    return (target: any) => {
        const schema = createSchema(target, options.schemaOptions); // Object.assign(createSchema(target, options.schemaOptions), options.definition || {});

        if (options.plugins) {
            options.plugins.forEach((item) => schema.plugin(item.plugin, item.options));
        }

        const model = createModel(target, schema, options.name, options.collection, options.skipInit);
        registerModel(target, model);

        // ProviderRegistry.get(target).store.set("mongooseSchema", schema);
    };
}
