"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DBRepository = void 0;
class DBRepository {
    model;
    constructor(model) {
        this.model = model;
    }
    create = async (data) => {
        return await this.model.create([data]);
    };
    findOne = async ({ filter, options = {}, projection = {} }) => {
        return await this.model.findOne(filter, options);
    };
    find = async ({ filter = {}, options = {} }) => {
        const { limit, skip, sort, lean, populate, select, session } = options;
        const query = this.model.find(filter);
        if (limit)
            query.limit(limit);
        if (skip)
            query.skip(skip);
        if (sort)
            query.sort(sort);
        if (select)
            query.select(select);
        if (lean)
            query.lean();
        if (populate)
            query.populate(populate);
        if (session)
            query.session(session);
        return query.exec();
    };
    countDocuments = async ({ filter = {}, options = {} }) => {
        return await this.model.countDocuments(filter).setOptions(options).exec();
    };
    findOneAndUpdate = async ({ update, filter, options = {} }) => {
        return await this.model.findOneAndUpdate(filter, update, options);
    };
    findById = async ({ id, options = {}, }) => {
        const { select, populate, session } = options;
        const query = this.model.findById(id, options);
        if (select)
            query.select(select);
        if (populate)
            query.populate(populate);
        if (session)
            query.session(session);
        return await query.exec();
    };
    updateOne = async ({ filter, update, options = {} }) => {
        return await this.model.updateOne(filter, update, options);
    };
}
exports.DBRepository = DBRepository;
//# sourceMappingURL=db.repository.js.map