const { MongoClient } =
require("mongodb");

const client =
new MongoClient(
    process.env.MONGODB_URI
);

client.connect();

module.exports = client;