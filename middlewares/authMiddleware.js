const jwt = require("jsonwebtoken");

const ErrorResponse = require("../utils/ErrorResponse");

exports.verifyToken = async (req, res, next) => {
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) { 
    try {
      token = req.headers.authorization.split(" ")[1];
      const user = jwt.verify(token, process.env.JWT_SECRTKEY, {
        algorithms: ["HS256"],
      });
      req.id = user.id;
      next();
    } catch (error) {
      if (error.name === "JsonWebTokenError") {
        throw new ErrorResponse("Invalid token", 401);
      } else if (error.name === "TokenExpiredError") {
        throw new ErrorResponse("Token expired", 401);
      } else {
        throw new ErrorResponse("Not authorized, token failed", 401);
      }
    }
  }

  if (!token) {
    throw new ErrorResponse("Not authorized, no token", 401);
  }
};

 


