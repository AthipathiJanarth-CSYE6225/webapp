import User from "../models/User.js";
import Product from "../models/Product.js";
import bcrypt from "bcryptjs";
import emailValidator from "email-validator";
import product from "../models/Product.js";

//POST - Create new Product
export const createProduct = (req, res) => {
    console.log("create product /v1/product has been hit");
    const {
        name,
        description,
        sku,
        manufacturer,
        quantity
    }= req.body;
    const authUser = req.authUser;
    try {
        //Check if the Username is present
        User.findOne({
            where: { username: authUser.name },
        })
            .then((user) => {
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
                        //Check if the auto-generating field are present
                        if (req.body.id || req.body.date_added || req.body.date_last_updated || req.body.owner_user_id) {
                            return res.status(400).json({
                                message:
                                    "Bad Request: id, date added, updated and user details cannot be sent in payload",
                            });
                        }
                        //Check if all the required field are present
                        if (!name || !description || !sku || !manufacturer || !quantity) {
                            return res.status(400).json({
                                message:
                                    "Bad Request: Required fields cannot be empty (Name, Description, Sku, Manufacturer, Quantity)",
                            });
                        }
                        if(!Number.isInteger(quantity)){
                            return res.status(400).json({
                                message:
                                    "Bad Request:  Quantity can't be String or Decimal",
                            });
                        }
                        if (0 > quantity) {
                            return res.status(400).json({
                                message:
                                    "Bad Request:  Quantity can't be Negative or Above 100 ",
                            });
                        }
                        if(quantity > 100){
                            return res.status(400).json({
                                message:
                                    "Bad Request:  Quantity can't be Negative or Above 100 ",
                            });
                        }
                        //Check if sku already exists
                        Product.findOne({where: {sku: sku}}).then((u) => {
                            if (u) {
                                return res
                                    .status(400)
                                    .json({message: "Bad Request: Sku name already exists."});
                            } else {
                                let userid=user.id;
                                const product={
                                    name,
                                    description,
                                    sku,
                                    manufacturer,
                                    quantity,
                                    owner_user_id:userid,
                                }
                                Product.create(product).then((data) => {
                                    const {
                                        id,
                                        name,
                                        description,
                                        sku,
                                        manufacturer,
                                        quantity,
                                        date_added,
                                        date_last_updated,
                                        owner_user_id,
                                    } = data;
                                    const productDetails = {
                                        id,
                                        name,
                                        description,
                                        sku,
                                        manufacturer,
                                        quantity,
                                        date_added,
                                        date_last_updated,
                                        owner_user_id,
                                    };
                                    return res.status(201).json(productDetails);
                                });
                            }
                        });
                    }
                }});

    } catch (err) {
        return res.status(404).json({ message: err.message });
    }

}

//GET - Retrieve Product Details
export const retrieveProduct = (req, res) => {
    console.log("Endpoint get /v1/product/{productId} has been hit");
    try {
        Product.findOne({
            where: { id: req.params.productId },
        })
            .then((product) => {
                if (product) {
                    res.status(200).json(product);
                }
                else {
                    return res.status(404).json({ message: "No such Product found" });
                }
        });
    }
        catch (err) {
        res.status(400).json(err.message);
    }
};

//DELETE - Delete Product
export const deleteProduct = (req, res) => {
    console.log("delete product /v1/product/{productId} has been hit");
    const authUser = req.authUser;
    try {
        //Check if the Username is present
        User.findOne({
            where: { username: authUser.name },
        })
            .then(async (user) => {
                if (user) {
                    console.log("user found")
                    const isPasswordMatch = bcrypt.compareSync(
                        authUser.pass,
                        user.password
                    );
                    if (!isPasswordMatch) {
                        return res
                            .status(401)
                            .json({message: "Unauthorized"});
                    } else if (isPasswordMatch) {
                        //Check if unauthenticated fields are updated
                        const product = await Product.findOne({
                            where: {id: req.params.productId},
                        });
                        console.log(product);
                        if (!product) {
                            console.log("No Such Product Found");
                            return res
                                .status(404)
                                .json({message: "No Such Product Found"});
                        } else {
                            if (user.id != product.owner_user_id) {
                                console.log("Forbidden : You don't have access");
                                return res
                                    .status(403)
                                    .json({message: "Forbidden : You don't have access"});
                            } else {
                                console.log("destroying");
                                Product.destroy({
                                    where: {id: req.params.productId},
                                });

                                return res.send(204);
                            }
                        }
                    }
                }
            });
    } catch (err) {
        return res.status(404).json({ message: err.message });
    }

}
//PUT - UPDATE Product
export const updatesProduct = (req, res) => {
    console.log("update product /v1/product/{productId} has been hit");
    const {
        name,
        description,
        sku,
        manufacturer,
        quantity
    }= req.body;
    const authUser = req.authUser;
    try {
        //Check if the Username is present
        User.findOne({
            where: { username: authUser.name },
        })
            .then(async (user) => {
                if (user) {
                    console.log("user found")
                    const isPasswordMatch = bcrypt.compareSync(
                        authUser.pass,
                        user.password
                    );
                    if (!isPasswordMatch) {
                        return res
                            .status(401)
                            .json({message: "Unauthorized"});
                    } else if (isPasswordMatch) {
                        //Check if unauthenticated fields are updated
                        const product = await Product.findOne({
                            where: {id: req.params.productId},
                        });
                        console.log(product);
                        if (!product) {
                            console.log("No Such Product Found");
                            return res
                                .status(404)
                                .json({message: "No Such Product Found"});
                        } else {
                            if (user.id != product.owner_user_id) {
                                console.log("Forbidden : You don't have access");
                                return res
                                    .status(403)
                                    .json({message: "Forbidden : You don't have access"});
                            } else {
                                //Check if the auto-generating field are present
                                if (req.body.id || req.body.date_added || req.body.date_last_updated || req.body.owner_user_id) {
                                    return res.status(400).json({
                                        message:
                                            "Bad Request: id, date added, updated and user details cannot be sent in payload",
                                    });
                                }
                                //Check if all the required field are present
                                if (!name || !description  || !sku  || !manufacturer || !quantity.toString()) {
                                    return res.status(400).json({
                                        message:
                                            "Bad Request: Update all of the field Name, Description, Sku, Manufacturer, Quantity",
                                    });
                                }
                                product.name=name;
                                product.description=description;
                                product.manufacturer=manufacturer;
                                if(sku){
                                    //Check if sku already exists
                                    if(product.sku!==sku) {
                                        const isProduct= await Product.findOne({where: {sku: sku}})
                                        if (isProduct) {
                                            return res
                                                .status(400)
                                                .json({message: "Bad Request: Sku name already exists."});
                                        } else {
                                            console.log("Sku Updating");
                                            product.sku = sku;
                                        }
                                    }
                                }
                                if(quantity.toString()){
                                    if(!Number.isInteger(quantity)){
                                        return res.status(400).json({
                                            message:
                                                "Bad Request:  Quantity can't be String or Decimal ",
                                        });
                                    }
                                    else if (0 > quantity) {
                                        return res.status(400).json({
                                            message:
                                                "Bad Request:  Quantity can't be Negative or Above 100 ",
                                        });
                                    }
                                    else if(quantity > 100){
                                        return res.status(400).json({
                                            message:
                                                "Bad Request:  Quantity can't be Negative or Above 100 ",
                                        });
                                    }
                                    else{
                                        console.log("Quantity Updating");
                                        product.quantity=quantity;
                                    }
                                }
                                try{
                                    console.log("Updating");
                                    product.save();
                                    return res.send(204);
                                }
                                catch (err) {
                                    return res.status(400).json({ message: err.message });
                                }

                            }
                        }
                    }
                }
            });
    } catch (err) {
        return res.status(404).json({ message: err.message });
    }

}

//PATCH - UPDATE Product
export const updateProduct = (req, res) => {
    console.log("update product /v1/product/{productId} has been hit");
    const {
        name,
        description,
        sku,
        manufacturer,
        quantity
    }= req.body;
    const authUser = req.authUser;
    try {
        //Check if the Username is present
        User.findOne({
            where: { username: authUser.name },
        })
            .then(async (user) => {
                if (user) {
                    console.log("user found")
                    const isPasswordMatch = bcrypt.compareSync(
                        authUser.pass,
                        user.password
                    );
                    if (!isPasswordMatch) {
                        return res
                            .status(401)
                            .json({message: "Unauthorized"});
                    } else if (isPasswordMatch) {
                        //Check if unauthenticated fields are updated
                        const product = await Product.findOne({
                            where: {id: req.params.productId},
                        });
                        console.log(product);
                        if (!product) {
                            console.log("No Such Product Found");
                            return res
                                .status(404)
                                .json({message: "No Such Product Found"});
                        } else {
                            if (user.id != product.owner_user_id) {
                                console.log("Forbidden : You don't have access");
                                return res
                                    .status(403)
                                    .json({message: "Forbidden : You don't have access"});
                            } else {
                                //Check if the auto-generating field are present
                                if (req.body.id || req.body.date_added || req.body.date_last_updated || req.body.owner_user_id) {
                                    return res.status(400).json({
                                        message:
                                            "Bad Request: id, date added, updated and user details cannot be sent in payload",
                                    });
                                }
                                //Check if all the required field are present
                                if (!name && !description && !sku && !manufacturer && !quantity.toString()) {
                                    return res.status(400).json({
                                        message:
                                            "Bad Request: Update any one of the field Name, Description, Sku, Manufacturer, Quantity",
                                    });
                                }
                                if(name){
                                    console.log(" Name Updating");
                                    product.name=name;
                                }
                                if(description){
                                    console.log("Description Updating");
                                    product.description=description;
                                }
                                if(sku){
                                    if(product.sku!==sku) {
                                        //Check if sku already exists
                                        const isProduct = await Product.findOne({where: {sku: sku}})
                                        if (isProduct) {
                                            return res
                                                .status(400)
                                                .json({message: "Bad Request: Sku name already exists."});
                                        } else {
                                            console.log("Sku Updating");
                                            product.sku = sku;
                                        }
                                    }
                                }
                                if(manufacturer){
                                    console.log("Manufacturer Updating");
                                    product.manufacturer=manufacturer;
                                }
                                if(quantity!==undefined){
                                    if(!Number.isInteger(quantity)){
                                        return res.status(400).json({
                                            message:
                                                "Bad Request:  Quantity can't be String or Decimal",
                                        });
                                    }
                                    else if (0 > quantity) {
                                        return res.status(400).json({
                                            message:
                                                "Bad Request:  Quantity can't be Negative or Above 100 ",
                                        });
                                    }
                                    else if(quantity > 100){
                                        return res.status(400).json({
                                            message:
                                                "Bad Request:  Quantity can't be Negative or Above 100 ",
                                        });
                                    }
                                    else{
                                        console.log("Quantity Updating");
                                        product.quantity=quantity;
                                    }
                                }
                                try{
                                    console.log("Updating");
                                    product.save();
                                    return res.send(204);
                                }
                                catch (err) {
                                    return res.status(400).json({ message: err.message });
                                }

                            }
                        }
                    }
                }
            });
    } catch (err) {
        return res.status(404).json({ message: err.message });
    }

}