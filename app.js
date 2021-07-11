const dotenv = require("dotenv");
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

// set up express app
const app = express();
const port = process.env.PORT || 4000;

// middleware
app.use(cors());
app.use(express.json());

dotenv.config();
mongoose.Promise = global.Promise;

//Firebase
const admin = require("firebase-admin");
const serviceAccount = require("./serviceAccountKey.json");
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  storageBucket: process.env.storageBucket,
});

// connect to mongodb
mongoose.connect(
  process.env.DB_connect,
  {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false,
  },
  () => {
    console.log("Connect to database");
  }
);

app.get("/", (req, res) => {
  res.send(" API with  34  endpoints  ");
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

// initialize routes
app.use("/api/user", require("./routes/user"));
app.use("/api/company", require("./routes/company"));
app.use("/api/order", require("./routes/order"));
app.use("/api/general", require("./routes/general"));
