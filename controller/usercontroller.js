import pool from "../utils/databaseConnection.js";
import bcrypt from "bcryptjs";
import emailValidator from "email-validator";

//POST - Create new User
export const createUser = (req,res) => {
  console.log("Endpoint /v1/user has been hit");
  pool.getConnection((err, connection) => {
    if (err) throw err;
    var data = req.body;
    const { first_name, last_name, password, username} = req.body;
    //Check if all the required field are present
    if (!first_name || !last_name || !password || !username) {
      return res.status(400).json({
        message:
            "Bad Request: Required fields cannot be empty (Firstname, Lastname, Username, Passsword)",
      });
    }
    //Check if the auto-generating field are present
    else if(req.body.id || req.body.account_created || req.body.account_updated) {
      return res.status(400).json({
        message:
            "Bad Request: id, account created and updated details cannot be sent in payload",
      });
    }
    else {
      //Check if the username is valid email
      if(!emailValidator.validate(data.username)){
        res.status(400).json({
          message: "Bad Request: Username is not valid."
        });
      }
      else {
        var query_str = "CALL create_user(?,?,?,?);";
        //Bcrypt the password
        const hashedPassword = bcrypt.hashSync(data.password, bcrypt.genSaltSync(12));
        //Store in MySQL using Stored Procedure
        connection.query(query_str, [data.first_name, data.last_name, hashedPassword, data.username], function (ERROR, RESULT) {
          if (ERROR) {
            res.status(400).json({
              message: "Bad Request: Username already exists."
            });
          } else {
            var account = RESULT[0][0];
            res.status(201).send(account);
          }
        });
      }
    }
    connection.release();
  });
}

//GET - Retrieve User Details
export const retrieveUser = (req,res) => {
  console.log("Endpoint get /v1/user/{userId} has been hit");
  //Get basic auth
  const user=req.authUser;
  pool.getConnection( async(err, connection) => {
    if (err) throw err;
    //Check if the Username is present
    var checkUser = "CALL find_user(?);";
    var response = await connection.promise().query(checkUser, [user.name]);
    var db_user=response[0][0][0];
    if(db_user!==undefined) {
      //Check if the Username and Password matches
      const isPasswordCorrect = bcrypt.compareSync(
          user.pass,
          db_user.password
      );
      if (isPasswordCorrect) {
        //Check if the user is having access
        if((db_user.id).toString()===req.params["userid"])
        {var query_str = "CALL retrieve_user(?);";
          connection.query(query_str, [req.params["userid"]], function (ERROR, RESULT) {
            if (ERROR) {
              res.status(400).json({
                message: "Bad Request"
              });
            } else {
              var account = RESULT[0][0];
              res.status(200).send(account);
            }
          });}
        else{
          res.status(403).json({
            message: "Forbidden : You don't have access"
          });
        }
      } else {
        res.status(401).json({
          message: "Unauthorized"
        });
      }
    }
    else{
      res.status(401).json({
        message: "Unauthorized"
      });
    }
    //Close DB connection
    connection.release();
  });
}


//PUT - Update User Details
export const updateUser = (req,res) => {
  console.log("Endpoint put /v1/user/{userId} has been hit");
  //Get basic auth
  const user=req.authUser;
  pool.getConnection(async (err, connection) => {
    if (err) throw err;
    //Check if the Username is present
    var checkUser = "CALL find_user(?);";
    var response = await connection.promise().query(checkUser, [user.name]);
    var db_user=response[0][0][0];
    if(db_user!==undefined) {
      //Check if the Username and Password matches
      const isPasswordCorrect = bcrypt.compareSync(
          user.pass,
          db_user.password
      );
      if (isPasswordCorrect) {
        //Check if the user is having access
        if((db_user.id).toString()===req.params["userid"]) {

          const {first_name, last_name, password} = req.body;
          if (!first_name || !last_name || !password) {
            return res.status(400).json({
              message:
                  "Bad Request: Required fields cannot be empty (Firstname, Lastname, Username, Passsword)",
            });
          } else if (req.body.id || req.body.account_created || req.body.account_updated) {
            return res.status(400).json({
              message:
                  "Bad Request: id, account created and updated details cannot be sent in payload",
            });
          } else {
            //Check if User is present
            if (db_user !== undefined) {
              var data = req.body;
              const hashedPassword = bcrypt.hashSync(data.password, bcrypt.genSaltSync(12));
              var query_str = "CALL update_user(?,?,?,?);";
              connection.query(query_str, [data.first_name, data.last_name, hashedPassword, req.params["userid"]], function (ERROR, RESULT) {
                if (ERROR) {
                  res.status(400).json({
                    message: "Bad Request"
                  });
                } else {
                  res.status(204).json({
                    message: "User Updated Successfully"
                  });
                }
              });
            } else {
              res.status(400).json({
                message: "Bad Request: User doesn't exists"
              });
            }
          }
        }else{
          res.status(403).json({
            message: "Forbidden: You don't have access"
          });}
      }
      else{
        res.status(401).json({
          message: "Unauthorized"
        });}}

    connection.release();
  });
}