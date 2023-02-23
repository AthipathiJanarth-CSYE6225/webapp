import auth from "basic-auth";

const authentication = async (req, res, next) => {
    try {
        const authUser = auth(req);
        //If no authorization is present
        User.findOne({
            where: { username: authUser.name },
        }).then((user) => {
            if(user){
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
        }
            else {
                res.status(401).json({ message: "The user is not authorized" });
            }
        });
    }catch (err) {
        res.status(401).json({ message: "The user is not authorized" });
    }
};

export default authentication;