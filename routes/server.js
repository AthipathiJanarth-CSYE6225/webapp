import express from 'express';
import {createUser, retrieveUser,updateUser} from "../controller/usercontroller.js";
import authentication from "../utils/authentication.js";
import {createProduct} from "../controller/productcontroller.js";

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

router
    .route("/v1/product")
    .post(authentication,createProduct);



export default  router;
