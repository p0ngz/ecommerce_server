const usernameRegex = /^[A-Za-z0-9_]+$/;
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const passwordRegex = /.{5,8}/;
module.exports = { usernameRegex, emailRegex, passwordRegex };
