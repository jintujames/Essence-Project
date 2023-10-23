function verifyValidate(){


    const password = document.getElementById('password');
    const cpassword = document.getElementById('cpassword');

    const passwordValue = password.value;
    const cpasswordValue = cpassword.value;

    const passwordError = document.getElementById('passwordError');
    const cpasswordError = document.getElementById('cpasswordError');

    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;



    //  Password Field

     if (password.value.trim() === '') {
        passwordError.innerHTML = 'Password is required'
        passwordError.style.color = 'red';
        setTimeout(() => {
           passwordError.innerHTML = ''
        }, 5000)
        return false;
     }
     if (!passwordRegex.test(password.value)) {
        passwordError.innerHTML = "Password must include 1 Capital Letter, 1 Small Letter, 1 Special Symbol, and I number, And it should be 8 letters"
        passwordError.style.color = 'red';
        setTimeout(() => {
           passwordError.innerHTML = ''
        }, 5000);
        return false;
     }

     if(passwordValue !== cpasswordValue){
        cpasswordError.innerHTML = 'Password Doesnt Match'
        cpasswordError.style.color = 'red';
        setTimeout(() => {
           passwordError.innerHTML = ''
        }, 5000)
        return false;
     }

     


}