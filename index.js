const dns = require("node:dns");

dns.setServers([
  "8.8.8.8",
  "8.8.4.4",
]);

require("dotenv").config();

const express =
  require("express");

const cors =
  require("cors");

const cookieParser =
  require("cookie-parser");

const {
  ObjectId,
} = require("mongodb");

const jwt =
  require("jsonwebtoken");

const client =
  require("./db");

const auth =
  require("./auth");

const {
  toNodeHandler,
} = require("better-auth/node");

const app = express();


// CORS
app.use(
  cors({
    origin:
      process.env.CLIENT_URL,

    credentials: true,
  })
);


// MIDDLEWARE
app.use(express.json());

app.use(cookieParser());


// BETTER AUTH ROUTE
app.use(
  "/api/auth",
  toNodeHandler(auth)
);


// ROOT
app.get("/", (req, res) => {

  res.send(
    "MediQueue Server Running"
  );
});


// JWT TOKEN
app.post(
  "/jwt",
  async (req, res) => {

    const user =
      req.body;

    const token =
      jwt.sign(

        user,

        process.env.JWT_SECRET,

        {
          expiresIn:
            "7d",
        }
      );

    res
      .cookie(
        "token",

        token,

        {
          httpOnly: true,

          secure:
            process.env.NODE_ENV ===
            "production",

          sameSite:
            process.env.NODE_ENV ===
            "production"
              ? "none"
              : "lax",
        }
      )

      .send({
        success: true,
      });
  }
);


// LOGOUT
app.post(
  "/logout",
  (req, res) => {

    res
      .clearCookie("token")

      .send({
        success: true,
      });
  }
);


// VERIFY TOKEN
const verifyToken =
  (
    req,
    res,
    next
  ) => {

    const token =
      req.cookies.token;

    if (!token) {

      return res
        .status(401)
        .send({

          message:
            "Unauthorized Access",
        });
    }

    jwt.verify(

      token,

      process.env.JWT_SECRET,

      (
        error,
        decoded
      ) => {

        if (error) {

          return res
            .status(401)
            .send({

              message:
                "Unauthorized Access",
            });
        }

        req.user =
          decoded;

        next();
      }
    );
  };


// GET ALL TUTORS
app.get(
  "/tutors",
  async (req, res) => {

    const tutorsCollection =
      client
        .db("mediqueue-db")
        .collection(
          "tutors"
        );

    const result =
      await tutorsCollection
        .find()
        .toArray();

    res.send(result);
  }
);


// GET SINGLE TUTOR
app.get(
  "/tutors/:id",
  async (req, res) => {

    const id =
      req.params.id;

    const tutorsCollection =
      client
        .db("mediqueue-db")
        .collection(
          "tutors"
        );

    const result =
      await tutorsCollection.findOne(
        {
          _id:
            new ObjectId(id),
        }
      );

    res.send(result);
  }
);


// ADD TUTOR
app.post(
  "/tutors",
  async (req, res) => {

    const tutorData =
      req.body;

    const tutorsCollection =
      client
        .db("mediqueue-db")
        .collection(
          "tutors"
        );

    const result =
      await tutorsCollection.insertOne(
        tutorData
      );

    res.send(result);
  }
);


// UPDATE TUTOR
app.patch(
  "/tutors/:id",
  async (req, res) => {

    const id =
      req.params.id;

    const updatedTutor =
      req.body;

    const tutorsCollection =
      client
        .db("mediqueue-db")
        .collection(
          "tutors"
        );

    const result =
      await tutorsCollection.updateOne(

        {
          _id:
            new ObjectId(id),
        },

        {
          $set:
            updatedTutor,
        }
      );

    res.send(result);
  }
);


// DELETE TUTOR
app.delete(
  "/tutors/:id",

  verifyToken,

  async (req, res) => {

    const id =
      req.params.id;

    const tutorsCollection =
      client
        .db("mediqueue-db")
        .collection(
          "tutors"
        );

    const result =
      await tutorsCollection.deleteOne(
        {
          _id:
            new ObjectId(id),
        }
      );

    res.send(result);
  }
);


// MY TUTORS
app.get(
  "/my-tutors",

  verifyToken,

  async (req, res) => {

    const email =
      req.query.email;

    const tutorsCollection =
      client
        .db("mediqueue-db")
        .collection(
          "tutors"
        );

    const result =
      await tutorsCollection
        .find({
          email:
            email,
        })
        .toArray();

    res.send(result);
  }
);


// ADD BOOKING
app.post(
  "/bookings",
  async (req, res) => {

    const bookingData =
      req.body;

    const bookingsCollection =
      client
        .db("mediqueue-db")
        .collection(
          "bookings"
        );

    const result =
      await bookingsCollection.insertOne(
        bookingData
      );

    res.send(result);
  }
);


// CHECK BOOKING
app.get(
  "/bookings/check",
  async (req, res) => {

    const {
      tutorId,
      studentEmail,
    } = req.query;

    const bookingsCollection =
      client
        .db("mediqueue-db")
        .collection(
          "bookings"
        );

    const existingBooking =
      await bookingsCollection.findOne(
        {
          tutorId,
          studentEmail,
        }
      );

    res.send({
      exists:
        !!existingBooking,
    });
  }
);


// GET BOOKINGS
app.get(
  "/bookings",
  async (req, res) => {

    const email =
      req.query.email;

    const bookingsCollection =
      client
        .db("mediqueue-db")
        .collection(
          "bookings"
        );

    const result =
      await bookingsCollection
        .find({
          studentEmail:
            email,
        })
        .toArray();

    res.send(result);
  }
);


// BOOK TUTOR
app.patch(
  "/book-tutor/:id",

  verifyToken,

  async (req, res) => {

    const id =
      req.params.id;

    const tutorsCollection =
      client
        .db("mediqueue-db")
        .collection(
          "tutors"
        );

    const tutor =
      await tutorsCollection.findOne(
        {
          _id:
            new ObjectId(id),
        }
      );

    if (
      !tutor ||
      tutor.totalSlot <= 0
    ) {

      return res.send({

        success: false,

        message:
          "No slots available",
      });
    }

    const newSlot =
      tutor.totalSlot - 1;

    const result =
      await tutorsCollection.updateOne(

        {
          _id:
            new ObjectId(id),
        },

        {
          $set: {

            totalSlot:
              newSlot,

            status:
              newSlot === 0
                ? "closed"
                : "active",
          },
        }
      );

    res.send({

      success: true,

      modifiedCount:
        result.modifiedCount,

      totalSlot:
        newSlot,

      status:
        newSlot === 0
          ? "closed"
          : "active",
    });
  }
);


// MONGODB CONNECT
async function run() {

  try {

    await client.connect();

    console.log(
      "MongoDB Connected"
    );

  } catch (error) {

    console.log(error);
  }
}

run();


// LOCAL SERVER
if (
  process.env.NODE_ENV !==
  "production"
) {

  app.listen(
    process.env.PORT,

    () => {

      console.log(
        `Server running on port ${process.env.PORT}`
      );
    }
  );
}


module.exports = app;