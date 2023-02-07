import Sequelize from "sequelize";
import db from "../utils/databaseConnection.js";

const Product = db.define(
    "product",
    {
        id: {
            type: Sequelize.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        name: {
            type: Sequelize.STRING,
        },
        description: {
            type: Sequelize.STRING,
        },
        sku: {
            type: Sequelize.STRING,
            unique: true,
        },
        manufacturer: {
            type: Sequelize.STRING,
        },
        quantity: {
            type: Sequelize.INTEGER,
        },
        owner_user_id: {
            type: Sequelize.INTEGER,
        }
    },
    {
        freezeTableName: true,
        timestamps: true,
        createdAt: "date_added",
        updatedAt: "date_last_updated",
    }
);

export default Product;
