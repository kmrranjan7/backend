const router = require('express').Router();
const userDetailsRoutes = require('./user-details.routes');
const postRoutes = require('./post.routes');

router.use('/users', userDetailsRoutes);
router.use('/posts', postRoutes);

module.exports = router;
