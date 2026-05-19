const { betterAuth } =
require("better-auth");

const {
    mongodbAdapter,
} = require(
    "better-auth/adapters/mongodb"
);

const client =
require("./db");

const auth = betterAuth({

    database:
        mongodbAdapter(
            client.db("mediqueue-db")
        ),

    trustedOrigins: [
        "http://localhost:3000",
    ],

    baseURL:
        process.env.BETTER_AUTH_URL,

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

});

module.exports = auth;