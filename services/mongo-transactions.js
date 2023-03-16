module.exports = {
    async fetchMany(
        db,
        collection,
        query = {},
        keys = {},
        sorting = {},
        limit = 0,
        pageNumber = 0,
        session
    ) {
        // Note limit = 0 is the equivalent of setting no limit
        try {
            const list = await db.collection(collection)
                .find(query, session)
                .skip(pageNumber > 0 ? (pageNumber - 1) * limit : 0)
                .limit(limit)
                .sort(sorting)
                .project(keys)
                .toArray();
            return list;
        } catch (e) {
            console.error(e);
            return false;
        }
    },
    async fetchOne(db, collection, query = {}, session) {
        try {
            const list = await db.collection(collection)
                .find(query, session)
                .toArray();
            return list.length > 0 ? list[0] : false;
        } catch (e) {
            console.error(e);
            return false;
        }
    },
    async insertOne(db, collection, payload, session) {
        try {
            const response = await db.collection(collection)
                .insertOne(payload, session);
            return response.ops[0];
        } catch (e) {
            console.error(e);
            return false;
        }
    },
    async updateOne(db, collection, query, payload, session) {
        // this option instructs the method to create a document if no documents match the filter
        payload.updatedAt = Date.now();
        const options = { upsert: true };
        const updateDoc = {
            $set: payload,
        };
        try {
            const result = await db.collection(collection)
                .updateOne(query, updateDoc, options, session);
            return !!result.result.n;
        } catch (e) {
            console.error(e);
            return false;
        }
    },
    async updateOneArray(db, collection, query, payload, session) {
        const options = {};
        try {
            await db.collection(collection)
                .updateOne(query, { $push: payload }, options, session);
            return true;
        } catch (e) {
            console.error(e);
            return false;
        }
    },
    async insertMany(db, collection, payload, session) {
        try {
            const response = await db.collection(collection)
                .insertMany(payload, session);
            return response.ops;
        } catch (e) {
            console.error(e);
            return false;
        }
    },
    async updateData(db, collection, query, payload, session) {
        payload.updatedAt = Date.now();
        try {
            const updateDoc = {
                $set: payload,
            };
            let result = await db.collection(collection)
                .updateOne(query, updateDoc, session);
            return !!result.result.n; // for returning boolean value of if updated or not
        } catch (e) {
            console.error(e);
            return false;
        }
    },
    async updateMany(db, collection, query, payload, session) {
        payload.updatedAt = Date.now();
        try {
            const updateDoc = {
                $set: payload,
            };
            let result = await db.collection(collection)
                .updateMany(query, updateDoc, session);
            return !!result.result.n; // for returning boolean value of if updated or not
        } catch (e) {
            console.error(e);
            return false;
        }
    },
    async deleteData(db, collection, query, session) {
        try {
            let result = await db.collection(collection)
                .findOneAndDelete(query, session);

            return !!result.lastErrorObject.n; // for returning boolean value of if deleted or not
        } catch (e) {
            console.error(e);
            return false;
        }
    },
    async documentExists(db, collection, query, session) {
        try {
            let result =
                (await db.collection(collection)
                    .find(query, session)
                    .count()) > 0;
            return result;
        } catch (e) {
            console.error(e);
            return false;
        }
    },
};
