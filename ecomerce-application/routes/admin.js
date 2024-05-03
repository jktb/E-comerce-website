var express = require('express');
var router = express.Router();
var productHelper=require('../helpers/product-helpers')

/* GET users listing. */
router.get('/', function(req, res, next) {
  productHelper.getAllProducts().then((products)=>{
    console.log(products)
    res.render('admin/view-products',{admin:true, products});
  })
 
  
  
  
});

router.get('/add-products',function(req,res){
  res.render('admin/add-products')


})

router.post('/add-products',(req,res)=>{
 // console.log('Request body:', req.body);
 // console.log('Uploaded file:', req.files.image);
  
  productHelper.addProduct(req.body,(insertedId)=>{
    //const id = result; // Assuming result contains the inserted product ID
    //const uploadPath = path.join(__dirname, '../public/product-images', id + '.jpg');
    let Image=req.files.image
    Image.mv('/home/jayakrishnan/ecomerce application/ecomerceApp/public/product-images/'+insertedId+'.jpg',(err,done)=>{
      if(!err){
       res.redirect('/admin')

      }else{
        console.log(err)
             }
                 })
   // res.render('admin/add-products')
    //image.mv(uploadPath, (err) => {
      //if (err) {
        //console.error('Error uploading image:', err);
        // Handle error
       // res.send('Error uploading image');
      //} else {
        //console.log('Image uploaded successfully');
        //res.redirect('/admin/add-products');
      //}
    //})
  })

});

// admin.js
router.post('/delete', async function (req, res) {
  const productId = req.body.product; // Access product ID from request body
  try {
    await productHelper.deleteProduct(productId);
    res.redirect('/admin'); // Redirect back to admin page after deletion
  } catch (err) {
    console.error('Error deleting product:', err);
    // Handle error appropriately, e.g., display an error message to the user
  }
});



router.get('/edit-products/:id', async(req,res) =>{
  
    let product = await productHelper.getProductDetails( req.params.id);
    console.log(product);
     // Check if product exists
    res.render('admin/edit-products',{product}); // Render page with product data
    

});

  router.post('/edit-products/:id',(req,res)=>{
    console.log(req.params.id);
    productHelper.updateProduct(req.params.id,req.body).then(()=>{
      res.redirect('/admin')
      
      if(req.files.image){
        let Image=req.files.image
        let id=req.params.id
        Image.mv('./public/product-images/'+id+'.jpg')
      }
    })
  })


 






module.exports = router;
