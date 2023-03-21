import createError  from 'http-errors';
import express from 'express';
import cookieParser from 'cookie-parser';
import logger from 'morgan';
import indexRouter from './routes/server.js';
import statsDClient from 'statsd-client';
import connectDatabase from "./utils/connectDatabase.js";

const statsDclient = new statsDClient({host: 'localhost', port: 8125, debug: true});
var app = express();


app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(logger('tiny'));
app.use('/', indexRouter);

app.get("/healthz", (req, res) => {
  statsDclient.increment("/healthz");
  console.log("Enpoint /healthz has been hit");
  res.status(200).send("server responds with 200 OK if it is healhty.");
});



export default app;
