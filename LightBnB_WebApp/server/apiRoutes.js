module.exports = function(router, database) {

  router.get('/properties', (req, res) => {
    database.getAllProperties(req.query, 20)
    .then(properties => res.send({properties}))
    .catch(e => {
      console.error(e);
      res.send(e)
    }); 
  });

  router.get('/reservations', (req, res) => {
    const userId = req.session.userId;
    if (!userId) {
      res.error("💩");
      return;
    }
    database.getAllReservations(userId)
    .then(reservations => res.send({reservations}))
    .catch(e => {
      console.error(e);
      res.send(e)
    });
  });


  // extrastretch - get average cost_per_night of all entries in db
  router.get('/getaveragecostpernight', (req, res) => {
    database.getAverageCostPerNight(req.query, 300)
      .then(properties => res.send({properties}))
      .catch(e => {
        console.error(e);
        res.send(e);
      });
  });
  // extrastretch - get a list of all cities in our database
  router.get('/allcities', (req, res) => {
    database.getAllCities(req.query, 300)
      .then(properties => res.send({properties}))
      .catch(e => {
        console.error(e);
        res.send(e);
      });
  });
  // extrastretch - get a count of all listings per city
  router.get('/getcountbycity', (req, res) => {
    database.getCountbyCity(req.query, 300)
      .then(properties => res.send({properties}))
      .catch(e => {
        console.error(e);
        res.send(e);
      });
  });
    // extrastretch - get a count of listings by province
    router.get('/getcountbyprov', (req, res) => {
      database.getCountbyProv(req.query, 300)
        .then(properties => res.send({properties}))
        .catch(e => {
          console.error(e);
          res.send(e);
        });
    });

  router.post('/properties', (req, res) => {
    const userId = req.session.userId;
    database.addProperty({...req.body, owner_id: userId})
      .then(property => {
        res.send(property);
      })
      .catch(e => {
        console.error(e);
        res.send(e)
      });
  });

  return router;
}