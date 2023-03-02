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
import multer from "multer";
import {addImage, deleteImage, getAllImages, getImage} from "../controller/imagecontroller.js";
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

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
    .route("/v1/product/:productId/image")
    .get(authentication, getAllImages)

router
    .route("/v1/product/:productId/image")
    .post(authentication, upload.single("file"), addImage);

router
    .route("/v1/product/:productId/image/:imageId")
    .get(authentication, getImage)

router
    .route("/v1/product/:productId/image/:imageId")
    .delete(authentication, deleteImage);

export default  router;
