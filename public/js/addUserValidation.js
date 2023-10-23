function validate(){

    const email = document.getElementById('email');
    const password = document.getElementById('password');


    const emailError = document.getElementById('emailError');
    const passwordError = document.getElementById('passwordError');


    const emailRegex = /^[a-zA-Z0-9._%+-]+@gmail+\.[a-zA-Z]{3}$/;
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;


    if (email.value.trim() === '') {
        emailError.innerHTML = 'Email is required'
        setTimeout(() => {
           emailError.innerHTML = ''
        }, 5000)
        return false;
     }


     if (password.value.trim() === '') {
        passwordError.innerHTML = 'Password is required'
        setTimeout(() => {
           passwordError.innerHTML = ''
        }, 5000)
        return false;
     }

     return true;


}