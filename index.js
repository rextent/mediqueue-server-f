const dns = require("node:dns");
dns.setServers(["8.8.8.8", "8.8.4.4"]);

require("dotenv").config();

const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");

const { ObjectId } = require("mongodb");

const { toNodeHandler } =
require("better-auth/node");

const auth = require("./auth");
const client = require("./db");

const app = express();

app.use(
  cors({
    origin: process.env.CLIENT_URL,
    credentials: true,
  })
);

app.use(express.json());

app.use(cookieParser());

app.use(
  "/api/auth",
  toNodeHandler(auth)
);

app.get("/", (req, res) => {
  res.send("MediQueue Server Running");
});

app.get("/tutors", async(req, res)=>{
  const tutorsCollection = client.db("mediqueue-db").collection("tutors");

  const result = await tutorsCollection.find().toArray();

  res.send(result);
})

app.get("/tutors/:id", async(req, res)=>{
  const id = req.params.id;

  const tutorsCollection = client.db("mediqueue-db").collection("tutors");
  const result = await tutorsCollection.findOne({_id: new ObjectId(id),});

  res.send(result);
})

app.post("/bookings", async(req, res) =>{
  const bookingData = req.body;

  const bookingsCollection = client.db("mediqueue-db").collection("bookings");
  const result = await bookingsCollection.insertOne(bookingData);
  res.send(result);
})

app.patch("/tutors/:id", async (req, res) => {

        const id = req.params.id;

        const tutorsCollection = client.db("mediqueue-db").collection("tutors");

        const result = await tutorsCollection.updateOne(

                {
                    _id:
                        new ObjectId(id),
                },

                {
                    $inc: {
                        totalSlot: -1,
                    },
                }
            );

        res.send(result);
    }
);

app.post("/tutors", async(req, res) =>{
  const tutorData = req.body;
  
  const tutorsCollection = client.db("mediqueue-db").collection("tutors");

  const result = await tutorsCollection.insertOne(tutorData);

  res.send(result);
})

app.listen(process.env.PORT, () => {
  console.log(
    `Server running on port ${process.env.PORT}`
  );
});