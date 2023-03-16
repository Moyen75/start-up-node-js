const { MongoClient } = require("mongodb");
const root = require("app-root-path");
const { generateMongoDbUri } = require(`${root}/services/mongo-uri`);

const mongoDbUri = generateMongoDbUri();
const mongoOptions = {
    useNewUrlParser: true,
    useUnifiedTopology: true,
};

const getMongoConnection = async () => {
    const client = new MongoClient(mongoDbUri, mongoOptions);
    await client.connect();
    return client;
}
module.exports = getMongoConnection;