const dotenv = require("dotenv");

const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");

const cors = require("cors"); // Importa el módulo cors

const app = express();
dotenv.config();

app.use(cors());
// Body parser middleware
app.use(bodyParser.json());

mongoose
  .connect(process.env.MONGO, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("Connected to MongoDB"))
  .catch((error) => console.error("Error connecting to MongoDB:", error));

mongoose.connection.on("disconnected", () => {
  console.log("mongoDb disconnected");
});

mongoose.connection.on("connected", () => {
  console.log("mongoDb connected");
});

// Define routes
app.use("/api/reservations", require("./routes/reservationRoutes.js"));

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
