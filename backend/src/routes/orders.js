const r=require('express').Router();const {protect,restrictTo}=require('../middleware/auth');const h=require('../middleware/asyncHandler');const c=require('../controllers/orderController');
const a=h(c);r.use(protect);r.post('/',restrictTo('retailer'),a.create);r.get('/mine',a.mine);r.get('/',restrictTo('admin'),a.all);r.get('/:id',a.get);r.patch('/:id/status',restrictTo('admin'),a.setStatus);
module.exports=r;
