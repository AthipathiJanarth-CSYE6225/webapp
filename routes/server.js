import express from 'express';
import {createUser, retrieveUser,updateUser} from "../controller/usercontroller.js";
import authentication from "../utils/authentication.js";
import {
    createProduct,
    deleteProduct,
    retrieveProduct,
    updateProduct,
    updatesProduct
} from "../controller/productcontroller.js";

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

router
    .route("/v1/product/:productId")
    .get(retrieveProduct);

router
    .route("/v1/product/:productId")
    .delete(authentication,deleteProduct);
router
    .route("/v1/product/:productId")
    .patch(authentication,updateProduct);
router
    .route("/v1/product/:productId")
    .put(authentication,updatesProduct);
router
    .route("/v1/product/:productId")
    .patch(authentication,updateProduct);

export default  router;
