import jwt from "jsonwebtoken";

export const verifyToken = (req, res, next) => {

const authHeader = req.headers.authorization;

if (!authHeader) {

return res.status(401).json({

message: "Access Denied"

});

}

const token = authHeader.split(" ")[1];

try {

const verified = jwt.verify(

token,

process.env.JWT_SECRET

);

req.user = verified;

next();

}

catch {

res.status(401).json({

message: "Invalid Token"

});

}

};