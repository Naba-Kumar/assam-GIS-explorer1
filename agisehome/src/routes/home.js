const express = require('express');
const router = express.Router();
const twilio = require('twilio');
const nodemailer = require('nodemailer');
require('dotenv').config();
const bodyParser = require('body-parser');
const pool = require('../db/connection');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const validator = require('validator')
const bcrypt = require('bcryptjs');
const userAuthMiddleware = require("../middleware/userAuth")
const jwt = require('jsonwebtoken');
var passwordValidator = require('password-validator');
// Create a schema
var schema = new passwordValidator();
const optionalAuth = require("../middleware/optional")
const childProcess = require('child_process');
const { exec } = childProcess;
require('dotenv').config();
const archiver = require('archiver');
const AdmZip = require('adm-zip');
const { rimraf, rimrafSync, native, nativeSync } = require('rimraf')


const cookieParser = require('cookie-parser');
const { log } = require('console');
router.use(cookieParser());

router.use(bodyParser.json());
router.use(bodyParser.urlencoded({ extended: true }));

router.get('/', optionalAuth, async (req, res) => {
    // Your OpenLayers logic here

    // console.log(req)
    // console.log(req.params)

    const client = await pool.poolUser.connect();
    const result = await client.query('SELECT Count(email)from registered');
    const result1 = await client.query('SELECT Count(file_id)from catalog');
    const result2 = await client.query('SELECT Count(requestno)from requests');


    console.log(`count ${result.rows[0].count}`)
    result.rows[0].regcount = result1.rows[0].count
    result.rows[0].reqcount = result2.rows[0].count

    const userItems = result.rows[0];

    try {

        console.log(req.user.email)
        userItems.logemail = req.user.email;
        userItems.iat = req.user.iat;
        userItems.exp = req.user.exp;
    } catch (error) {
        userItems.logemail = "";
        userItems.iat = ""
        userItems.exp = "";
    }

    res.render("home", { userItems });

});

router.get('/requests', userAuthMiddleware, async (req, res) => {

    const client = await pool.poolUser.connect();
    const result = await client.query(`SELECT *  FROM requests WHERE email = $1`, [req.user.email]);
    client.release();

    const userItems = result.rows;
    console.log(req.params)
    console.log(userItems)

    userItems.forEach(item => {
        if (item.rtime) {
            item.rtime = new Date(item.rtime).toLocaleString('en-IN'); // Format rtime here
        }
    });


    res.render("userRequests", { userItems });


});



router.get('/profile', userAuthMiddleware, async (req, res) => {
    const email = req.user.email
    console.log(email);
    const client = await pool.poolUser.connect();
    const result = await client.query(`SELECT *  FROM registered WHERE email = $1`, [email]);
    client.release();
    const userItems = result.rows;
   
    userItems.forEach(item => {
        if (item.registereddate) {
            item.registereddate = new Date(item.registereddate).toLocaleString('en-IN'); // Format rtime here
        }
        if (item.id_proof) {
            const imageBuffer = item.id_proof;
            item.id_proof = imageBuffer.toString('base64');        
        }
    });

    res.render("profile", { userItems });

});



const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/')
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + path.extname(file.originalname)) // Appending extension
    }
});

const upload = multer({ storage: storage });

// const storage = multer.memoryStorage(); // Store files in memory
// const upload = multer({ dest: 'uploads/' }); // Configure multer to save files to 'uploads/' directory


router.post('/query', upload.single('id_proof'), async (req, res) => {

    // const action = req.body.submit;
    // const data = req.body.data;

    console.log(req.body)

    const {
        full_name,
        email,
        mobile,
        organization,
        occupation,
        reason,
        message

    } = req.body;

    try {

        if (!full_name || !email || !mobile || !occupation || !reason || !message) {
            const data = { message: 'All fields are required', title: "Warning", icon: "warning" };
            // return res.status(400).send('<script>alert("' + data.message + '");window.location.href = window.location.href;</script>');
            return res.json(data)
        }

        const validateIndianPhoneNumber = (mobile) => {
            const phoneRegex = /^[6-9]\d{9}$/;
            return phoneRegex.test(mobile);
        };

        if (!validateIndianPhoneNumber(mobile)) {
            const data = { message: 'Enter Valid Phone number!', title: "Warning", icon: "warning" };
            res.status(400);
            return res.json(data)
        }

        const isresolved = false;

        const client = await pool.poolUser.connect();

        const querydate = new Date();

        const query = `
        INSERT INTO queries ( full_name, email, mobile, occupation, reason, message,querydate, isresolved)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
            `;
        const values = [
            full_name,
            email,
            mobile,
            occupation,
            reason,
            message,
            querydate,
            isresolved
        ];

        // if (clientotp) {
        // console.log(`Result - ${result}`)
        // const client = await pool.poolUser.connect();
        await client.query(query, values);
        client.release();

        const data = { message: 'Query submitted  Successfully', title: "Submitted", icon: "success", redirect: '\\' };
        return res.status(400).json(data);

    } catch (error) {
        const data = { message: 'Something Went Wrong! try again', title: "Wrong", icon: "danger" };
        console.error('Error inserting data:', error);
        return res.status(400).json(data);

    }

});


router.post('/logout', userAuthMiddleware, (req, res) => {
    // res.clearCookie('token');
    // const data = { message: 'Logot successful', title: "Logout", icon: "success", redirect:'\\admin\\home' };
    //     return res.status(400).json(data);
    console.log("logout")

    try {


        // Clear the cookie containing the token
        res.clearCookie('token', { httpOnly: true, secure: process.env.NODE_ENV === 'production' });

        // Send a success response
        const data = { message: 'Logout successful', title: "Logged Out", icon: "success", redirect: '\\' };
        console.log(data)
        return res.json(data);
    } catch (error) {
        console.error(error);
        const data = { message: 'Logout failed', title: "Error", icon: "error" };

        return res.status(500).json(data);
    }

});





router.get('/download/:requestno', userAuthMiddleware, async (req, res) => {
    async function generateShapefile(request) {
        const { requestno, fields, values, operators, file_name } = request;
        const newfields = JSON.parse(fields.replace('{', '[').replace('}', ']').toString());
        const newvalues = JSON.parse(values.replace('{', '[').replace('}', ']').toString());
        const newoperators = JSON.parse(operators.replace('{', '[').replace('}', ']').toString());

        let conditions = newfields.map((field, index) => {
            let condition = `${field} = '${newvalues[index]}'`;
            if (index > 0) {
                condition = `${newoperators[index - 1]} ${condition}`;
            }
            return condition;
        }).join(' ');

        const query = `SELECT * FROM ${file_name} WHERE ${conditions}`;

        const requestDir = path.join(__dirname, 'downloads', `${requestno}`);
        if (!fs.existsSync(requestDir)) {
            fs.mkdirSync(requestDir);
        }

        const sqlFilePathBase = path.join(requestDir, `${requestno}`);
        const sqlFilePath = `${sqlFilePathBase}.shp`;
        const zipFilePath = `${sqlFilePathBase}.zip`;

        return new Promise((resolve, reject) => {
            exec(`pgsql2shp -f "${sqlFilePath}" -h localhost -u ${process.env.db_user} ${process.env.shp_db} "${query}"`, (err, stdout, stderr) => {
                if (err) {
                    console.error("Query execution error:", err);
                    reject(err);
                } else {
                    console.log("Query executed successfully!");

                    const zip = new AdmZip();
                    zip.addLocalFolder(requestDir);
                    zip.writeZip(zipFilePath); // Write the zip file to disk

                    resolve(zipFilePath);
                }
            });
        });
    }

    const requestno = req.params.requestno;
    const { email } = req.user;
    const client = await pool.poolUser.connect();

    try {
        const result = await client.query('SELECT * FROM requests WHERE requestno = $1 AND request_status = true AND email = $2', [requestno, email]);

        if (result.rows.length > 0) {
            const request = result.rows[0];

            try {
                const zipFilePath = await generateShapefile(request);
                console.log("Download will start ...");

                res.download(zipFilePath, err => {
                    if (err) {
                        console.error('Error sending file for download:', err);
                        res.status(500).send('File not found');
                    } else {
                        const requestDir = path.join(__dirname, 'downloads', `${requestno}`);

                        try {
                            rimraf.sync(requestDir); // Delete the directory
                            console.log("Temporary files cleaned up.");
                        } catch (error) {
                            console.error("Error deleting directory:", error);
                        }
                    }
                });
            } catch (err) {
                console.error("Error generating shapefile:", err);
                res.status(500).send('Error generating shapefile');
            }

        } else {
            console.log("Invalid or unapproved request");
            res.status(403).send('Request not approved or invalid');
        }

    } catch (err) {
        console.error("Error fetching request:", err);
        res.status(500).send('Error fetching request');
    } finally {
        client.release();
    }
});





// router.get('*', (req, res) => {
//     // Your OpenLayers logic here
//     // res.render("adminQueries");
//     res.render("404")

// });

module.exports = router;
