const express = require('express');
const bcrypt = require('bcryptjs');
const User = require('../users/users-model');
const router = express.Router();
const middleware = require('../middleware/middleware')

router.post('/register', middleware.checkPayload, middleware.checkUsernameUnique, async (req, res) => {
    console.log('registering')
    try {
        // needs req.body to include username, password
        // username must not be in the db already
        // need to hash the password (can't save the password raw in the db)
        const hash = bcrypt.hashSync(req.body.password, 10) // 2 ^ 10
        // create a new record in the db
        const newUser = await User.add({ username: req.body.username, password: hash });
        // send back appropriate code and response body
        res.status(201).json(newUser);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

router.post('/login', middleware.checkPayload, middleware.checkUsernameExists, (req, res) => {
    try {
        console.log('logging in');
        // check req.body.password (raw password) against the hash saved inside req.userData.password
        const verifies = bcrypt.compareSync(req.body.password, req.userData.password)
        if (verifies) {
            console.log('we should save a session for this user');
            // HERE IS THE MAGIC!!!!!!!!
            // A SET-COOKIE HEADER IS SET ON THE RESPONSE
            // AN ACTIVE SESSION FOR THIS USER IS SAVED
            req.session.user = req.userData
            res.json(`Welcome back, ${req.userData.username}`)
        } else {
            res.status(401).json('You shall not pass!')
        }
    } catch (error) {
        res.status(500).json('something terrible happened')
    }
});

router.get('/logout', (req, res) => {
    if (req.session) {
        req.session.destroy(error => {
            if (error) {
                res.json('you cannot leave');
            } else {
                res.json('goodbye');
            }
        })
    } else {
        res.json('ther was no session');
    }
})

module.exports = router;
