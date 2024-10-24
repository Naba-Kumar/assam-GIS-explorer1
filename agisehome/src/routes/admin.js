
const express = require('express');
const router = express.Router();
require('dotenv').config();
const bodyParser = require('body-parser');
const pool = require('../db/connection');
const multer = require('multer');
const path = require('path');
const adminAuthMiddleware = require("../middleware/adminAuth")
const jwt = require('jsonwebtoken');
const childProcess = require('child_process');
const { exec } = childProcess;
const AdmZip = require('adm-zip');
const axios = require('axios');
const validator = require('validator')
const fs = require('fs')


const cookieParser = require('cookie-parser');
const { log } = require('console');
router.use(cookieParser());

router.use(bodyParser.json());
router.use(bodyParser.urlencoded({ extended: true }));
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.email,
        pass: process.env.appw
    }
});






const loginstorage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'logins/')
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + path.extname(file.originalname)) // Appending extension
    }
});



const login = multer({ storage: loginstorage });


const storage = multer.diskStorage({
    destination: 'shpuploads/',
    filename: (req, file, cb) => {
        // Use the original filename (without any modifications)
        cb(null, file.originalname);
    }
});
const shpupload = multer({
    storage,
    dest: 'shpuploads/',
    fileFilter: (req, file, cb) => {
        if (file.mimetype === 'application/zip' || file.mimetype === 'application/x-zip-compressed') {
            cb(null, true);
        } else {
            cb(new Error('Invalid file type. Only ZIP files are allowed.'));
        }
    }
});





router.get('/', (req, res) => {
    // Your OpenLayers logic here
    try {

        res.status(200).render("adminLogin");
    } catch (error) {
        res.status(400).send(error)
    }

});

router.get('/home', adminAuthMiddleware, async (req, res) => {
    // Your OpenLayers logic here
    console.log(req.user)
    // const admin_id= req.user.admin_id;
    // res.render("adminHome",{admin_id});

    try {



        const client = await pool.poolUser.connect();
        const result = await client.query('SELECT Count(email)from registered');
        const result1 = await client.query('SELECT Count(email)from requests where is_checked= false AND is_isolated = false');
        const result2 = await client.query('SELECT Count(email)from requests where is_isolated = true');
        const result3 = await client.query('SELECT Count(file_id)from shapefiles');
        const result4 = await client.query('SELECT Count(file_id)from catalog');
        const result5 = await client.query('SELECT Count(queryid)from queries WHERE isresolved = false');
        client.release()

        console.log(`count ${result.rows[0].count}`)
        result.rows[0].requestcount = result1.rows[0].count
        result.rows[0].isolatedcount = result2.rows[0].count
        result.rows[0].uploadedfilecount = result3.rows[0].count
        result.rows[0].catalogfilecount = result4.rows[0].count
        result.rows[0].querycount = result5.rows[0].count
        result.rows[0].admin_id = req.user.admin_id


        const userItems = result.rows[0];
        res.status(200).render("adminHome", { userItems });
    } catch (error) {
        const data = { message: error, title: "Oops?", icon: "danger" };
        return res.status(400).send(error);
    }

});

router.post('/', login.single('id_proof'), async (req, res) => {
    // Your OpenLayers logic here
    const {
        admin_id,
        password
    } = req.body;
    console.log(req.body)

    try {

        const action = req.body.submit;
        console.log(action)
        try {
            // const password = req.body.password
            console.log("clicked admin login")
            console.log(req.body)

            if (!admin_id || !password) {
                const data = { message: 'All fields are required', title: "Warning", icon: "warning" };
                return res.status(400).json(data)
            }
            const client = await pool.poolUser.connect();
            const admin = await client.query('SELECT * FROM admins WHERE admin_id = $1', [admin_id]);
            client.release()
            if (admin.rows.length === 0) {
                console.log('Invalid Creadential 1')
                // return res.status(400).json({ error: 'Invalid Creadential' });
                const data = { message: 'Invalid Creadential', title: "Warning", icon: "danger" };
                return res.status(400).json(data);
            }

            if (password != admin.rows[0].password) {
                console.log('Invalid Creadential 2')
                const data = { message: 'Invalid Creadential', title: "Warning", icon: "danger" };
                return res.status(400).json(data);

            }

            const token = await jwt.sign({ admin_id: admin.rows[0].admin_id }, process.env.adminSecretKey, { expiresIn: '1h' });

            console.log("token")

            res.cookie('token', token, { httpOnly: true, secure: process.env.NODE_ENV === 'production' })

            const data = { message: 'Login successful', title: "Sent", icon: "success", redirect: '\\admin\\home' };
            return res.status(201).json(data);
        } catch (error) {

            console.log(error)
        }
    } catch (error) {
        const data = { message: error, title: "Oops?", icon: "danger" };
        return res.status(400).json(data);
    }
});

router.post('/home', adminAuthMiddleware, (req, res) => {
    try {
        res.status(200).render("adminHome");
    } catch (error) {
        const data = { message: error, title: "Oops?", icon: "danger" };
        return res.status(400).json(data);
    }

});

router.get('/requests', adminAuthMiddleware, async (req, res) => {
    try {
        const client = await pool.poolUser.connect();

        const reqResult = await client.query('SELECT * FROM requests WHERE is_checked=$1 AND is_isolated=$2', [false, false]);
        const reqResultItems = reqResult.rows;

        const userResult = await client.query('SELECT * FROM registered');
        const userResultItems = userResult.rows.reduce((acc, user) => {
            acc[user.email] = user;
            return acc;
        }, {});

        const combinedData = reqResultItems.map(request => {
            const user = userResultItems[request.email] || {};
            const imageBuffer = user.id_proof;
            const base64Image = imageBuffer ? imageBuffer.toString('base64') : null;
            return {
                requestno: request.requestno,
                first_name: user.first_name,
                last_name: user.last_name,
                email: request.email,
                organization: user.organization,
                designation: user.designation,
                file_name: request.file_name,
                fields: request.fields,
                values: request.values,
                operators: request.operators,
                rtime: request.rtime.toLocaleString(),
                id_proof: base64Image
            };
        });

        client.release();
        return res.status(200).render('adminFileRequests', { combinedData });
    } catch (error) {
        console.error('Error fetching data:', error);
        res.status(500).send('Internal Server Error');
    }
});

router.post('/requests', adminAuthMiddleware, async (req, res) => {
    const { action, email, requestno } = req.body;

    try {
        const client = await pool.poolUser.connect();

        let query = '';
        let params = [];

        if (action === 'approve') {
            update_query = `
                UPDATE requests
                SET is_checked=$1, request_status=$2, is_isolated=$3
                WHERE email=$4 AND requestno=$5
            `;
            params = [true, true, false, email, requestno];
            await client.query(update_query, params);


            // const insert_query = `
            //         INSERT INTO useraccess( email, file_name)
            //         VALUES ($1, $2)
            //             `;
            //     const insert_values = [
            //         email,
            //         file_name
            //     ];
            //     await client.query(insert_query, insert_values);


        } else if (action === 'reject') {
            // console.log(req.body);
            query = `
                UPDATE requests
                SET is_checked=$1, request_status=$2, is_isolated=$3
                WHERE email=$4 AND requestno=$5
            `;
            params = [true, false, false, email, requestno];
            await client.query(query, params);

        } else if (action === 'isolate') {
            query = `
                UPDATE requests
                SET is_checked=$1, is_isolated=$2
                WHERE email=$3 AND requestno=$4
            `;
            params = [true, true, email, requestno];
            await client.query(query, params);

        }
        client.release();


        const data = { message: `Request ${action}d`, title: "Success", icon: "success" };
        return res.status(200).json(data);

    } catch (error) {
        console.error('Error handling request:', error);
        const data = { message: 'An error occurred', title: "Error", icon: "error" };
        return res.status(500).json(data);
    }
});





router.get('/isolated', adminAuthMiddleware, async (req, res) => {
    try {
        const client = await pool.poolUser.connect();

        const reqResult = await client.query('SELECT * FROM requests WHERE is_isolated=$1', [true]);
        const reqResultItems = reqResult.rows;

        const userResult = await client.query('SELECT * FROM registered');
        const userResultItems = userResult.rows.reduce((acc, user) => {
            acc[user.email] = user;
            return acc;
        }, {});

        const combinedData = reqResultItems.map(request => {
            const user = userResultItems[request.email] || {};
            const imageBuffer = user.id_proof;
            const base64Image = imageBuffer ? imageBuffer.toString('base64') : null;
            return {
                requestno: request.requestno,
                first_name: user.first_name,
                last_name: user.last_name,
                email: request.email,
                organization: user.organization,
                designation: user.designation,
                file_name: request.file_name,
                id_proof: base64Image
            };
        });

        client.release();
        return res.status(200).render('adminFileRequestsIso', { combinedData });
    } catch (error) {
        console.error('Error fetching data:', error);
        res.status(500).send('Internal Server Error');
    }
});



router.get('/upload', adminAuthMiddleware, (req, res) => {
    // Your OpenLayers logic here
    try {
        res.status(200).render("adminUpload");
    } catch (error) {
        const data = { message: error, title: "Oops?", icon: "danger" };
        return res.status(400).json(data);
    }

});

router.post('/shpuploads', adminAuthMiddleware, shpupload.single('shapefile'), async (req, res) => {
    // Your OpenLayers logic here

    console.log("jij")
    try {
        const { table_name, workspace, data_store, srid } = req.body;

        if (!table_name || !srid) {
            const data = { message: 'All Fields Are Required', title: "Alert", icon: "warning", redirect: '\\admin\\upload' };
            return res.status(400).json(data);
        }

        const client = await pool.poolShp.connect();

        const query = `
                SELECT EXISTS (
                    SELECT 1 
                    FROM information_schema.tables 
                    WHERE table_schema = 'public'
                    AND table_name = $1
                );
            `;
        const result = await client.query(query, [table_name]);
        const checkTableExists = result.rows[0].exists;
        client.release()

        if (checkTableExists) {
            const data = { message: 'Shapefile Name Already Exist', title: "Oops?", icon: "danger", redirect: '\\admin\\upload' };
            return res.status(400).json(data);
        }



        console.log("hello from shpupld")


        // ---------------------------------------
        // -----------------------------------------

        const basedir = 'shpuploads/'
        const zip = new AdmZip(req.file.path);

        const fullDirectoryPath = path.join(basedir, table_name)

        zip.extractAllTo(fullDirectoryPath, true);

        const tmpshppath0 = fullDirectoryPath + '\\' + req.file.originalname;

        const tmpshppath = path.normalize(tmpshppath0);
        // Extract the file name without the extension
        const shapefilePath = tmpshppath.replace(".zip", ".shp");
        // Return the file name with the new extension

        // process.env.PGPASSWORD = '306090';

        const cmd = `shp2pgsql -I -s ${srid} ${shapefilePath} ${table_name} | psql -U ${process.env.db_user} -d ${process.env.shp_db}`;

        console.log(cmd)

        exec(cmd, { env: { ...process.env, PGPASSWORD: process.env.PGPASSWORD } }, async (error, stdout, stderr) => {
            if (error) {
                console.error(`exec error: ${error}`);
                // return res.status(500).send('Error uploading shapefile.');
                const data = { message: 'Something Were Wrong', title: "Oops?", icon: "danger", redirect: '\\admin\\upload' };
                return res.status(400).json(data);
            }
            if (stderr) {
                console.error(`stder/r: ${stderr}`);
                // return res.status(500).send('Error uploading shapefile.');
                // const data = { message: 'Something Were Wrong', title: "Oops?", icon: "danger", redirect: '\\admin\\upload' };
                // return res.status(400).json(data);
            }
            if (stdout) {
                // console.error(`stdout: ${stdout}`);
                // return res.status(500).send('Error uploading shapefile.');
            }

            // If successful, send a success response
            // res.send('Shapefile uploaded successfully.');

            const catalogPath = path.join(__dirname, "../../catalog")

            let sourceFilePath = req.file.path;
            // Check if the source file exists
            if (!fs.existsSync(sourceFilePath)) {
                return res.status(404).send('Source file not found.');
            }

            // Create the destination folder if it doesn't exist
            if (!fs.existsSync(catalogPath)) {
                fs.mkdirSync(catalogPath, { recursive: true });
            }

            // const destinationFolderPath = req.body.destinationFolderPath; // Destination folder path
            const newFileName = table_name; // New file name (without extension)

            // Construct the destination file path with the new name
            const fileExtension = path.extname(sourceFilePath);
            const destinationFilePath = path.join(catalogPath, `${newFileName}${fileExtension}`);

            // Copy the file
            console.log(fileExtension)

            console.log(destinationFilePath)
            fs.copyFileSync(sourceFilePath, destinationFilePath);
            //    fs.unlinkSync(sourceFilePath);

            const is_added = false;
            const query = `
                 INSERT INTO shapefiles (file_name, is_added)
                 VALUES ($1, $2)
                `;

            const values = [
                table_name,
                is_added
            ];

            try {
                const client = await pool.poolUser.connect();

                const checkUpload = await client.query(query, values);

                client.release();
                console.log('Shapefile uploaded successfully');
                const data = { message: 'Shapefile uploaded successfully', title: "uploaded", icon: "success", redirect: '\\admin\\upload' };
                console.log(data)
                return res.status(201).json(data);
            } catch (dbError) {
                console.error('Error executing database query:', dbError);
                const data = { message: 'something went wrong ', title: "Oops?", icon: "danger" };
                return res.status(400).json(data);
                res.status(500).send('Error executing database query');
            }


        })


    } catch (error) {

        console.error(`erryor: ${error}`)
        const data = { message: 'Invalid zip format or Something went wrong', title: "Oops?", icon: "error" };
        console.log(data)
        return res.status(400).json(data);
    }

});


// Route to get item details
// Route to fetch item details based on file_name
router.get('/catalog/:file_name', async (req, res) => {
    try {
        const { file_name } = req.params;
        const client = await pool.poolUser.connect();
        const { rows } = await client.query('SELECT file_id, file_name FROM shapefiles WHERE file_name = $1', [file_name]);
        client.release();
        if (rows.length) {
            res.json(rows[0]);
        } else {
            res.status(404).send('File not found');
        }
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});

// Route to render the form with file names
router.get('/catalog', adminAuthMiddleware, async (req, res) => {
    try {
        const client = await pool.poolUser.connect();
        const { rows } = await client.query('SELECT file_id, file_name FROM shapefiles WHERE is_added=false');
        client.release();
        res.status(200).render('adminAddCatalog', { catalogItems: rows });
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});



// router.post('/catalog', adminAuthMiddleware, login.single('id_proof'), async (req, res) => {

//     console.log(req.body)



//     const { file_name, file_id, workspace, store, title, description } = req.body;

//     try {
//         if (!file_name || !file_id || !workspace || !store || !title || !description) {
//             const data = { message: 'All fields are required', title: "Warning", icon: "warning" };
//             return res.json(data)
//         }

//         console.log(req.body)

//            // Define attributes
//     const attributes = [
//         { name: 'name', binding: 'java.lang.String' },
//         { name: 'description', binding: 'java.lang.String' },
//         { name: 'latitude', binding: 'java.lang.Double' },
//         { name: 'longitude', binding: 'java.lang.Double' }
//     ];

//     const existingFeatureTypes = featureTypesResponse.data.featureTypes.featureType;
//     const featureTypeExists = existingFeatureTypes.some(ft => ft.name === file_name);

//         axios.post(`http://localhost:8080/geoserver/rest/workspaces/${workspace}/datastores/${store}/featuretypes`, {
//             featureType: {
//                 name: file_name,
//                 nativeName: file_name,
//                 title: title,
//                 srs: 'EPSG:4326',
//                 attributes: {
//                     attribute: [
//                 //       { name: 'name', binding: 'java.lang.String' },
//                 { "name": "name", "binding": "java.lang.String" }

//                 //       { name: 'description', binding: 'java.lang.String' },
//                 //       { name: 'latitude', binding: 'java.lang.Double' },
//                 //       { name: 'longitude', binding: 'java.lang.Double' }
//                     ]
//                   }
//             }
//         }, {
//             auth: {
//                 username: 'admin',
//                 password: 'geoserver'
//             }
//         }).then(async response => {
//             // res.send('Shapefile uploaded and published successfully');
//             console.log('--------------------------------------')
//             console.log(response)
//             console.log('--------------------------------------')


//             const client = await pool.poolUser.connect();

//             const visibility = true;

//             console.log("heyyyyyyyyyyyyyyyy")

//             const query = `
//                 INSERT INTO catalog( file_name, file_id, workspace, store, title, description, visibility)
//                 VALUES ($1, $2, $3, $4, $5, $6, $7)
//                     `;
//             const values = [
//                 file_name,
//                 file_id,
//                 workspace,
//                 store,
//                 title,
//                 description,
//                 visibility
//             ];

//             const checkUpload = await client.query(query, values);



//             const shapefile_table_query = `
//             UPDATE shapefiles
//             SET is_added=$1
//             WHERE file_name=$2
//              `;

//             const shapefile_table_update = [true, file_name]

//             await client.query(shapefile_table_query, shapefile_table_update);

//             console.log("-------------------")
//             console.log(checkUpload)
//             console.log("-------------------")
//             client.release();

//             // console.error('Error publishing to to GeoServer:', error);
//             const data = { message: 'File Published to GeoServer', title: "Success", icon: "success" };
//             console.log(data)
//             return res.status(201).json(data);




//         }).catch(error => {
//             console.error('Error publishing to GeoServer:', error);
//             const data = { message: 'Error publishing to GeoServer', title: "Oops?", icon: "danger" };
//             console.log(data)
//             return res.status(500).json(data);
//         });


//     } catch (error) {
//         console.error(`Error - ${error}`)

//     }


// });



// router.post('/catalog', adminAuthMiddleware, login.single('id_proof'), async (req, res) => {
//     console.log(req.body);

//     const { file_name, file_id, workspace, store, title, description } = req.body;

//     if (!file_name || !file_id || !workspace || !store || !title || !description) {
//         const data = { message: 'All fields are required', title: "Warning", icon: "warning" };
//         return res.json(data);
//     }

//     // Define attributes
//     const attributes = [
//         { name: 'name', binding: 'java.lang.String' },
//         { name: 'description', binding: 'java.lang.String' },
//         { name: 'latitude', binding: 'java.lang.Double' },
//         { name: 'longitude', binding: 'java.lang.Double' }
//     ];

//     try {
//         // Check if feature type exists
//         const featureTypesResponse = await axios.get(`http://localhost:8080/geoserver/rest/workspaces/${workspace}/datastores/${store}/featuretypes`, {
//             auth: {
//                 username: 'admin',
//                 password: 'geoserver'
//             }
//         });

//            // Check if the featureType key is present and if it contains any feature types
//     let featureTypeExists = false;
//     if (featureTypesResponse.data.featureTypes && Array.isArray(featureTypesResponse.data.featureTypes.featureType)) {
//         const existingFeatureTypes = featureTypesResponse.data.featureTypes.featureType;
//         featureTypeExists = existingFeatureTypes.some(ft => ft.name === file_name);
//     }

//         if (featureTypeExists) {
//             // Create new feature type
//             await axios.post(`http://localhost:8080/geoserver/rest/workspaces/${workspace}/datastores/${store}/featuretypes`, {
//                 featureType: {
//                     name: file_name,
//                     nativeName: file_name,
//                     title: file_name,
//                     srs: 'EPSG:4326',
//                     attributes: { attribute: attributes }
//                 }
//             }, {
//                 auth: {
//                     username: 'admin',  
//                     password: 'geoserver'
//                 }
//             });
//         } else {
//             // Create new feature type
//             await axios.post(`http://localhost:8080/geoserver/rest/workspaces/${workspace}/datastores/${store}/featuretypes`, {
//                 featureType: {
//                     name: file_name,
//                     nativeName: file_name,
//                     title: file_name,
//                     srs: 'EPSG:4326',
//                     // attributes: { attribute: attributes }
//                 }
//             }, {
//                 auth: {
//                     username: 'admin',
//                     password: 'geoserver'
//                 }
//             });
//             // Update existing feature type if necessary
//             // You can add logic here to update attributes if required
//         }

//         // Process database update and response
//         const client = await pool.poolUser.connect();
//         const visibility = true;

//         const query = `
//             INSERT INTO catalog(file_name, file_id, workspace, store, title, description, visibility)
//             VALUES ($1, $2, $3, $4, $5, $6, $7)
//         `;
//         const values = [file_name, file_id, workspace, store, title, description, visibility];
//         await client.query(query, values);

//         const shapefileTableQuery = `
//             UPDATE shapefiles
//             SET is_added = $1
//             WHERE file_name = $2
//         `;
//         const shapefileTableUpdate = [true, file_name];
//         await client.query(shapefileTableQuery, shapefileTableUpdate);

//         client.release();

//         const data = { message: 'File Published to GeoServer', title: "Success", icon: "success" };
//         return res.status(201).json(data);

//     } catch (error) {
//         // if (error) {
//         //     // Handle specific GeoServer errors
//         //     // if (error.response.data.includes('property named name')) {
//         //         // Handle attribute not found error
//         //         console.error('Attribute error:', error);
//         //         // const data = { message: 'Feature type attribute missing', title: "Error", icon: "danger" };
//         //         return res.status(400).json(data);
//         //     // } else if (error.response.data.includes('no attributes were specified')) {
//         //         // Handle missing attributes error
//         //         console.error('Missing attributes error:', error);
//         //         const data = { message: 'Attributes were not specified', title: "Error", icon: "danger" };
//         //         return res.status(400).json(data);
//         //     // }
//         // }

//         console.error(`Unexpected error: ${error}`);
//         const data = { message: 'Unexpected server error', title: "Error", icon: "danger" };
//         return res.status(500).json(data);
//     }
// });


router.post('/catalog', adminAuthMiddleware, login.single('id_proof'), async (req, res) => {
    console.log(req.body);

    const { file_name, file_id, workspace, store, title, description } = req.body;

    if (!file_name || !file_id || !workspace || !store || !title || !description) {
        const data = { message: 'All fields are required', title: "Warning", icon: "warning" };
        return res.json(data);
    }

    // Define attributes
    // const attributes = [
    //     { name: 'name', binding: 'java.lang.String' },
    //     { name: 'description', binding: 'java.lang.String' },
    //     { name: 'latitude', binding: 'java.lang.Double' },
    //     { name: 'longitude', binding: 'java.lang.Double' }
    // ];

    const auth = {
        username: 'admin',
        password: 'geoserver'
    };

    try {
        // Check if feature type exists
        const featureTypesResponse = await axios.get(`http://localhost:8080/geoserver/rest/workspaces/${workspace}/datastores/${store}/featuretypes`, {
            auth: {
                username: 'admin',
                password: 'geoserver'
            }
        });

        // Check if the featureType key is present and if it contains any feature types
        let featureTypeExists = false;

        if (featureTypesResponse.data.featureTypes && Array.isArray(featureTypesResponse.data.featureTypes.featureType)) {
            const existingFeatureTypes = featureTypesResponse.data.featureTypes.featureType;
            featureTypeExists = existingFeatureTypes.some(ft => ft.name === file_name);
            // console.log("existingFeatureTypes");
            // console.log(existingFeatureTypes)

        }

        const geoserverUrl = 'http://localhost:8080/geoserver/rest';
        const auth = {
            username: 'admin',
            password: 'geoserver'
        };

        if (featureTypeExists) {
            const data = { message: 'Layer with same already exists in the workspace', title: "warning", icon: "warning" };
            return res.status(201).json(data);

        }
        else {
            console.log("Create new feature type");

            // Create new feature type
            await axios.post(`http://localhost:8080/geoserver/rest/workspaces/${workspace}/datastores/${store}/featuretypes`, {
                featureType: {
                    name: file_name,
                    nativeName: file_name,
                    title: title,
                    srs: 'EPSG:4326',
                }
            }, {
                auth: {
                    username: 'admin',
                    password: 'geoserver'
                }
            })
                .then(function (response) {
                    console.log(response.data);
                    console.log(response.status);
                    console.log(response.statusText);
                    console.log(response.headers);
                    console.log(response.config);
                })
                .catch(function (error) {
                    console.log(error);

                })
            // Update existing feature type if necessary
            // You can add logic here to update attributes if required
        }

        // Process database update and response
        const client = await pool.poolUser.connect();
        const visibility = true;

        const uploaddate = new Date();

        const query = `
                INSERT INTO catalog(file_name, file_id, uploaddate, workspace, store, title, description, visibility)
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
            `;
        const values = [file_name, file_id, uploaddate, workspace, store, title, description, visibility];
        await client.query(query, values);

        const shapefileTableQuery = `
                UPDATE shapefiles
                SET is_added = $1
                WHERE file_name = $2
            `;
        const shapefileTableUpdate = [true, file_name];
        await client.query(shapefileTableQuery, shapefileTableUpdate);

        client.release();

        const data = { message: 'File Published to GeoServer', title: "Success", icon: "success" };
        return res.status(201).json(data);

    } catch (error) {
        // if (error) {
        //     // Handle specific GeoServer errors
        //     // if (error.response.data.includes('property named name')) {
        //         // Handle attribute not found error
        //         console.error('Attribute error:', error);
        //         // const data = { message: 'Feature type attribute missing', title: "Error", icon: "danger" };
        //         return res.status(400).json(data);
        //     // } else if (error.response.data.includes('no attributes were specified')) {
        //         // Handle missing attributes error
        //         console.error('Missing attributes error:', error);
        //         const data = { message: 'Attributes were not specified', title: "Error", icon: "danger" };
        //         return res.status(400).json(data);
        //     // }
        // }

        // console.log("-----------------error-----------------------");
        // console.log(error)
    
        console.error(`Unexpected error: ${error}`);
        const data = { message: 'Unexpected server error', title: "Error", icon: "danger" };
        return res.status(500).json(data);
    }
});







router.delete('/delete', adminAuthMiddleware, async (req, res) => {
    console.log(req.body);

    const { file_name, file_id, workspace, store, title, description } = req.body;
    const auth = {
        username: 'admin',
        password: 'geoserver'
    };

    try {
        // Check if feature type exists
        const featureTypesResponse = await axios.get(`http://localhost:8080/geoserver/rest/workspaces/${workspace}/datastores/${store}/featuretypes`, {
            auth: {
                username: 'admin',
                password: 'geoserver'
            }
        });

        // Check if the featureType key is present and if it contains any feature types
        let featureTypeExists = false;

        if (featureTypesResponse.data.featureTypes && Array.isArray(featureTypesResponse.data.featureTypes.featureType)) {
            const existingFeatureTypes = featureTypesResponse.data.featureTypes.featureType;
            featureTypeExists = existingFeatureTypes.some(ft => ft.name === file_name);
            // console.log("existingFeatureTypes");
        }

        const geoserverUrl = 'http://localhost:8080/geoserver/rest';
        const auth = {
            username: 'admin',
            password: 'geoserver'
        };

        if (featureTypeExists) {
            const layerResponse = await axios.delete(`${geoserverUrl}/layers/${file_name}`,
                { auth }
            ).then(async function (response) {
                // console.log("res del --------------------------ftr");
                // console.log(response.data);
                // Process database update and response
                const client = await pool.poolUser.connect();

                const query = `
                DELETE FROM catalog WHERE file_name = $1
            `;
                const values = [file_name];
                await client.query(query, values);

                const shapefileTableQuery = `
                DELETE FROM shapefiles WHERE file_name = $1
            `;
                const shapefileTableUpdate = [file_name];
                await client.query(shapefileTableQuery, shapefileTableUpdate);
                client.release();

            }).catch(function (err) {
                // console.log("res del --------------------------lyrerr");
                // console.log(err);
            })
            console.log('Layer deleted:');

            // Optionally, delete the feature type
            const featureTypeResponse = await axios.delete(
                `${geoserverUrl}/workspaces/${workspace}/datastores/${store}/featuretypes/${file_name}?recurse=true`,
                { auth }
            ).then(function (response) {
                // console.log("res del --------------------------ftr");
                // console.log(response.data);

            }).catch(function (err) {
                // console.log("res del --------------------------ftrerr");
                // console.log(err);
            })
            //   console.log('FeatureType deleted:', featureTypeResponse.statusText);
            const data = { message: 'Layer deleted successfully from both geoserver & postgres', icon: "success" };
            return res.status(201).json(data);
        }
        else {
            const data = { message: 'Feature type not Exists', title: "warning", icon: "warning" };
            return res.status(201).json(data);
        }

    } catch (error) {

        // console.log("-----------------error-----------------------");
        // console.log(error)

        console.error(`Unexpected error: ${error}`);
        const data = { message: 'Unexpected server error', title: "Error", icon: "danger" };
        return res.status(500).json(data);
    }
});


router.get('/delete', adminAuthMiddleware, async (req, res) => {
    try {
        const client = await pool.poolUser.connect();
        const result = await client.query('SELECT *  FROM catalog');
        client.release();

        const dataItems = result.rows;

        // client.release();
        res.status(200).render('adminFileDelete', { dataItems });
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }

});


router.get('/manage', adminAuthMiddleware, async (req, res) => {
    try {
        const client = await pool.poolUser.connect();
        const result = await client.query('SELECT sn, file_id, file_name, title, visibility  FROM catalog');
        client.release();

        const catalogItems = result.rows;

        // client.release();
        res.status(200).render('adminCatalogManage', { catalogItems });

        // res.render('adminAddCatalog', { catalogItems: rows });
        // res.render('adminCatalogManage');

    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});




router.put('/manage', adminAuthMiddleware, async (req, res) => {
    const { id, visibility } = req.body;

    if (id == null || visibility == null) {
        return res.status(400).json({ error: 'Invalid request' });
    }

    try {
        const client = await pool.poolUser.connect();
        const query = `
            UPDATE catalog
            SET visibility = $1
            WHERE sn = $2
        `;
        const values = [visibility, id];

        await client.query(query, values);
        client.release(); // Ensure the connection is released
        res.status(201).json({ success: true, icon: 'success' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server Error' });
    }
});




router.get('/privilege', adminAuthMiddleware, async (req, res) => {
    try {
        const client = await pool.poolUser.connect();
        const result = await client.query('SELECT * FROM registered');
        const userItems = result.rows;
        client.release();
        // res.render('adminAddCatalog', { catalogItems: rows });
        // console.log(userItems)
        res.status(200).render('adminPrivilege', { userItems });

    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});




router.put('/privilege', adminAuthMiddleware, async (req, res) => {
    const { email, privileged } = req.body;
    console.log(req.body)

    if (email == null || privileged == null) {
        return res.status(400).json({ error: 'Invalid request' });
    }

    try {
        const client = await pool.poolUser.connect();
        const query = `
            UPDATE registered
            SET isprivileged = $1
            WHERE email = $2
        `;
        const values = [privileged, email];

        await client.query(query, values);
        client.release(); // Ensure the connection is released
        res.status(200).json({ success: true, icon: 'success' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server Error' });
    }
});

router.get('/search', adminAuthMiddleware, async (req, res) => {
    console.log("search")

    try {
        console.log("search2")
        const client = await pool.poolUser.connect();
        const result = await client.query('SELECT *  FROM registered');
        client.release();

        const userItems = result.rows;
        console.log(userItems);

        const imageBuffer = result.rows[0].id_proof;
        result.rows[0].id_proof = imageBuffer.toString('base64');

        // client.release();
        res.render('adminSearch', { userItems });

        // res.render('adminAddCatalog', { catalogItems: rows });
        // res.render('adminCatalogManage');

    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});

// router.get('/search', adminAuthMiddleware, async (req, res) => {
//     try {
//         const client = await pool.poolUser.connect();
//         const result = await client.query('SELECT *  FROM registered');
//         client.release();

//         const userItems = result.rows;

//         const imageBuffer = result.rows[0].id_proof;
//         result.rows[0].id_proof = imageBuffer.toString('base64');

//         // client.release();
//         res.render('adminSearch', { userItems});

//         // res.render('adminAddCatalog', { catalogItems: rows });
//         // res.render('adminCatalogManage');

//     } catch (err) {
//         console.error(err);
//         res.status(500).send('Server Error');
//     }
// });



// router.get('/login', (req, res) => {
//     // Your OpenLayers logic here
//     res.render("adminLogin");

// });


router.get('/queries', adminAuthMiddleware, async (req, res) => {
    // Your OpenLayers logic here
    try {
        const client = await pool.poolUser.connect();
        const { rows } = await client.query('SELECT * FROM queries WHERE isresolved=$1', [false]);
        client.release();
        res.status(200).render('adminQueries', { queries: rows });
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }

});
router.post('/queries', adminAuthMiddleware, async (req, res) => {

    console.log(req.body)


    const { action, queryid, email, reply } = req.body
    const client = await pool.poolUser.connect();
    try {
        let query = '';
        let params = [];

        if (action === 'ignor') {
            try {
                query = `
                    UPDATE queries
                    SET isresolved=$1
                    WHERE queryid=$2
                `;
                params = [true, queryid];
                await client.query(query, params);
                const data = { message: 'Ignored', title: "Alert", icon: "alert" };
                return res.status(400).json(data);
            } catch (error) {

            }

        } else if (action === 'send') {

            try {

                if (!validator.isEmail(email)) {
                    const data = { message: 'Invalid email', title: "Alert", icon: "danger" };
                    return res.status(400).json(data);
                }


                // Send reply via email
                await transporter.sendMail({
                    from: process.env.email,
                    to: req.body.email,
                    subject: 'Answer of your Query',
                    text: `${reply}`
                });

                const client = await pool.poolUser.connect();
                query = `
                UPDATE queries
                SET isresolved=$1
                WHERE queryid=$2
                `;
                params = [true, queryid];
                await client.query(query, params);
                client.release()


                const data = { message: 'reply sent successfully', title: "Sent", icon: "success" };
                return res.status(200).json(data);



            } catch (err) {
                console.error('Error in sending reply via email:', err);
                const error = { message: 'something went wrong' };

                const data = { message: 'something went wrong, Try again!', title: "Error", icon: "danger" };
                return res.status(400).json(data);
            }


        }
    } catch (error) {
        const data = { message: error, title: "Oops?", icon: "danger" };
        return res.status(400).json(data);
    }
});
router.post('/logout', adminAuthMiddleware, (req, res) => {
    // res.clearCookie('token');
    // const data = { message: 'Logot successful', title: "Logout", icon: "success", redirect:'\\admin\\home' };
    //     return res.status(400).json(data);

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


router.get('*', (req, res) => {
    // Your OpenLayers logic here
    // res.render("adminQueries");
    res.render("404")

});




module.exports = router;
