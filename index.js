const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const morgan = require("morgan");
const rateLimit = require("express-rate-limit");
const stringRoutes = require("./routes/route.js");


// Configuration
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;


// Middleware
const corsOptions = {
  origin: "*", 
};

app.use(cors(corsOptions));
app.use(express.json());
app.use(morgan("dev"));


const limiter = rateLimit({
  windowMs: 60 * 1000,
  max: 1000,
  message: "Too many requests, please try again later.",
});

app.use(limiter);

app.use((req, res, next) => {
  console.log(`${req.method} ${req.url} - ${new Date().toISOString()}`);
  next();
});


// Routes
app.use("/strings", stringRoutes);

app.use('/', (req, res, next) => {
  const allowedMethods = ['GET'];
  if (!allowedMethods.includes(req.method)) {
    res.status(405).send('Method Not Allowed');
    return;
  }
  next();
});

app.use((req, res) => {
  res.status(404).send('Endpoint not found');
});


// Server Startup
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

module.exports = app;
