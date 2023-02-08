import connectDatabase from "./utils/connectDatabase.js";
import app from "./app.js";

(async () => {
    await connectDatabase();
})();

export const start = async () => {
    try {
        app.listen(5002,()=>{
            console.log("Application is Running on Port 5002");
        });
    } catch (e) {
        console.error(e);
    }
};

try {
    start();
} catch (error) {
    console.log(error);
}