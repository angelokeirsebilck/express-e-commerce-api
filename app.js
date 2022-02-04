const express = require('express');
require('dotenv').config();

const app = express();

const morgen = require('morgan');
const cookieParser = require('cookie-parser');

// Connect DB
const connectDB = require('./db/connect');

// Middleware
const errorHandlerMiddleware = require('./middleware/error-handler');
const notFoundMiddleware = require('./middleware/not-found');
require('express-async-errors');

app.use(morgen('tiny'));

app.use(express.json());

app.use(cookieParser(process.env.JWT_SECRET));

app.get('/api/v1', (req, res) => {
  console.log(req.signedCookies);
  res.send('Basic Get ROute');
});

app.get('/', (req, res) => {
  res.send('Basic Get ROute');
});

// Routes

const authRouter = require('./routes/authRoutes');

app.use('/api/v1/auth', authRouter);

app.use(notFoundMiddleware);
app.use(errorHandlerMiddleware);

const port = process.env.PORT || 3000;

const start = async () => {
  try {
    await connectDB(process.env.MONGO_URI);
    app.listen(port, () => {
      console.log(`Server is listening on port ${port}..`);
    });
  } catch (error) {
    console.log(error);
  }
};

start();
