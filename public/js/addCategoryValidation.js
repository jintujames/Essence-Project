function validate(){

    const category = document.getElementById('name');
    

    const categoryError = document.getElementById('categoryError');
   
    const categoryRegex = /^[A-Z]/;
    

    // Name Vlidation

    if (category.value.trim() === '') {
        categoryError.innerHTML = 'Category Name is required'
        categoryError.style.color = 'red'

        setTimeout(() => {
           nameError.innerHTML = ''
        }, 5000)
        return false;
     }
     if(!categoryRegex.test(category.value)){
        categoryError.innerHTML = ''
        setTimeout(()=>{
           categoryError.innerHTML = ''
        },5000)
        return false;
     }

   

}