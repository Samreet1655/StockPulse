const r=require('express').Router();const {protect,restrictTo}=require('../middleware/auth');const h=require('../middleware/asyncHandler');const c=require('../controllers/productController');
const a=h(c);const admin=[protect,restrictTo('admin')];r.get('/',a.list);r.get('/categories',a.categories);r.post('/',admin,a.create);r.put('/:id',admin,a.update);r.delete('/:id',admin,a.deactivate);r.get('/:idOrSlug',a.get);
module.exports=r;
