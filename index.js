const { exec } = require("child_process");
const express = require('express');
const https = require('https');
const path = require('path');
const morgan = require('morgan');
const fs = require('fs');
const validator = require('validator');

const app = express();
const port = process.env.PORT || 4000;
//app.use(morgan('combined'));

const updateCommand = "/root/scripts/refresh-cicd.sh";

const ex = (cmd,cb) =>{
    exec(cmd, (error, stdout, stderr) => {
        if (error) {
            console.log(`Error: ${error.message}`);
            return false;
        }
        if (stderr) {
            console.log(`stderr: ${stderr}`);
            return false;
        }
        console.log(`Success: ${stdout}`);
        if (cb) return cb();
        else return true;
    });
}

const lettersNumbers = (str) => {
    let reg = /^[0-9a-zA-Z\-]+$/;
    return(str.match(reg));
}

app.get('/update/:app/', (req,res)=>{
    let app = req.params.app;
    if(!lettersNumbers(app)) {res.send("Invalid app name"); console.log("Invalid app name"); return; }
    res.send(`Received an update for an app ${app}`);
    console.log("Will update app "+app);
    ex(updateCommand);
})

app.get('*', (req,res)=>{
    res.send(`Welcome to Storm CICD server - update appname v2`);
})

https.createServer({
    key: fs.readFileSync(__dirname+'/ssl.key'),
    cert: fs.readFileSync(__dirname+'/ssl.crt')
}, app).listen(port,()=>{
    console.log("Listening on port "+port);
});
