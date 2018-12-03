const mongoose = require('mongoose');
//暴露模块
module.exports = new Promise((resolve,reject) =>{
    mongoose.connect('mongodb://localhost:27017/guiguzhipin',{useNewUrlParser: true});
    mongoose.connection.once('open',err=>{
        if (!err){
            console.log('数据库连接成功');
            resolve();
        } else {
            reject(err)
        }
    })
})