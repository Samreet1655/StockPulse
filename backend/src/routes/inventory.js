const r=require('express').Router();const {protect,restrictTo}=require('../middleware/auth');const h=require('../middleware/asyncHandler');const c=require('../controllers/inventoryController');
const a=h(c);r.use(protect,restrictTo('admin'));r.get('/summary',a.summary);r.get('/low-stock',a.lowStock);r.get('/products',a.adminProducts);r.patch('/:id/stock',a.setStock);
module.exports=r;
