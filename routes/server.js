import express from 'express';
import {createUser, retrieveUser,updateUser} from "../controller/usercontroller.js";
import authentication from "../utils/authentication.js";
var router = express.Router();

router
    .route("/v1/user")
    .post(createUser);
router
    .route("/v1/user/:userid")
    .get(authentication,retrieveUser);
router
    .route("/v1/user/:userid")
    .put(authentication,updateUser);



export default  router;
