import User from "../models/User.js";
import bcrypt from "bcryptjs";
import emailValidator from "email-validator";

import statsDClient from 'statsd-client';
const statsDclient = new statsDClient({host: 'localhost', port: 8125, debug: true});

//POST - Create new User
export const createUser = (req, res) => {
  console.log("Endpoint post Create user /v1/user/ has been hit");
  statsDclient.increment("/v1/user/")
  const { first_name, last_name, username, password } = req.body;
  try {
    //Check if the auto-generating field are present
    if (req.body.id || req.body.account_created || req.body.account_updated) {
      return res.status(400).json({
        message:
            "Bad Request: id, account created and updated details cannot be sent in payload",
      });
    }
    //Check if all the required field are present
    if (!first_name || !last_name || !username || !password) {
      return res.status(400).json({
        message:
            "Bad Request: Required fields cannot be empty (Firstname, Lastname, Username, Passsword)",
      });
    }
    //Check if email address is valid
    if (!emailValidator.validate(username.toLowerCase())) {
      return res
          .status(400)
          .json({ message: "Bad Request: Enter a valid email address" });
    }

    const hashedPassword = bcrypt.hashSync(password, bcrypt.genSaltSync(12));
    //User from request
    const user = {
      first_name,
      last_name,
      username,
      password: hashedPassword,
    };
    //Check if username already exists
    User.findOne({ where: { username: username } }).then((u) => {
      if (u) {
        return res
            .status(400)
            .json({ message: "Bad Request: Username already exists." });
      } else {
        User.create(user).then((data) => {
          const {
            id,
            first_name,
            last_name,
            username,
            account_created,
            account_updated,
          } = data;

          const userDetails = {
            id,
            first_name,
            last_name,
            username,
            account_created,
            account_updated,
          };
          return res.status(201).json(userDetails);
        });
      }
    });
  } catch (err) {
    return res.status(404).json({ message: err.message });
  }
};

//GET - Retrieve User Details
export const retrieveUser = (req, res) => {
  console.log("Endpoint get RetrieveUser /v1/user/{userId} has been hit");
  statsDclient.increment("get /v1/user/{userId}")
  //Get basic auth
  const authUser = req.authUser;
  try {
    //Check if the Username is present
    User.findOne({
      where: { username: authUser.name },
    })
        .then((user) => {
          if (user) {
            const isPasswordMatch = bcrypt.compareSync(
                authUser.pass,
                user.password
            );
            if (!isPasswordMatch) {
              return res
                  .status(401)
                  .json({ message: "Unauthorized" });
            } else if (isPasswordMatch && user.id.toString() != req.params.userid) {
              return res
                  .status(403)
                  .json({ message: "Forbidden : You don't have access" });
            } else {
              const {
                id,
                first_name,
                last_name,
                username,
                account_created,
                account_updated,
              } = user;
              let userDetails = {
                id,
                first_name,
                last_name,
                username,
                account_created,
                account_updated,
              };
              res.status(200).json(userDetails);
            }
          } else {
            return res.status(404).json({ message: "No user found" });
          }
        })
        .catch((err) => {
          res.status(500);
        });
  } catch (err) {
    res.status(400).json(err.message);
  }
};


//PUT - Update User Details
export const updateUser = (req, res) => {
  console.log("Endpoint put UpdateUser /v1/user/{userId} has been hit");
  statsDclient.increment("put /v1/user/{userId}")
  //Get basic auth
  const first_name  = req.body.first_name;
  const last_name =req.body.last_name;
  const password =req.body.password;
  //Get user from updated req
  const authUser = req.authUser;
  try {
    //Check if username is present
    User.findOne({
      where: { username: authUser.name },
    })
        .then((user) => {
          if (user) {
            //Check if passwords are same
            const isPasswordCorrect = bcrypt.compareSync(
                authUser.pass,
                user.password
            );

            if (isPasswordCorrect) {
              //Check if unauthenticated fields are updated
              if (user.id != req.params.userid) {
                return res
                    .status(403)
                    .json({ message: "Forbidden : You don't have access"  });
              }
              if (
                  req.body.id ||
                  req.body.account_created ||
                  req.body.account_updated ||
                  req.body.username
              ) {
                return res.status(400).json({
                  message: "Bad Request. Cannot update the fields entered",
                });
              }
              //Check if password is present
              if(password) {
                //Hashed Password
                const hashedPassword = bcrypt.hashSync(
                    password,
                    bcrypt.genSaltSync(12)
                );
                user.password = hashedPassword;
              }
              //Check if first_name is present
              if(first_name){
                user.first_name = first_name;
              }
              //Check if last_name is present
              if(last_name) {
                user.last_name = last_name;
              }
              //Check if all required fields are present
              if (first_name===undefined && last_name===undefined && password===undefined) {
                return res.status(400).json({
                  message:
                      "Bad Request. Please enter anyone of the required fields (Firstname, Lastname, Password).",
                });
              }
              try {
                user.save();
                res.sendStatus(204);
                return;
              } catch (err) {
                return res.status(500).json({ message: err.message });
              }
            } else {
              return res
                  .status(401)
                  .json({ message: "Unauthorized" });
            }
          } else {
            return res.status(404).json({ message: "User does not exist" });
          }
        })
        .catch((err) => {
          return res.status(500).json({ message: err.message });
        });
  } catch (err) {
    return res.status(400).json(err.message);
  }
};