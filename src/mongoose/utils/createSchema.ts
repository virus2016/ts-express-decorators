import {Type} from "@tsed/core";
import * as mongoose from "mongoose";
import {buildMongooseSchema} from "./buildMongooseSchema";

/**
 *
 * @param {Type<any>} target
 * @param {"mongoose".SchemaOptions} options
 * @returns {"mongoose".Schema}
 */
export function createSchema(target: Type<any>, options?: mongoose.SchemaOptions): mongoose.Schema {
    const definition: mongoose.SchemaDefinition = buildMongooseSchema(target);
    return new mongoose.Schema(definition, options);
}
