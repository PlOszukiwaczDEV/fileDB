const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv').config();

var Filter = require('bad-words');
var filter = new Filter();
const port = 3000;

// check if .env and databases exist
if (!fs.existsSync('databases')) {
    fs.mkdirSync('databases');
    fs.writeFileSync('databases/passwords.json', '{}');
    fs.writeFileSync('databases/info.json', '{}');
    console.log("[+] Databases have been created.");
}
if (!fs.existsSync('.env')) {
    fs.writeFileSync('.env', 'AES_KEY=<aes key encoded in base64>\nAES_IV=<aes iv encoded in base64>\nALG=aes-256-cbc');
    console.log("[+] An example .env file has been made. Please fill it out and restart the server.");
    return;
}

// const whitelist = ['http://example1.com', 'http://example2.com'];
// const corsOptions = {
//   origin: (origin, callback) => {
//     if (whitelist.indexOf(origin) !== -1 || !origin) {
//       callback(null, true);
//     } else {
//       callback(new Error('Not allowed by CORS'));
//     }
//   }
// };

// const corsOptions = {
//     origin: 'http://example.com', // Replace with your client's domain
//     optionsSuccessStatus: 200 // Some legacy browsers choke on 204
// };

const corsOptions = {
    optionsSuccessStatus: 200 // Some legacy browsers choke on 204
};

const app = express();
app.use(cors(corsOptions));

const flagList = ["AD","AE","AF","AG","AI","AH","AK","AL","AM","AN","AO","AQ","AR","AS","AT","AU",
                  "AW","AX","AZ","BA","BB","BD","BE","BF","BG","BH","BI","BJ","BL","BM","BN","BO",
                  "BQ","BR","BS","BT","BV","BW","BY","BZ","CA","CC","CD","CF","CG","CH","CI","CK",
                  "CL","CM","CN","CO","CR","CU","CV","CW","CX","CY","CZ","DE","DJ","DK","DM","DO",
                  "DZ","EC","EE","EG","EH","ER","ES","ET","EU","FI","FJ","FK","FM","FO","FR","GA",
                  "GB","GD","GE","GF","GG","GH","GI","GL","GM","GN","GP","GQ","GR","GS","GT","GU",
                  "GW","GY","HK","HM","HN","HR","HT","HU","IC","ID","IE","IL","IM","IN","IO","IQ",
                  "IR","IS","IT","JE","JM","JO","JP","KE","KG","KH","KI","KM","KN","KP","KR","KW",
                  "KY","KZ","LA","LB","LC","LI","LK","LR","LS","LT","LU","LV","LY","MA","MC","MD",
                  "ME","MF","MG","MH","MK","ML","MM","MN","MO","MP","MQ","MR","MS","MT","MU","MV",
                  "MW","MX","MY","MZ","NA","NC","NE","NF","NG","NI","NL","NO","NP","NR","NU","NY",
                  "NZ","OM","PA","PE","PF","PG","PH","PK","PL","PM","PN","PR","PS","PT","PW","PY",
                  "QA","RE","RO","RS","RU","RW","SA","SB","SC","SD","SE","SG","SH","SI","SJ","SK",
                  "SL","SM","SN","SO","SR","SS","ST","SV","SX","SY","SZ","TC","TD","TF","TG","TH",
                  "TJ","TK","TL","TM","TN","TO","TR","TT","TV","TW","TZ","UA","UG","UM","US","UY",
                  "UZ","VA","VC","VE","VG","VI","VN","VU","WF","WS","XK","YE","YT","ZA","ZM","ZW"]

// AES_KEY
// AES_IV
// ALG

// testData = "hello"
// console.log(testData)
// enc = encrypt(testData)
// console.log(enc)
// dec = decrypt(enc)
// console.log(dec)

// register endpoint
app.post('/register', (req, res) => {
    const username = req.headers.username;
    const password = req.headers.password;
    const flag = req.headers.flag;

    // Check if any of the headers are missing
    if (!username || !password || !flag) {
        return res.status(400).json({
            error: 'Missing username, password, or flag headers'
        });
    }

    console.info(`[+] ${req.hostname} has made a request with the username ${username} password ${password} and flag ${flag}`);

    // Check if the username is too long
    if (username.length > 14) {
        console.info(`[-] ${req.hostname} tried to register with a username longer than 14 characters`);
        return res.status(406).json({
            error: 'Username too long! Max length is 14 exists!'
        });
    }

    // Read the current password database
    const passDB = readPassDB();
    const infoDB = readInfoDB();

    // Check if the username already exists
    if (passDB[username] && infoDB[username]) {
        console.info(`[-] ${req.hostname} tried to register with an existing username`);
        return res.status(406).json({
            error: 'Username already exists!'
        });
    }

    // Check if the username contains any profinaty
    if (filter.isProfane(username)) {
        console.info(`[-] ${req.hostname} tried to register with a profane username`);
        return res.status(406).json({
            error: 'Username is profane!'
        });
    }

    // Hash the password
    const hashedPassword = encrypt(sha256Hash(password));

    // Add the new user to the password database
    passDB[username] = hashedPassword;

    // Save the info
    infoDB[username] = {
        rank: '-1',
        flag: flag,
        avatar: '1'
    }

    saveDBs(passDB, infoDB)

    res.status(200).json({
        message: 'Success!'
    });
    console.info(`[+] ${req.hostname} has registered with the username ${username} and password ${password}`);
});

// login endpoint
app.get('/login', (req, res) => {
    const username = req.headers.username;
    const password = req.headers.password;

    if (!username || !password) {
        return res.status(400).json({
            error: 'Missing username or password headers'
        });
    }

    // Check if the username exists and the password is correct
    const hashedPassword = encrypt(sha256Hash(password));
    const passDB = readPassDB();

    if (!passDB[username] || passDB[username] !== hashedPassword) {
        console.info(`[-] ${req.hostname} tried to login with an invalid username or password`);
        return res.status(406).json({
            error: 'Invalid username or password!'
        });
    }

    console.log(`[+] ${req.hostname} has logged in with the username ${username} and password ${password}`);
    res.status(200).json({
        message: "Success!",
        token: generateToken(username, hashedPassword)
    });
    // idk generate a token i am not sure what to do wating for what to do
});

// change endpoint
app.get('/change', (req, res) => {
    const token = req.headers.token;
    const username = req.headers.username;
    const change = req.headers.change;
    const changeList = [
        "avatar",
        "flag",
        "username",
        "password"
    ]
    const changeValue = req.headers.value;

    // check for headers
    if (!token || !username|| !change || !changeValue) {
        return res.status(400).json({
            error: 'Missing token , username , change or change value headers'
        });
    }

    // check if token is valid
    let passDB = readPassDB();
    
    if (!passDB[username]) {	
        console.info(`[-] ${req.hostname} tried to login with an invalid username`);
        return res.status(406).json({
            error: 'Invalid username or token!'
        });
    }

    const hashedPassword = passDB[username];
    
    // generate our waaayyyy to secure token
    let tokenGen1 = sha256Hash(encrypt(sha256Hash(encrypt(encrypt(sha256Hash(encrypt(username)))) + encrypt(sha256Hash(encrypt(hashedPassword))))) + encrypt(sha256Hash(encrypt(encrypt(sha256Hash(encrypt(username)))) + encrypt(sha256Hash(encrypt(hashedPassword))))))
    let tokenGen2 = sha256Hash(encrypt(sha256Hash(encrypt(encrypt(sha256Hash(encrypt(hashedPassword)))) + encrypt(sha256Hash(encrypt(username))))) + encrypt(sha256Hash(encrypt(encrypt(sha256Hash(encrypt(hashedPassword)))) + encrypt(sha256Hash(encrypt(username))))))
    const ourToken = sha256Hash(encrypt(encrypt(sha256Hash(encrypt(tokenGen1 + tokenGen2))) + encrypt(sha256Hash(encrypt(tokenGen2 + tokenGen1)))))
    
    delete hashedPassword;

    if (ourToken !== token) {	
        console.info(`[-] ${req.hostname} tried to login with an invalid token`);
        return res.status(406).json({
            error: 'Invalid username or token!'
        });
    }

    delete passDB;
    delete ourToken;
    delete token;

    // Check if the change request is valid
    if (!changeList.includes(change)) {
        return res.status(406).json({
            error: "Invalid change request"
        });
    }
    
    // Handle the change request
    if (change == "avatar") {
        infoDB = readInfoDB();
        infoDB[username].avatar = changeValue;
        fs.writeFileSync(path.resolve(__dirname, 'databases/info.json'), JSON.stringify(infoDB, null, 2));
        return res.status(200).json({
            message: "Success!"
        });
    } else if (change == "flag") {
        if (!flagList.includes(changeValue)) {
            return res.status(406).json({
                error: "Invalid flag request"
            });
        }

        infoDB = readInfoDB();
        infoDB[username].flag = changeValue;
        fs.writeFileSync(path.resolve(__dirname, 'databases/info.json'), JSON.stringify(infoDB, null, 2));
        return res.status(200).json({
            message: "Success!"
        });
    } else if (change == "username") {
        infoDB = readInfoDB();
        infoDB[changeValue] = infoDB[username];
        delete infoDB[username]
        fs.writeFileSync(path.resolve(__dirname, 'databases/info.json'), JSON.stringify(infoDB, null, 2));
        passDB = readPassDB();
        passDB[changeValue] = passDB[username];
        delete passDB[username]
        fs.writeFileSync(path.resolve(__dirname, 'databases/passwords.json'), JSON.stringify(passDB, null, 2));
        return res.status(200).json({
            message: "Success!"
        });
    } else if (change == "password") {
        passDB = readPassDB();
        passDB[username] = encrypt(sha256Hash(changeValue));
        fs.writeFileSync(path.resolve(__dirname, 'databases/passwords.json'), JSON.stringify(passDB, null, 2));
        return res.status(200).json({
            message: "Success!"
        });
    }
});

// read endpoint
app.get('/read', (req, res) => {
    const token = req.headers.token;
    const username = req.headers.username;

    // check for headers
    if (!token || !username) {
        return res.status(400).json({
            error: 'Missing token or username headers'
        });
    }

    // check if token is valid
    let passDB = readPassDB();
    
    if (!passDB[username]) {	
        console.info(`[-] ${req.hostname} tried to login with an invalid username`);
        return res.status(406).json({
            error: 'Invalid username or token!'
        });
    }

    const password = passDB[username];
    const hashedPassword = passDB[username];
    
    // generate our waaayyyy to secure token
    let ourToken = generateToken(username, hashedPassword)
    delete password;

    if (ourToken !== token) {	
        console.info(`[-] ${req.hostname} tried to login with an invalid token`);
        return res.status(406).json({
            error: 'Invalid username or token!'
        });
    }

    delete passDB;
    delete ourToken;
    delete token;

    let infoDB = readInfoDB();
    res.status(200).json(infoDB[username]);
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});

function generateToken(username, hashedPassword) {
    let tokenGen1 = sha256Hash(encrypt(sha256Hash(encrypt(encrypt(sha256Hash(encrypt(username)))) + encrypt(sha256Hash(encrypt(hashedPassword))))) + encrypt(sha256Hash(encrypt(encrypt(sha256Hash(encrypt(username)))) + encrypt(sha256Hash(encrypt(hashedPassword))))))
    let tokenGen2 = sha256Hash(encrypt(sha256Hash(encrypt(encrypt(sha256Hash(encrypt(hashedPassword)))) + encrypt(sha256Hash(encrypt(username))))) + encrypt(sha256Hash(encrypt(encrypt(sha256Hash(encrypt(hashedPassword)))) + encrypt(sha256Hash(encrypt(username))))))
    return sha256Hash(encrypt(encrypt(sha256Hash(encrypt(tokenGen1 + tokenGen2))) + encrypt(sha256Hash(encrypt(tokenGen2 + tokenGen1)))))
}
// hasing and encoding
function sha256Hash(data) {
    const hash = crypto.createHash('sha256');
    hash.update(data);
    return hash.digest('hex');
}
function decodeBase64(base64String) {
    return Buffer.from(base64String, 'base64');
}

// aes encrypt and decrypt
function encrypt(text) {
    const key = decodeBase64(process.env.AES_KEY);
    const iv = decodeBase64(process.env.AES_IV);
    const cipher = crypto.createCipheriv(process.env.ALG, key, iv);
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    return encrypted;
}
function decrypt(encrypted) {
    const key = decodeBase64(process.env.AES_KEY);
    const iv = decodeBase64(process.env.AES_IV);
    const decipher = crypto.createDecipheriv(process.env.ALG, key, iv);
    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
}

// read databases
function readInfoDB() {
    const data = fs.readFileSync('databases/info.json', 'utf-8');
    return JSON.parse(data);
}
function readPassDB() {
    const data = fs.readFileSync(path.resolve(__dirname, 'databases/passwords.json'), 'utf8');
    return JSON.parse(data);
}
function saveDBs(passDB, infoDB) {
    fs.writeFileSync(path.resolve(__dirname, 'databases/passwords.json'), JSON.stringify(passDB, null, 2));
    fs.writeFileSync(path.resolve(__dirname, 'databases/info.json'), JSON.stringify(infoDB, null, 2));
}