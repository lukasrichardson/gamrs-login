const express = require('express');
const router = express.Router();

// router.get('/callback', (req, res) => {
//   console.log('callback:', req, req.userContext);
//   res.send('callback');
// })
// router.get('/callback', (req, res) => {
//   const { userContext } = req;
//   res.render('index', { userContext });
// });
router.get('/', (req, res) => {
  const { userContext } = req;
  res.render('index', { userContext });
});


module.exports = router;