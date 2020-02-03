const Jwt = require('jsonwebtoken');
const { User } = require('../models/User');
const apiResponse = require('../helpers/apiResponse')
module.exports = async (req, res, next) => {
    const token = req.header('x-auth-token');
    if (!token) return apiResponse.unauthorizedResponse(res, "No token found")
    try {
        var decoded = Jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        let user = await User.findOne({ _id: req.user._id });
        if (!user) return apiResponse.notFoundResponse(res, "No user found")
        next();
    } catch {
        return apiResponse.unauthorizedResponse(res, "Invalid Token")
    }
}