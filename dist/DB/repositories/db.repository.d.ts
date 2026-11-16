import { Model, MongooseUpdateQueryOptions, ProjectionType, UpdateQuery } from "mongoose";
import { QueryFilter, QueryOptions } from "mongoose";
export declare abstract class DBRepository<T> {
    readonly model: Model<T>;
    constructor(model: Model<T>);
    create: (data: Partial<T>) => Promise<import("mongoose").IfAny<T, any, import("mongoose").Document<unknown, {}, T, {}, import("mongoose").DefaultSchemaOptions> & import("mongoose").Require_id<T> & {
        __v: number;
    } & import("mongoose").AddDefaultId<T, {}, import("mongoose").DefaultSchemaOptions>>[]>;
    findOne: ({ filter, options, projection }: {
        filter: QueryFilter<T>;
        projection?: ProjectionType<T>;
        options?: QueryOptions<T>;
    }) => Promise<import("mongoose").IfAny<Omit<T, Extract<string, keyof T>> | (Pick<T, Extract<string, keyof T>> & Pick<T, Extract<"_id", keyof T>>), any, import("mongoose").Document<unknown, {}, Omit<T, Extract<string, keyof T>> | (Pick<T, Extract<string, keyof T>> & Pick<T, Extract<"_id", keyof T>>), {}, import("mongoose").DefaultSchemaOptions> & (((import("mongoose").Require_id<Omit<T, Extract<string, keyof T>>> | import("mongoose").Require_id<Pick<T, Extract<string, keyof T>> & Pick<T, Extract<"_id", keyof T>>>) & {
        __v: number;
    }) & (import("mongoose").AddDefaultId<Omit<T, Extract<string, keyof T>>, {}, import("mongoose").DefaultSchemaOptions> | import("mongoose").AddDefaultId<Pick<T, Extract<string, keyof T>> & Pick<T, Extract<"_id", keyof T>>, {}, import("mongoose").DefaultSchemaOptions>))> | null>;
    find: ({ filter, options }: {
        filter?: QueryFilter<T>;
        options?: QueryOptions<T>;
    }) => Promise<import("mongoose").IfAny<T, any, import("mongoose").Document<unknown, {}, T, {}, import("mongoose").DefaultSchemaOptions> & import("mongoose").Require_id<T> & {
        __v: number;
    } & import("mongoose").AddDefaultId<T, {}, import("mongoose").DefaultSchemaOptions>>[]>;
    countDocuments: ({ filter, options }: {
        filter?: QueryFilter<T>;
        options?: QueryOptions<T>;
    }) => Promise<number>;
    findOneAndUpdate: ({ update, filter, options }: {
        update: UpdateQuery<T>;
        filter: QueryFilter<T>;
        options?: QueryOptions<T>;
    }) => Promise<import("mongoose").IfAny<T, any, import("mongoose").Document<unknown, {}, T, {}, import("mongoose").DefaultSchemaOptions> & import("mongoose").Require_id<T> & {
        __v: number;
    } & import("mongoose").AddDefaultId<T, {}, import("mongoose").DefaultSchemaOptions>> | null>;
    findById: ({ id, options, }: {
        id: string;
        options?: QueryOptions<T>;
    }) => Promise<import("mongoose").IfAny<T, any, import("mongoose").Document<unknown, {}, T, {}, import("mongoose").DefaultSchemaOptions> & import("mongoose").Require_id<T> & {
        __v: number;
    } & import("mongoose").AddDefaultId<T, {}, import("mongoose").DefaultSchemaOptions>> | null>;
    updateOne: ({ filter, update, options }: {
        filter: QueryFilter<T>;
        update: UpdateQuery<T>;
        options?: MongooseUpdateQueryOptions;
    }) => Promise<import("mongoose").UpdateWriteOpResult>;
}
//# sourceMappingURL=db.repository.d.ts.map