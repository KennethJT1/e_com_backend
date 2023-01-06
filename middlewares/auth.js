import jwt from 'jsonwebtoken';
import User from '../models/users.js'

export const auth = (req, res, next) => {
    try {
       const decoded = jwt.verify(req.headers.authorization, process.env.jwt_secret);

       req.user = decoded;
       next();
    } catch (error) {
        return res.status(401).json(error)
    }
    
}

export const adminAuth = async (req, res, next) => {
    try {

       const user = await User.findById(req.user._id);
       if(user.role !== 1) {
        return res.status(401).send("unauthorized");
       } else {
        next();
       }
       
    } catch (error) {
        return res.status(401).json(error)
    }
    
}