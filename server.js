const Express = require("express");
const BodyParser = require('body-parser');
const cors = require("cors");

const server = Express();

server.use(BodyParser.json());
server.use(BodyParser.urlencoded({ extended: true }));
server.use(cors());

var port = process.env.PORT || 3000;

const signin = require("./API/signin");
const signup = require("./API/signup");
const findlevels = require("./API/findlevels");
const uploadlevel = require("./API/uploadlevel");

server.listen(port, async() => {
  try {
      console.log("Listening at :" + port + "...");
  } catch (e) {
      console.error(e);
  }
});

server.use("/signin", signin);
server.use("/signup", signup);
server.use("/findlevels", findlevels);
server.use("/uploadlevel", uploadlevel);