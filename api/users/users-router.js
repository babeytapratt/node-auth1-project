const router = require('express').Router();
const middleware = require('../middleware/middleware');

const Users = require('./users-model');

router.get('/', middleware.restricted, (req, res) => {
    Users.find()
        .then(users => {
            res.status(200).json(users);
        })
        .catch(error => res.send(error));
})

module.exports = router;
