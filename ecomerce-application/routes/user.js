var express = require('express');
var router = express.Router();
var productHelper=require('../helpers/product-helpers')
var userHelper=require('../helpers/user-helpers')

const verifyLogin=(req,res,next)=>{
  if(req.session.loggedIn){
    next()
  }else{
    res.redirect('/login')
  }
}
/* GET home page. */
router.get('/',async function(req, res, next){
  let user=req.session.user
  let cartCount =null
  if(req.session.user){
   cartCount = await userHelper.getCartCount(req.session.user._id)
}
  productHelper.getAllProducts().then((products)=>{
    console.log( cartCount)
    res.render('user/view-products',{products,user,cartCount});
  })
 
  
  //res.render('index',{products,admin:false});
});
router.get('/login',(req,res)=>{
  if(req.session.loggedIn){
    res.redirect('/')
  }else{
  res.render('user/login',{"loginErr":req.session.loginErr})
  req.session.loginErr=false
  }
})
router.get('/signup',(req,res)=>{
  res.render('user/signup')
})
router.post('/signup',(req,res)=>{
  userHelper.dosingup(req.body).then((response)=>{
    console.log(response);
    console.log('User entered data:', req.body);
    req.sess .logged.In=true
    req.session.user=response

    res.redirect('/login'); 
  })

})
router.post('/login',(req,res)=>{
  userHelper.doLogin(req.body).then((response)=>{
    if(response.status){
      req.session.loggedIn=true
      req.session.user=response.user
      
      res.redirect('/')
    }else{
      req.session.loginErr=true
      res.redirect('/login')
    }
  })
})


router.get('/logout',(req,res)=>{
  req.session.destroy()
  res.redirect('/')
})

router.get('/carts', verifyLogin, async (req, res) => {
  try {
    let products = await userHelper.getCartProducts(req.session.user._id);
    let totalAmount = await userHelper.getTotalAmount(req.session.user._id); // Call updated getTotalAmount
    res.render('user/carts', { products, totalAmount });
  } catch (error) {
    console.error('Error fetching cart details or calculating total:', error);
    // Handle error appropriately for the user (e.g., display an error message)
    res.render('user/carts', { error: 'Error fetching cart details' }); // Example error rendering
  }
});



router.get('/add-to-carts/:id',async(req,res)=>{
  console.log(req.params.id)
  let user=req.session.user
  let cartCount =null
  if(req.session.user){
   cartCount = await userHelper.getCartCount(req.session.user._id)
}
  userHelper.addToCart(req.params.id,req.session.user._id,cartCount).then(()=>{
   // res.redirect('/')
   res.json({status:true})
  })

})

router.post('/change-product-quantity/:id', (req,res,next)=>{
  console.log('Request Body:', req.body);
  
  userHelper.changeProductQuantity(req.body).then(async(response)=>{
   response.total=await userHelper.getTotalAmount(req.body.user)
   console.log('Response:', response);
    res.json(response)

  })

})

router.post('/user/delete/:cartId', async function (req, res) {
  let cartId = req.params.cartId;
  let productId = req.body.productId; // Access product ID from request body
  console.log('Cart ID:', cartId);
  console.log('Product ID:', productId);
  try {
    await userHelper.deleteProduct(cartId, productId);
    res.redirect('/carts');
  } catch (err) {
    console.error('Error deleting product:', err);
    // Handle error appropriately, e.g., display an error message to the user
  }
});







router.get('/place-order',verifyLogin,async( req,res)=>{
  //et total=await userHelper.getTotalAmount(req.session.user._id)
  res.render('user/place-order')
})
router.get('/pay',(req,res)=>{
  res.render('user/pay')
})







 

module.exports = router;
