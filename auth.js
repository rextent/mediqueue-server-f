const {
  mongodbAdapter,
} = require(
  "better-auth/adapters/mongodb"
);

const connectDB =
  require("./db");

async function createAuth() {

  const { betterAuth } =
    await import("better-auth");

  const client =
    await connectDB();

  return betterAuth({

    database:
      mongodbAdapter(
        client.db("mediqueue-db")
      ),

    trustedOrigins: [

      process.env.CLIENT_URL,
    ],

    baseURL:
      process.env.BETTER_AUTH_URL,

    advanced: {

      defaultCookieAttributes: {

        sameSite: "none",

        secure: true,
      },
    },

    emailAndPassword: {

      enabled: true,
    },

    socialProviders: {

      google: {

        clientId:
          process.env.GOOGLE_CLIENT_ID,

        clientSecret:
          process.env.GOOGLE_SECRET,
      },
    },

    secret:
      process.env.BETTER_AUTH_SECRET,
  });
}

module.exports =
  createAuth;