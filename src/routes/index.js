const router = require('express').Router();
const userDetailsRoutes = require('./user-details.routes');
const postRoutes = require('./post.routes');
const postTypeListingRoutes = require('./post-type-listing.routes');
const authRoutes = require('./auth.routes');
const latestNewsRoutes = require('./latest-news.routes');

router.use('/auth', authRoutes);
router.use('/users', userDetailsRoutes);
router.use('/posts', postRoutes);
router.use('/jobs', postTypeListingRoutes);
router.use('/latest-news', latestNewsRoutes);

module.exports = router;
