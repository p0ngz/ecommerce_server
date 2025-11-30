const usernameRegex = /^(?=.*[A-Z])[A-Za-z0-9]{5,10}$/;
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const passwordRegex = /.{5,8}/;

module.exports = { usernameRegex, emailRegex, passwordRegex };