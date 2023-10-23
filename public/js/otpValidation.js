
function validate() {
    const otp = document.getElementById('otp');
    const otpError = document.getElementById('otpError');
    const otpRegex = /^[0-9]{6}$/; // Assumes a 6-digit OTP

    if (otp.value.trim() === '') {
        otpError.innerHTML = 'OTP is required';
        setTimeout(() => {
            otpError.innerHTML = '';
        }, 5000);
        return false;
    }

    if (!otpRegex.test(otpInput.value)) {
        otpError.innerHTML = 'Invalid OTP format';
        setTimeout(() => {
            otpError.innerHTML = '';
        }, 5000);
        return false;
    }

    // If the OTP is valid, you can proceed with further actions here.
    alert('OTP is valid!');
}
