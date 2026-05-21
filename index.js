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

const connectDB =
  require("./db");

const createAuth =
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


// BETTER AUTH এর আগে cookie parser
app.use(cookieParser());


// BETTER AUTH ROUTE
app.all("/api/auth/*", async (req, res) => {

  const auth =
    await createAuth();

  const handler =
    toNodeHandler(auth);

  return handler(req, res);
});


// অন্য routes এর জন্য json parser
app.use(express.json());


// BETTER AUTH ROUTE
app.all("/api/auth/{*any}", async (req, res) => {

  const auth = await createAuth();

  const handler =
    toNodeHandler(auth);

  return handler(req, res);
});


// ROOT
app.get("/", (req, res) => {

  res.send(
    "MediQueue Server Running"
  );
});


// GET ALL TUTORS
app.get(
  "/tutors",
  async (req, res) => {

    const client =
      await connectDB();

    const tutorsCollection =
      client
        .db("mediqueue-db")
        .collection(
          "tutors"
        );

    // QUERY PARAMS
    const search =
      req.query.search || "";

    const startDate =
      req.query.startDate;

    const endDate =
      req.query.endDate;

    // FILTER OBJECT
    let query = {};

    // SEARCH BY NAME
    if (search) {

      query.tutorName = {

        $regex: search,

        $options: "i",
      };
    }

    // DATE FILTER
    if (
      startDate &&
      endDate
    ) {

      query.sessionStartDate = {

        $gte: startDate,

        $lte: endDate,
      };
    }

    const result =
      await tutorsCollection

        .find(query)

        .toArray();

    res.send(result);
  }
);


// GET SINGLE TUTOR
app.get(
  "/tutors/:id",
  async (req, res) => {

    const client =
      await connectDB();

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

    try {

      const client =
        await connectDB();

      const tutorData =
        req.body || {};

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

    } catch (error) {

      console.log(error);

      res.status(500).send({
        message:
          "Failed to add tutor",
      });
    }
  }
);


// UPDATE TUTOR
app.patch(
  "/tutors/:id",
  async (req, res) => {

    const client =
      await connectDB();

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
  async (req, res) => {

    const client =
      await connectDB();

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

// Detele cancel booking
app.delete(
  "/bookings/:id",
  async (req, res) => {

    const client =
      await connectDB();

    const id =
      req.params.id;

    const bookingsCollection =
      client
        .db("mediqueue-db")
        .collection(
          "bookings"
        );

    const result =
      await bookingsCollection.deleteOne(
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
  async (req, res) => {

    const client =
      await connectDB();

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

    const client =
      await connectDB();

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

    const client =
      await connectDB();

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

    const client =
      await connectDB();

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

app.patch(
  "/user/:email",
  async (req, res) => {

    const client =
      await connectDB();

    const email =
      req.params.email;

    const updatedData =
      req.body;

    const userCollection =
      client
        .db("mediqueue-db")
        .collection("user");

    const result =
      await userCollection.updateOne(

        {
          email: email,
        },

        {
          $set: {

            name:
              updatedData.name,

            image:
              updatedData.image,
          },
        }
      );

    res.send(result);
  }
);


// BOOK TUTOR
app.patch(
  "/book-tutor/:id",
  async (req, res) => {

    const client =
      await connectDB();

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