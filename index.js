const { exec, execSync } = require("child_process");
const express = require('express');
const https = require('https');
const morgan = require('morgan');
const fs = require('fs');
const validator = require('validator');
const nl2br  = require('nl2br');
const chalk = require('chalk');

const app = express();
const port = 2005;
app.use(morgan('combined'));

let restartFrontend = "/apps/storm-cicd/refresh-frontend.sh";
let restartBackend = "/apps/storm-cicd/refresh-backend.sh";

const logsCmd = "/usr/bin/pm2 logs --nostream"
const defaultLines = "--lines 100";

const ex = (cmd,cb) =>{
    console.log(chalk.green("ex -> cmd", cmd));
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
    console.log(`TCL: exRet -> cmd`, cmd);
    return execSync(cmd).toString();
}

const lettersNumbers = (str) => {
    let reg = /^[0-9a-zA-Z\-]+$/;
    return(str.match(reg));
}

app.all('/update/:app/', (req,res)=>{
    let app = req.params.app;
    let remoteIp = req.socket.remoteAddress.replace(/^.*:/, '');
    
    if(!lettersNumbers(app)) {res.send("Invalid app name"); console.log("Invalid app name"); return; }
    
    res.send(`Received a requst for app ${app} from IP ${remoteIp}`);
    console.log(chalk.cyan(`Received a requst for app ${app} from IP ${remoteIp}`));

    if(app==="frontend-999") {
        console.log(chalk.yellow(`Will update app ${app}`));
	    ex(restartFrontend);
    }

    if(app==="backend-999") {
        console.log(chalk.yellow(`Will update app ${app}`));
        ex(restartBackend);
    }

})

/*
app.get('/logs',(req,res)=>{
    let r = "";
    if(!req.query.lines){
        r = exRet(logsCmd+" "+defaultLines);
    } else {
        if (!validator.isNumeric(req.query.lines)) {r = "Invalid num lines" }
        else { r = exRet(logsCmd+" --lines="+req.query.lines); }
    }
    
    res.send(nl2br(r));
})
*/

app.all('*', (req,res)=>{
    res.send(`Storm CICD server v1.2`);
})

https.createServer({
    key: fs.readFileSync(__dirname+'/ssl.key'),
    cert: fs.readFileSync(__dirname+'/ssl.crt')
}, app).listen(port,()=>{
    console.log("Listening on port "+port);
});
