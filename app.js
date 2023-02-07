import createError  from 'http-errors';
import express from 'express';
import cookieParser from 'cookie-parser';
import logger from 'morgan';
import indexRouter from './routes/server.js';
import connectDatabase from "./utils/connectDatabase.js";

(async () => {
  await connectDatabase();
})();

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

// error handler
// app.use(function(err, req, res, next) {
//   // set locals, only providing error in development
//   res.locals.message = err.message;
//   res.locals.error = req.app.get('env') === 'development' ? err : {};
//
//   // render the error page
//   res.status(err.status || 500);
//   res.render('error');
// });

app.listen(5002,()=>{
  console.log("Application is Running on Port 5002");
})

export default app;
