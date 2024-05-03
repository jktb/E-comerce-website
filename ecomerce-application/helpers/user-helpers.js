var db=require('../config/connection')
var collection =require('../config/collection')
const path = require('path');
const mongodb = require('mongodb');
const { ObjectId } = require('mongodb');


const bcrypt=require( 'bcrypt');
const { response } = require('express');

module.exports={
    dosingup: (userData) => {
        return new Promise(async (resolve, reject) => {
            
                userData.password = await bcrypt.hash(userData.password, 10);
                db.get().collection(collection.USER_COLLECTION).insertOne(userData).then((data)=>{
                     
                    
                    const insertedId = data.insertedId.toString(); // Convert ObjectId to string
                    resolve(insertedId);
                })
                
        
             }) 
                
            
       
    },
   
    
    doLogin:(userData)=>{
        return new Promise(async(resolve,reject)=>{
            let loginStatus=false
            let response={}
            let user=await db.get().collection(collection.USER_COLLECTION).findOne({email:userData.email})
            if(user){
                bcrypt.compare(userData.password,user.password).then((status)=>{
                    if(status){
                        console.log("login success");
                        response.user=user
                        response.status=true
                        resolve(response)
                    }else{
                        console.log("login failed due to in valid pass")
                        resolve({status:false})
                    }
                })
            }else{
                console.log("login failed due to invalid user")
                resolve({status:false})
                
            }
        })
    },
    addToCart:(productId,userId)=>{
        let proObj={
            item:ObjectId(productId),
            quantity:1   
        
        }
        
        return new Promise(async(resolve,reject)=>{
            let userCart= await db.get().collection(collection.CART_COLLECTION).findOne({user:ObjectId(userId)})
            if(userCart){
                let proExist = userCart.products.findIndex(products=>products.item==productId)
                console.log(proExist)
                if(proExist!=-1){
                db.get().collection(collection.CART_COLLECTION)
                .updateOne({user:ObjectId(userId),'products.item':ObjectId(productId)},
                {
                    $inc:({'products.$.quantity':1})

                }
            ).then(()=>{
                    resolve()
            })
        }else{
            db.get().collection(collection.CART_COLLECTION)
                .updateOne({user:ObjectId(userId)},
        
                    {
                       
                         $push:{products:proObj}
                   
                
                }
                ).then((response)=>{
                    resolve()
                })

            }
        }else{
            let cartObj={
                user:ObjectId(userId),
                products:[proObj]
            }
            db.get().collection(collection.CART_COLLECTION).insertOne(cartObj).then((response)=>{
                resolve()
            })
        }
        })
    },
    getCartProducts:(userId)=>{
        return new Promise(async(resolve,reject)=>{
            let cartItems=await db.get().collection(collection.CART_COLLECTION).aggregate([
                {
                    $match:{user:ObjectId(userId)}
                },
                {
                    $unwind:'$products'
                },
                {
                    $project:{
                        item:'$products.item',
                        quantity:'$products.quantity'
                    },
                },
                {
                    $lookup:{
                        from:collection.PRODUCT_COLLECTION,
                        localField:'item',
                        foreignField:'_id',
                       
                        as:'products',

                    }
                },{

                    $project:{
                        item:1,
                        quantity:1,
                        products:{$arrayElemAt:['$products',0]}
                    }
                }
                
                
                // {
                //     $lookup:{
                //         from:collection.PRODUCT_COLLECTION,
                //         let:{proList:'$products'},
                //         pipeline:[
                //             {
                //                 $match:{
                //                     $expr:{
                //                         $in:['$_id',"$$proList"]
                //                     }
                //                 }
                //             }
                //         ],
                //         as:'cartItems'
                //     }
                // }
            ]).toArray()
            
            resolve(cartItems)
        })
    },
    getCartCount:(userId)=>{
        return new Promise(async(resolve,reject)=>{
            let count=0
            let cart=await db.get().collection(collection.CART_COLLECTION).findOne({user:ObjectId(userId)})
            if(cart){
                count=cart.products.length

            }
            resolve(count)
        })
    },
    // user-helpers.js

changeProductQuantity: (details) => {
    details.count = parseInt(details.count);
    details.quantity = parseInt(details.quantity);

    return new Promise((resolve, reject) => {
        if (details.count == -1 && details.quantity == 1) 
        {
            db.get().collection(collection.CART_COLLECTION)
                .updateOne({ _id: ObjectId(details.cart)
                 },
                    {
                        $pull: { products: { item: ObjectId(details.products) } }
                    }
                ).then((response) => {
                    resolve({ removeProduct: true });
                })
        } else {
            db.get().collection(collection.CART_COLLECTION)
                .updateOne({ _id: ObjectId(details.cart), 'products.item': ObjectId(details.products) },
                    {
                        $inc: { 'products.$.quantity': details.count }
                    }
                ).then((response) => {
                    resolve({ status: true });
                })
        }
    });
},
deleteProduct: (cartId, productId) => {
    return new Promise(async (resolve, reject) => {
        try {
            await db.get().collection(collection.CART_COLLECTION).updateOne(
                { _id: ObjectId(cartId) },
                { $pull: { products: { item: ObjectId(productId) } } }
            );
            resolve();
        } catch (error) {
            reject(error);
        }
    });
},
getTotalAmount: (userId) => {
    return new Promise(async (resolve, reject) => {
      try {
        let total = await db.get().collection(collection.CART_COLLECTION).aggregate([
          // ... other stages
          {
            $project: {
              item: 1,
              quantity: { $floor: { $toDouble: { input: "$quantity", to: "int" } } }, // Cast to int, then floor for whole number
              price: { $toDouble: "$price" } // Convert price to double
            }
          },
          {
            $group: {
              _id: null,
              total: { $sum: { $multiply: ["$price", "$quantity"] } }
            }
          }
        ]).toArray();
  
        resolve(total[0].total || 0);
      } catch (error) {
        reject(error);
      }
    });
  }
  

}