var express = require('express');
var router = express.Router();

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.render('gamePage', { title: 'Tower Defense' });
});

router.get('/:any', function(req, res, next) {
  res.render('gamePage', { title: 'Tower Defense' });
});


module.exports = router;
