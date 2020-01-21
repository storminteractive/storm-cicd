const { exec } = require("child_process");
const express = require('express');
const https = require('https');
const morgan = require('morgan');
const fs = require('fs');
const validator = require('validator');

const app = express();
const port = process.env.PORT || 4000;
app.use(morgan('combined'));

const updateCi = "/root/scripts/refresh-cicd.sh";
const updateZone = "/root/scripts/refresh-zone-update.sh";

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
    exec(cmd, (error, stdout, stderr) => {
        r = "";
        if (error) {
            r = r+"Error: "+error.message+"\n================\n";
        }
        if (stderr) {
            r = r+"Stderr: "+stderr+"\n================\n";
        }
        r = r+stdout;
        return r;
    });
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
    res.send(exRet("pm2 logs --lines 100 --nostream cicd"));
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
