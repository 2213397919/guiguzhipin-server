const express = require('express');
const Users = require('../modles/users')
const md5 = require('blueimp-md5');
const router = new express.Router();

//解析请求体参数。
router.use(express.urlencoded({extends:true}))
//注册路由
router.post('/register',async (req,res)=>{
    const {username,password,type} = req.body;
    try {
        const user = await Users.findOne({username});
        if (user){
            res.json({
                code : 1,
                msg: '此用户已经存在'
            })
        }else{
                const user = await Users.create({username,password:md5(password),type});
                res.json({
                    code:0,
                    data: {
                        username: user.username,
                        _id: user.id,
                        type: user.type
                    }
                })
        }
    }catch (e) {
        console.log(e);
        res.json({
            code : 2,
            msg: '网络不稳定，请刷新试试'
        })
    }
})
//登录路由
router.post('/login',async (req,res)=>{
    //从请求体参数里读取值
    const {username,password} = req.body;
    try {
        //去数据库查找当前用户是否存在
        const user = await Users.findOne({username,password:md5(password)});
        if (user){
            //用户可登录，登录成功
            res.json({
                code:0,
                data: {
                    username: user.username,
                    _id: user.id,
                    type: user.type
                }
            })
        }else {
            res.json({
                code:1,
                msg: '账户或密码错误'
            })
        }
    }catch(e){
        console.log(e);
        res.json({
            code: 2,
            msg: '网络不稳定，请刷新试试~'
        })
    }
})
module.exports = router;