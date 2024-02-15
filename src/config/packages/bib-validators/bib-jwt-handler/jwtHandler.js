

// ============================ Load internal module ================= //

const jwt = require("jsonwebtoken");
const exceptions = require("../bib-response-handler/customExceptions");
const { JWT_SECRET_KEY } = require("../config");
const redisClient = require("../bib-util/redis/redis");
const messages = require("../bib-response-handler/messages");

// ============================= End ================================= //

// Generate token
const generateToken = async (user) => {
  try {
    const jwtToken = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET_KEY);
    user.token = jwtToken;
    await redisClient.setJWTToken(user);
    return jwtToken;
  } catch (err) {
    throw exceptions.internalServerError(messages.tokenGenException);
  }
};


// Export module
module.exports = {
  generateToken
};

