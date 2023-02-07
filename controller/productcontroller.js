import User from "../models/User.js";
import Product from "../models/Product.js";
import bcrypt from "bcryptjs";
import emailValidator from "email-validator";

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
        console.log("Checking User");
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
                        if(isNaN(quantity)){
                            return res.status(400).json({
                                message:
                                    "Bad Request:  Quantity can't be String ",
                            });
                        }
                        if (-1 > quantity && quantity > 101) {
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