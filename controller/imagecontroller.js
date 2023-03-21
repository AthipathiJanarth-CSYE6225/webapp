import Image from "../models/Image.js";
import Product from "../models/Product.js";
import { Op } from "sequelize";
import { v4 as uuidv4 } from "uuid";
import { uploadFile, deleteFile } from "../utils/s3Bucket.js";
import User from "../models/User.js";
import bcrypt from "bcryptjs";
import statsDClient from 'statsd-client';
const statsDclient = new statsDClient({host: 'localhost', port: 8125, debug: true});


//GET-ALL Images
export const getAllImages =  (req, res) => {
    console.log("Endpoint getAllImages /v1/product/{product_id}/image has been hit");
    statsDclient.increment("get /v1/product/{product_id}/image")
    const authUser = req.authUser;
    try {
        //Check if the Username is present
        User.findOne({
            where: {username: authUser.name},
        }).then(async (user) => {
            console.log(req.params);
            if (user) {
                console.log(user);
                const isPasswordMatch = bcrypt.compareSync(
                    authUser.pass,
                    user.password
                );
                if (!isPasswordMatch) {
                    return res
                        .status(401)
                        .json({message: "Unauthorized"});
                } else {
                    console.log("PARAMS",req.params)
                    const product = await Product.findOne({
                        where: {id: req.params.productId},
                    });
                    //Check if unauthenticated fields are updated
                    if (!product) {
                        res.status(400).json({message: "Product not found"});
                    } else {
                        if (product.owner_user_id == user.id) {
                            const images = await Image.findAll({
                                where: {
                                    [Op.and]: [{product_id: req.params.productId}],
                                },
                            });
                            if (images.length > 0) {
                                res.status(200).json(images);
                            } else {
                                return res.status(404).json({message: "No images found for product"});
                            }
                        } else {
                            return res.status(403).json({message: "forbidden"});
                        }
                    }
                }
            }
        });
    } catch
        (err) {
        res.status(400).json(err.message);
    }
}
export const getImage = (req, res) => {
    console.log("Endpoint get image /v1/product/{product_id}/image/{image_id} has been hit");
    statsDclient.increment("get /v1/product/{product_id}/image/{image_id}")
    const authUser = req.authUser;
    try {
        //Check if the Username is present
        User.findOne({
            where: {username: authUser.name},
        }).then(async (user) => {
            if (user) {
                console.log(user);
                const isPasswordMatch = bcrypt.compareSync(
                    authUser.pass,
                    user.password
                );
                if (!isPasswordMatch) {
                    return res
                        .status(401)
                        .json({message: "Unauthorized"});
                } else {
                    const product = await Product.findOne({
                        where: {id: req.params.productId},
                    });
                    if (!product) {
                        res.status(400).json({message: "Product not found"});
                    } else {
                        if (product.owner_user_id == user.id) {
                            const image = await Image.findOne({
                                where: {
                                    [Op.and]: [
                                        {product_id: req.params.productId},
                                        {image_id: req.params.imageId},
                                    ],
                                },
                            });
                            if (image) {
                                res.status(200).json(image);
                            } else {
                                return res.status(404).json({message: "No such image"});
                            }
                        } else {
                            return res.status(403).json({message: "forbidden"});
                        }
                    }
                }
            }
        });
    }catch (err) {
        res.status(400).json(err.message);
    }
}
export const deleteImage =  (req, res) => {
    console.log("Endpoint Delete Image /v1/product/{product_id}/image/{image_id} has been hit")
    statsDclient.increment("delete /v1/product/{product_id}/image/{image_id}")
    const authUser = req.authUser;
    try {
        //Check if the Username is present
        User.findOne({
            where: {username: authUser.name},
        }).then(async (user) => {
            if (user) {
                console.log(user);
                const isPasswordMatch = bcrypt.compareSync(
                    authUser.pass,
                    user.password
                );
                if (!isPasswordMatch) {
                    return res
                        .status(401)
                        .json({message: "Unauthorized"});
                } else {
        const product = await Product.findOne({
            where: { id: req.params.productId },
        });
        if (product.owner_user_id == user.id) {
            const image = await Image.findOne({
                where: {
                    [Op.and]: [
                        { product_id: req.params.productId },
                        { image_id: req.params.imageId },
                    ],
                },
            });

            if (image) {
                await deleteFile(image.file_name);
                Image.destroy({ where: { image_id: req.params.imageId } }).then(
                    (data) => {
                        return res.status(204).json(data);
                    }
                );
            } else {
                return res.status(404).json({ message: "Image not found" });
            }
        } else {
            return res.status(403).json({ message: "Delete image forbidden" });
        }
    }}});} catch (err) {
        return res.status(500).json({ message: err.message });
    }
}
export const addImage =  (req, res) => {
    console.log("Endpoint Upload Image /v1/product/{product_id}/image has been hit");
    statsDclient.increment("post /v1/product/{product_id}/image")
    const authUser = req.authUser;
    try {
        //Check if the Username is present
        User.findOne({
            where: {username: authUser.name},
        }).then(async (user) => {
            if (user) {
                const isPasswordMatch = bcrypt.compareSync(
                    authUser.pass,
                    user.password
                );
                if (!isPasswordMatch) {
                    return res
                        .status(401)
                        .json({message: "Unauthorized"});
                } else {
                    if (req.file == undefined) {
                        res.status(400).json({message: "Upload proper image"});
                    } else {
                        const fileName = `${uuidv4()} ${req.file.originalname}`;
                        const fileBuffer = req.file.buffer;
                        try {
                            const product = await Product.findOne({
                                where: {id: req.params.productId},
                            });
                            if (!product) {
                                res.status(400).json({message: "Product not found"});
                            } else {
                                if (product.owner_user_id == user.id) {
                                    await uploadFile(fileBuffer, fileName, req.file.mimetype);
                                    const image = {
                                        product_id: req.params.productId,
                                        file_name: fileName,
                                        s3_bucket_path: `${process.env.AWS_BUCKET_NAME}/${fileName}`,
                                    };
                                    const data = await Image.create(image);
                                    res.status(201).json(data);
                                } else {
                                    res.status(403).json({message: "forbidden"});
                                }
                            }
                        } catch (err) {
                            console.error(err)
                            return res.status(500).json({ message: err.message });
                        }
                    }
                }
            }
        });
    }
    catch (err) {
            return res.status(500).json({ message: err.message });
        }
}


