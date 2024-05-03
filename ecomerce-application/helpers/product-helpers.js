var db=require('../config/connection')
var collection =require('../config/collection')
const path = require('path');
const { ObjectId } = require('mongodb');

module.exports={
    addProduct:(product,callback)=>{
        console.log(product);
        db.get().collection('product').insertOne(product)
        .then((data)=>{
            console.log(data);
            //callback(data)
            const insertedId = data.insertedId.toString(); // Convert ObjectId to string
            callback(insertedId);
        })
        .catch(err => {
            console.error('Error adding product:', err);
            callback(null); // Call the callback with null to indicate an error
          });
      },
      getAllProducts:()=>{
        return new Promise(async(resolve,reject)=>{
            let products=await db.get().collection(collection.PRODUCT_COLLECTION).find().toArray()
            resolve(products)
        })
      },
      // product-helpers.js
      deleteProduct: (productId) => {
       return new Promise((resolve, reject) => {
        db.get()
       .collection(collection.PRODUCT_COLLECTION)
        .deleteOne({ _id: ObjectId(productId) })
        .then(() => resolve())
        .catch((err) => reject(err));
  });
},
    getProductDetails:(productId)=>{
        return new Promise((resolve,reject)=>{
            db.get().collection(collection.PRODUCT_COLLECTION).findOne({_id:ObjectId(productId)}).then((product)=>{
                resolve(product)
            })
        })
    },  
        updateProduct:(productId,proDetails)=>{
            return new Promise((resolve,reject)=>{
                db.get().collection(collection.PRODUCT_COLLECTION)
                .updateOne({_id:ObjectId(productId)},
                {$set:{
                    name:proDetails.name,
                    price:proDetails.price,
                    category:proDetails.category,
                    Description:proDetails.Description
                }
            }).then((resonse)=>{
                resolve()
            })
            })
        }

    }
    
