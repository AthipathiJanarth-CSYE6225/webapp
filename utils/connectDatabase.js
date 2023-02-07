import db from "../utils/databaseConnection.js";

async function connectDatabase() {
  await db.sync();

  await db
    .authenticate()
    .then(() => console.log("Database connected."))
    .catch((err) => console.log("Error: " + err));
}

export default connectDatabase;
