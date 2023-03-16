const root = require("app-root-path");
const { populateId } = require(`${root}/services/utilities`);
module.exports = {
  async documentCount(db, collection, query = {}) {
    const options = {};
    try {
      const count = await db.collection(collection)
        .countDocuments(query, options);
      return count;
    } catch (e) {
      console.error(e);
      return "error";
    }
  },
  async fetchMany(
    db,
    collection,
    query = {},
    key = {},
    sorting = {},
    limit = 0,
    pageNumber = 0
  ) {
    // Note limit = 0 is the equivalent of setting no limit
    try {
      const keys = { ...key, _id: 0 }
      const list = await db.collection(collection)
        .find(query)
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
  async fetchWithoutpagination(
    db,
    collection,
    query = {},
    key = {},
    sorting = {},
  ) {
    try {
      const keys = { ...key, _id: 0 }
      const list = await db.collection(collection)
        .find(query)
        .sort(sorting)
        .project(keys)
        .toArray();
      return list;
    } catch (e) {
      console.error(e);
      return false;
    }
  },
  async fetchOne(db, collection, query = {}, key = {}, sorting = {}) {
    try {
      const keys = { ...key, _id: 0 }
      const list = await db.collection(collection)
        .find(query)
        .sort(sorting)
        .limit(1)
        .project(keys)
        .toArray();
      return list.length > 0 ? list[0] : false;
    } catch (e) {
      console.error(e);
      return false;
    }
  },
  async fetchWithAggregation(db, collection, query = {}, key = {}, sorting = {},
    limit = 10,
    pageNumber = 0) {
    try {
      const keys = { ...key, _id: 0 }
      const list = await db.collection(collection)
        .aggregate(query)
        .skip(pageNumber > 0 ? (pageNumber - 1) * limit : 0)
        .sort(sorting)
        .limit(limit)
        .project(keys)
        .toArray();
      return list;
    } catch (e) {
      console.error(e);
      return false;
    }
  },
  async fetchUniqueValues(db, collection, field, query) {
    try {
      const vals = await db.collection(collection)
        .distinct(field, query);
      return vals || [];
    } catch (e) {
      console.error(e);
      return false;
    }
  },
  async isDataExist(db, collection, query) {
    try {
      let result = await db.collection(collection)
        .find(query)
        .toArray();

      return !!result[0];
    } catch (e) {
      console.error(e);
      return false;
    }
  },
  async insertSerial(db, collection, payload) {
    try {
      const { orgId } = payload
      let query = {};
      const start = new Date().setHours(0, 0, 0, 0)
      const end = new Date().setHours(23, 59, 59, 999)
      if (orgId) query = { orgId, createdAt: { $gte: start, $lt: end }, "doctor.uid": payload.doctor};
      const document = await db.collection(collection).find(query).toArray()
      let serial = 1;
      if (document.length > 0) serial = document[document.length - 1].serial + 1
      payload.serial = serial
      payload.uid = populateId();
      payload.createdAt = Date.now();
      const response = await db.collection(collection)
        .insertOne(payload);
      return response.ops[0];
    } catch (e) {
      console.error(e);
      return false;
    }
  },
  async insertOne(db, collection, payload) {
    try {
      const { orgId } = payload
      let query = {};
      if (orgId) query = { orgId };
      const document = await db.collection(collection).find(query).toArray()
      let serial = 1;
      if (document.length > 0) serial = document[document.length - 1].serial + 1
      payload.serial = serial
      payload.uid = populateId();
      payload.createdAt = Date.now();
      const response = await db.collection(collection)
        .insertOne(payload);
      return response.ops[0];
      return true;
    } catch (e) {
      console.error(e);
      return false;
    }
  },
  async seeder(db, collection, payload) {
    try {
      payload.createdAt = Date.now();
      const response = await db.collection(collection)
        .insertOne(payload);
      return response.ops[0];
    } catch (e) {
      console.error(e);
      return false;
    }
  },
  async insertOrg(db, collection, payload) {
    try {
      payload.createdAt = Date.now();
      const response = await db.collection(collection)
        .insertOne(payload);
      return response.ops[0];
    } catch (e) {
      console.error(e);
      return false;
    }
  },
  async updateOne(db, collection, query, payload) {
    // this option instructs the method to create a document if no documents match the filter
    const options = { upsert: true };
    payload.updatedAt = Date.now();
    delete payload._id;
    const updateDoc = {
      $set: payload,
    };
    try {
      await db.collection(collection)
        .updateOne(query, updateDoc, options);
      return true;
    } catch (e) {
      console.error(e);
      return false;
    }
  },
  async updateOneArray(db, collection, query, payload) {
    const options = {};
    payload.updatedAt = Date.now();
    try {
      await db.collection(collection)
        .updateOne(query, { $push: payload }, options);
      return true;
    } catch (e) {
      console.error(e);
      return false;
    }
  },
  async insertMany(db, collection, payload) {
    try {
      const response = await db.collection(collection)
        .insertMany(payload);
      return response.ops;
    } catch (e) {
      console.error(e);
      return false;
    }
  },
  async updateData(db, collection, query, newValue) {
    delete newValue._id;
    newValue.updatedAt = Date.now();
    try {
      let result = await db.collection(collection)
        .updateOne(query, newValue);
      return !!result.result.n; // for returning boolean value of if updated or not
    } catch (e) {
      console.error(e);
      return false;
    }
  },
  async deleteData(db, collection, query) {
    try {
      let result = await db.collection(collection)
        .findOneAndDelete(query);

      return !!result.lastErrorObject.n; // for returning boolean value of if deleted or not
    } catch (e) {
      console.error(e);
      return false;
    }
  },
  async transaction(operations, client) {
    const session = client.startSession();
    const transactionOptions = {
      readPreference: 'primary',
      readConcern: { level: 'local' },
      writeConcern: { w: 'majority' }
    };
    // console.log(operations, session)
    try {
      let result = [];
      await session.withTransaction(async () => {
        for (let { operation, operationParameter } of operations) {
          const operationResult = await operation(...operationParameter, { session })
          if (!operationResult) {
            await session.abortTransaction();
            throw new Error("Something wrong!")
          }
          result=result.concat(operationResult)
        };
      }, transactionOptions);
      return result;
    } catch (e) {
      console.error(e);
      return false;
    } finally {
      await session.endSession();
    }
  },
  async documentExists(db, collection, query) {
    try {
      let result =
        (await db.collection(collection)
          .find(query)
          .count()) > 0;
      return result;
    } catch (e) {
      console.error(e);
      return false;
    }
  },
};
