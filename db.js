const {

    MongoClient,

    ServerApiVersion,

} = require("mongodb");

const uri = process.env.MONGODB_URI;

const client = new MongoClient(

    uri,

    {

        serverApi: {

            version: ServerApiVersion.v1,

            strict: true,

            deprecationErrors: true,
        },
    }
);

let isConnected = false;

async function connectDB() {

    if (!isConnected) {

        await client.connect();

        isConnected = true;

        console.log("MongoDB Connected");
    }

    return client;
}

module.exports = connectDB;