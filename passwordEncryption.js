const bcrypt = require('bcrypt');
const saltRounds = 10;
const plainTextPassword = 'password123';

bcrypt.hash(plainTextPassword, saltRounds, function(err, hash) {
    if (err) {
        console.error('Error hashing password:', err);
    } else {
        console.log('Hashed password:', hash);
        // Use this hashed password to update your database
    }
});
