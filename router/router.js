const express = require('express');
const Users = require('../modles/users');
const Messages = require('../modles/message')
const cookiesParser = require('cookie-parser')
const md5 = require('blueimp-md5');
const router = new express.Router();

//解析请求体参数。
router.use(express.urlencoded({extends:true}))
router.use(cookiesParser());
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
            //响应一个cookies,保存在本地
                res.cookie('userid',user.id,{maxAge:1000*3600*24*7});
                res.json({
                    code:0,
                    data: {
                        username: user.username,
                        _id: user.id,
                        type: user.type,
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
            //响应一个cookies,保存在本地
            res.cookie('userid',user.id,{maxAge:1000*3600*24*7});
            //用户可登录，登录成功
            res.json({
                code:0,
                data: {
                    username: user.username,
                    _id: user.id,
                    type: user.type,
                    header:user.header,
                    post :user.post,
                    company :user.company,
                    salary:user.salary,
                    info:user.info
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
//保存个人信息路由
router.post('/update', (req, res) => {
        // 从请求的cookie得到userid
        const userid = req.cookies.userid
        console.log(userid);
        // 如果不存在, 直接返回一个提示信息
        if (!userid) {
            return res.json({code: 1, msg: '请先登陆'});
        }
        // 存在, 根据userid更新对应的user文档数据
        // 得到提交的用户数据
        const user = req.body // 没有_id
        Users.findByIdAndUpdate({_id: userid}, {$set: user})
            .then(oldUser => {
                if (!oldUser) {
                    //更新数据失败
                    // 通知浏览器删除userid cookie
                    res.clearCookie('userid');
                    // 返回返回一个提示信息
                    res.json({code: 1, msg: '请先登陆'});
                } else {
                    //更新数据成功
                    // 准备一个返回的user数据对象
                    const {_id, username, type} = oldUser;
                    console.log(oldUser);
                    //此对象有所有的数据
                    const data = Object.assign({_id, username, type}, user)
                    // 返回成功的响应
                    res.json({code: 0, data})
                }
            })
            .catch(error => {
                // console.error('登陆异常', error)
                res.send({code: 2, msg: '网络不稳定，请重新试试~'})
            })
    })
// 获取用户信息的路由(根据cookie中的userid)
router.get('/user', (req, res) => {
    // 从请求的cookie得到userid
    const userid = req.cookies.userid
    // 如果不存在, 直接返回一个提示信息
    if (!userid) {
        return res.send({code: 1, msg: '请先登陆'})
    }
    // 根据userid查询对应的user
    Users.findOne({_id: userid}, {__v: 0, password: 0})
        .then(user => {
            if (user) {
                res.send({code: 0, data: user})
            } else {
                // 通知浏览器删除userid cookie
                res.clearCookie('userid')
                res.send({code: 1, msg: '请先登陆'})
            }
        })
        .catch(error => {
            console.error('获取用户异常', error)
            res.send({code: 1, msg: '获取用户异常, 请重新尝试'})
        })
})
// 获取用户列表(根据类型)
router.get('/userList', (req, res) => {
    const {type} = req.query
    Users.find({type}, {__v: 0, password: 0})
        .then(users => {
            res.send({code: 0, data: users})
        })
        .catch(error => {
            console.error('获取用户列表异常', error)
            res.send({code: 1, msg: '获取用户列表异常, 请重新尝试'})
        })
})
/*
获取当前用户所有相关聊天信息列表
 */
router.get('/msglist', (req, res) => {
    // 获取cookie中的userid
    const userid = req.cookies.userid

    let users;
    // 查询得到所有user文档数组
    Users.find()
        .then(userDocs => {
            // 用对象存储所有user信息: key为user的_id, val为name和header组成的user对象
            users = userDocs.reduce((prev, curr) => {
                prev[curr._id] = {username: curr.username, header: curr.header}
                return prev
            }, {})
            /*
            查询userid相关的所有聊天信息
             参数1: 查询条件
             参数2: 过滤条件
             参数3: 回调函数
            */
            return Messages.find({'$or': [{from: userid}, {to: userid}]}, {__v: 0, password: 0})
        })
        .then(chatMsgs => {
            // 返回包含所有用户和当前用户相关的所有聊天消息的数据
            res.send({code: 0, data: {users, chatMsgs}})
        })
        .catch(error => {
            console.error('获取消息列表异常', error)
            res.send({code: 1, msg: '获取消息列表异常, 请重新尝试'})
        })
})
router.post('/readmsg',(req,res)=>{
//    得到请求中的from和to
    const from = req.body.from;
    const to =  req.cookies.userid;
    Messages.update({from,to,read:false},{$set:{read:true}},{multi:true})
        .then(doc=>{
            console.log('/readmsg',doc);
            //更新的数量
            res.send({code:0,data:doc.nModified})
        })
        .catch(error=>{
            console.log("查看消息列表异常",error);
            res.send({code:1,msg:"网络异常，请重新试试"})
        })
})
module.exports = router;