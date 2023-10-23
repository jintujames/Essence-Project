function validate(){
    const productName = document.getElementById('productName');
    const description = document.getElementById('description');
    const brandName = document.getElementById('brandName');
    const quantity = document.getElementById('quantity');
    const category = document.getElementById('category');
    const regularPrice = document.getElementById('regularPrice');
    const salePrice = document.getElementById('salePrice');
    const images = document.getElementById('images');

    const productNameError = document.getElementById('productNameError');
    const descriptionError = document.getElementById('descriptionError');
    const brandNameError = document.getElementById('brandNameError');
    const quantityError = document.getElementById('quantityError');
    const categoryError = document.getElementById('categoryError');
    const regularPriceError = document.getElementById('regularPriceError');
    const salePriceError = document.getElementById('salePriceError');
    const imagesError = document.getElementById('imagesError');

    const quantityValue = quantity.value;
    const regularPriceValue = regularPrice.value;
    const salePriceValue = salePrice.value;

    if(productName.value.trim() === ''){
        productNameError.innerHTML = 'Product Name is required'
        productNameError.style.color = 'red';
        setTimeout(() => {
        productNameError.innerHTML = ''
        }, 5000)
        return false;
    }
    
    if(description.value.trim() === ''){
        descriptionError.innerHTML = 'Description is required'
        descriptionError.style.color = 'red';
        setTimeout(() => {
        descriptionError.innerHTML = ''
        }, 5000)
        return false;
    }

    if(brandName.value.trim() === ''){
        brandNameError.innerHTML = 'Brand Name is required'
        brandNameError.style.color = 'red';
        setTimeout(() => {
        brandNameError.innerHTML = ''
        }, 5000)
        return false;
    }

    if(category.value.trim() === ''){
        categoryError.innerHTML = 'Category is required'
        categoryError.style.color = 'red';
        setTimeout(() => {
        categoryError.innerHTML = ''
        }, 5000)
        return false;
    }

    if(quantity.value.trim() === ''){
        quantityError.innerHTML = 'Quantity is required'
        quantityError.style.color = 'red';
        setTimeout(() => {
        quantityError.innerHTML = ''
        }, 5000)
        return false;
    }

    if(!(/^\d+$/.test(quantityValue)) || parseInt(quantityValue) <= 0){
        quantityError.innerHTML = 'It should be a Positive Number'
        quantityError.style.color = 'red';
        setTimeout(() => {
        quantityError.innerHTML = ''
        }, 5000)
        return false;
    }

    if(regularPrice.value.trim() === ''){
        regularPriceError.innerHTML = 'Regular Price is required'
        regularPriceError.style.color = 'red';
        setTimeout(() => {
        regularPriceError.innerHTML = ''
        }, 5000)
        return false;
    }

    if(!(/^\d+$/.test(regularPriceValue)) || parseInt(regularPriceValue) <= 0){
        regularPriceError.innerHTML = 'It should be a Positive Number'
        regularPriceError.style.color = 'red';
        setTimeout(() => {
        regularPriceError.innerHTML = ''
        }, 5000)
        return false;
    }

    if(salePrice.value.trim() === ''){
        salePriceError.innerHTML = 'Sale Price is required'
        salePriceError.style.color = 'red';
        setTimeout(() => {
            salePriceError.innerHTML = ''
        }, 5000)
        return false;
    }

    if(!(/^\d+$/.test(salePriceValue)) || parseInt(salePriceValue) <= 0){
        salePriceError.innerHTML = 'It should be a Positive Number'
        salePriceError.style.color = 'red';
        setTimeout(() => {
        salePriceError.innerHTML = ''
        }, 5000)
        return false;
    }

    if (salePrice.value >= regularPrice.value) {
        salePriceError.innerHTML = 'Sale Price should be lesser than Regular Price';
        salePriceError.style.color = 'red';
        setTimeout(() => {
            salePriceError.innerHTML = '';
        }, 5000);
        return false;
    }

    if(images.files.length === 0){
        imagesError.innerHTML = 'Image is required'
        imagesError.style.color = 'red';
        setTimeout(() => {
        imagesError.innerHTML = ''
        }, 5000)
        return false;
    }

    if(images.files.length === 0 || images.files.length > 3){
        imagesError.innerHTML = 'Only 3 Images is allowed'
        imagesError.style.color = 'red';
        setTimeout(() => {
        imagesError.innerHTML = ''
        }, 5000)
        return false;
    }

    return true;

}