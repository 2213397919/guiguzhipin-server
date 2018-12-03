const express = require('express');
const router = new express.Router();
router.get('/',(req,res)=>{
    res.send('这里是服务器返回');
})
module.exports=router;