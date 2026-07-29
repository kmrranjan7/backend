const router = require('express').Router();
const userDetailsRoutes = require('./user-details.routes');

router.use('/users', userDetailsRoutes);

module.exports = router;
