function addToCart(productId){
    $.ajax({
      url:'/add-to-carts/'+ productId,
      method:'get',
      success:(response)=>{
        alert(response.status)
        if(response.status){
            let count=parseInt($('#cart-count').html());
            count++;
            $("#cart-count").html(count)

        }
      },
      error: function(err) {
        console.error('Error adding product to cart:', err);
    }
    
    })
  }