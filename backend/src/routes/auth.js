const r=require('express').Router();const {protect,restrictTo}=require('../middleware/auth');const h=require('../middleware/asyncHandler');const c=require('../controllers/authController');
const a=h(c);r.post('/register',a.register);r.post('/login',a.login);r.get('/me',protect,a.me);
module.exports=r;
