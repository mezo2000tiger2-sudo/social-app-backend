import { Model, MongooseUpdateQueryOptions, PopulateOptions, ProjectionType, Types, UpdateQuery } from "mongoose";
import { QueryFilter, QueryOptions } from "mongoose";

export abstract class DBRepository<T> {

    constructor(public readonly model:Model<T>) {}

    create = async ( data:Partial<T> ) => {
        return await this.model.create([data]);
    };

    findOne = async ({
        filter,
        options = {},
    } : {
        filter:QueryFilter<T>,
        options?: QueryOptions<T>
    }) => {
        return await this.model.findOne(filter, undefined,options);
    };

    find = async ({ filter = {}, options = {} } : {
        filter?: QueryFilter<T>,
        options?: QueryOptions<T>
    }) => {
        const { limit, skip, sort, lean,populate, select, session } = options;
        const query = this.model.find(filter);

        if (limit) query.limit(limit);
        if (skip) query.skip(skip);
        if (sort) query.sort(sort);
        if (select) query.select(select);
        if (lean) query.lean();
        if (populate) query.populate(populate as PopulateOptions);
        if (session) query.session(session);

        return query.exec();
    };
    countDocuments = async ({ filter = {}, options = {} } : {
        filter?: QueryFilter<T>,
        options?: QueryOptions<T>
    }) => {
        return await this.model.countDocuments(filter).setOptions(options).exec();
    };

    findOneAndUpdate = async ({ update, filter, options = {} } : {
        update: UpdateQuery<T>,
        filter: QueryFilter<T>,
        options?: QueryOptions<T>
    }) => {
        return await this.model.findOneAndUpdate(filter, update, options);
    };

    findById = async ({
    
        id,
        options = {},
    } : {
        id: string,
        options?: QueryOptions<T>
    }) => {
        const { select, populate, session } = options;
        const query =this.model.findById(id, options);
        if (select) query.select(select);
        if (populate) query.populate(populate as PopulateOptions);
        if (session) query.session(session);
        return await query.exec();
    };

    updateOne = async ({ filter, update, options = {} } : {
        filter: QueryFilter<T>,
        update: UpdateQuery<T>,
        options?: MongooseUpdateQueryOptions
    }) => {
        return await this.model.updateOne(filter, update, options);
    };
    findByIdAndUpdate = async ({ id, update, options ={} } : {
        id:Types.ObjectId,
        update:UpdateQuery<T>
        options?: MongooseUpdateQueryOptions
    }) => {
    return await this.model.findByIdAndUpdate(id, update, { new: true, runValidators: true, ...options })
}

}
