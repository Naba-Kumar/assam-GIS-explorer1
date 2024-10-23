const jwt = require('jsonwebtoken');
const express = require('express');
const app = express();

const cookieParser = require('cookie-parser');
app.use(cookieParser());


require('dotenv').config();

const optionalAuth = async(req, res, next) => {
    const token = req.cookies.token;
    function parseJwt(token) {
      try {
        return JSON.parse(atob(token.split('.')[1]));
      } catch (e) {
        return null;
      }
    }
  
    const decodedToken = parseJwt(token);
    const currentTime = Math.floor(Date.now() / 1000);
  
      try {
          const decoded = jwt.verify(token, process.env.secretKey);
          req.user = decoded;
          console.log("1111111111111");
          next();
    } catch (err) {
        console.log("2222222222222");

        next();
      console.log('Invalid token');

    }
};

module.exports = optionalAuth;
