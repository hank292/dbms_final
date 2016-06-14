var express = require('express');
var router = express.Router();
var Member = require('../models/Member');
var Battery = require('../models/Battery');
var async = require('async');

router.get('/new', function(req, res) {
  if(!req.session.member) {
    res.redirect('/');
  }

  res.render('postBattery', {
    member : req.session.member || null
  });
});

router.get('/search', function(req, res, next) {
  Battery.getAll(function(err, batteryList) {
    if(err) {
      next();
    } else {
      //這邊的做法是使用async each這樣的方式幫我們從articleList中一筆筆去找到member，然後新增一個key叫member在article物件中
      async.each(batteryList, function(battery, cb) {
        Member.get(battery.memberId, function(err, member) {
          if(err) {
            cb(err);
          } else {
            battery.member = member;
            cb(null);
          }
        });
      }, function(err){
        if(err) {
          res.status = err.code;
          next();
        } else {
          res.render('batterySearch',
          {
            member : req.session.member || null,
            batteryList: batteryList
          });
        }
      });

    }
  });
});


//members test
router.get('/:batteryID', function(req, res, next) {
  Battery.get(req.params.batteryID, function(err, battery) {
    if(err) {
      console.log(err);
      next();
    } else {
      Member.get(battery.memberId, function(err, member) {
        if(err) {
          console.log(err);
        } else {
          battery.member = member;
          res.render('batteryDetail', {
            battery : battery,
            member : req.session.member || null
          });
        }
      })

    }
  });
});




router.post('/', function(req, res) {
  if(!req.session.member) {
    res.redirect('/');
  }

  var newBattery = new Battery({
    battery_name : req.body.battery_name,
    battery_price : req.body.battery_price,
    memberId : req.session.member.id
  });

  newBattery.save(function(err) {
    if(err) {
      res.status = err.code;
      res.json(err);
    } else {

      res.redirect("/");
    }
  });
});


module.exports = router;
