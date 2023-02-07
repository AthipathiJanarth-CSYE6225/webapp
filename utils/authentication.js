import auth from "basic-auth";

const authentication = async (req, res, next) => {
    try {
        const authUser = auth(req);
        //If no authorization is present
        if (!req.get("authorization")) {
            return res
                .status(401)
                .json({message: "Enter username and password for authentication"});
        }
        //Empty name and password
        if (!authUser.name || !authUser.pass) {
            return res
                .status(401)
                .json({message: "Enter username and password for authentication"});
        }
        req.authUser = authUser;
        next();
    } catch (err) {
        res.status(404).json({ message: err.message });
    }
};

export default authentication;