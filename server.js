const { MongoClient, ObjectID } = require("mongodb");
const Express = require("express");
const BodyParser = require('body-parser');
const cors = require("cors");

const server = Express();

server.use(BodyParser.json());
server.use(BodyParser.urlencoded({ extended: true }));
server.use(cors());

console.log(process.env);
const client = new MongoClient(process.env.ATLAS_URI, { useUnifiedTopology: true });

var collection;

var port = process.env.PORT || 3000;

server.listen(port, async() => {
    try {
        await client.connect();
        collection = client.db("computron").collection("users");
        console.log("Listening at :" + port + "...");
    } catch (e) {
        console.error(e);
    }
});

server.post("/signin", async(request, response) => {
    try {
      console.log(request.body);
      var result = await collection.findOne({
        "user": request.body.username,
        "pass": request.body.password
      });
      if (result == null)
        response.send({
          result: null,
          error: true,
          message: "Invalid username or password"
        });
      else
        response.send({
          result: result,
          error: false,
          message: "Welcome back, " + result.user + "!"
        });
    }
    catch (e) {
      response.status(500).send({
        result: null,
        error: true,
        message: e.message
      });
    }
});
