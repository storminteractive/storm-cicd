const { exec, execSync } = require("child_process");
const express = require('express');
const https = require('https');
const morgan = require('morgan');
const fs = require('fs');
const validator = require('validator');
const nl2br  = require('nl2br');

const app = express();
const port = process.env.PORT || 4000;
app.use(morgan('combined'));

const updateCi = "/root/scripts/refresh-cicd.sh";
const updateZone = "/root/scripts/refresh-zone-update.sh";
const logsCmd = "/usr/bin/pm2 logs --lines 200 --nostream"

const ex = (cmd,cb) =>{
    exec(cmd, (error, stdout, stderr) => {
        if (error) {
            console.log(`Error: ${error.message}`);
        }
        if (stderr) {
            console.log(`Stderr: ${stderr}`);
        }
        console.log(`Success: ${stdout}`);
        if (cb) return cb();
        else return true;
    });
}

const exRet = (cmd) => {
    return execSync(cmd).toString();
}

const lettersNumbers = (str) => {
    let reg = /^[0-9a-zA-Z\-]+$/;
    return(str.match(reg));
}

app.all('/update/:app/', (req,res)=>{
    let app = req.params.app;
    if(!lettersNumbers(app)) {res.send("Invalid app name"); console.log("Invalid app name"); return; }
    res.send(`Received an update for an app ${app}`);
    console.log("Will update app "+app);
    if(app==="cicd") ex(updateCi);
    if(app==="zone") ex(updateZone);
})

app.get('/logs',(req,res)=>{
    let r = exRet(logsCmd);
    res.send(nl2br(r));
})

app.all('*', (req,res)=>{
    res.send(`Welcome to Storm CICD server - update cicd zone v2 or logs`);
})

https.createServer({
    key: fs.readFileSync(__dirname+'/ssl.key'),
    cert: fs.readFileSync(__dirname+'/ssl.crt')
}, app).listen(port,()=>{
    console.log("Listening on port "+port);
});
