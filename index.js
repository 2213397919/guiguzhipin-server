//引入express
const express = require('express');
const router = require('./router/router');
const db = require('./db');

const app = express();

(async ()=>{
    await db;
    app.use(router);
})();

//监听端口
app.listen(4000,err=>{
    if (!err){
        console.log('服务器开启');
    } else {
        console.log(err);
    }
})