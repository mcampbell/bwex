const express = require('express');
const app = express();

/**
 * config stuff
 */
app.use(express.json()); // parse json bodies automatically


/**
 * Simple "ping" endpoint for health checkers to ensure app is up and running.
 * TODO: add (appropriate) code to check downstream resources and return THEIR statuses.
 */
app.get('/ping', (req, res, next) => {
    res.status(200).send("pong")
})

/**
 * "Meat" of the system.  Define our domain logic in a separate file(s) for ease of maintenance and logical
 * separation.
 */
app.use('/email', require('./email'))



app.listen(3000, () => {
    console.log(`started on port 3000`);
});
