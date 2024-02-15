
const constants = require("../../bib-response-handler/constants");
const exceptions = require("../../bib-response-handler/customExceptions");
const messages = require("../../bib-response-handler/messages");
const redisClient = require("../biblio-common-util/redis/redis");
const { ROLES } = require("../../bib-response-handler/constants");
const { JWT_SECRET_KEY } = require("../config/config");
const jwt = require("jsonwebtoken");

// This function is used to authenticate and authorize token
const authenticateAndAuthorizeToken = (authorizedRoles = [ROLES.PLATFORM_ADMIN,ROLES.USER]) => {
  return async function (req, res, next) {
    try {
      const jwtToken = req.get("Authorization");

      req.user = await jwt.verify(jwtToken, JWT_SECRET_KEY);

      let storedToken = await redisClient.getValue(req.user.id);
      if (storedToken != jwtToken)
        throw exceptions.unAuthenticatedAccess(messages.expired_token, constants.STATUS_CODE.INVALID_TOKEN)
      
      if (authorizedRoles.includes(req.user.role)) {
        next();
      }
      else
        throw exceptions.forbiddenAccess(messages.forbiddenAccess)
    } catch (e) {
      next(e);
    }
  }
};


module.exports = {
  authenticateAndAuthorizeToken,
};


