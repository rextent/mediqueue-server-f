const {
  MongoClient,
  ServerApiVersion,
} = require("mongodb");

const uri =
  process.env.MONGODB_URI;

const client =
  new MongoClient(uri, {

    serverApi: {
      version:
        ServerApiVersion.v1,

      strict: true,

      deprecationErrors: true,
    },
  });

let cachedClient = null;

async function connectDB() {

  if (cachedClient) {

    return cachedClient;
  }

  await client.connect();

  cachedClient = client;

  console.log(
    "MongoDB Connected"
  );

  return client;
}

module.exports = connectDB;