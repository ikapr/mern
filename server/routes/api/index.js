const router = require('express').Router();
const userRoutes = require('./user-routes');

router.route(`/`).get((req, res) => {
  res.send(`Google Books API`);
});

router.use('/users', userRoutes);

module.exports = router;