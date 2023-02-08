import createError  from 'http-errors';
import express from 'express';
import cookieParser from 'cookie-parser';
import logger from 'morgan';
import indexRouter from './routes/server.js';
import connectDatabase from "./utils/connectDatabase.js";


var app = express();


app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

app.use('/', indexRouter);

app.get("/healthz", (req, res) => {
  console.log("Enpoint /healthz has been hit");
  res.status(200).send("server responds with 200 OK if it is healhty.");
});



export default app;
