var express = require('express');
var router = express.Router();

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.render('gamePage', { title: 'Tower Defense', gameNumber: 1 });
});

router.get('/:gameNumber', function(req, res, next) {
  var gameNumber = req.params.gameNumber;
  res.render('gamePage', { title: 'Tower Defense', gameNumber: gameNumber });
});


module.exports = router;
