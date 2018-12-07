//引入express
const express = require('express');
const router = require('./router/router');
const db = require('./db');
const app = express();

const http = require('http');
const server = http.createServer(app);
require('./socket/index')(server)
server.listen('5000', () => {
    console.log('socketio服务器启动成功, 请访问: http://localhost:5000')
});

(async ()=>{
    await db;
    app.use(router);
})();

//监听端口
app.listen(4000,err=>{
    if (!err){
        console.log('服务器开启4000');
    } else {
        console.log(err);
    }
})