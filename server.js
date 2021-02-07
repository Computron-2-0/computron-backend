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

server.post("/signup", async(request, response) => {
  try {
    console.log(request.body);
    var checkUser = await collection.findOne({
      "user": request.body.username
    });
    if (checkUser == null) {
      //Process user creation if not found.
      var date = new Date(Date.now());
      var insertResult = await collection.insertOne({
        "user": request.body.username,
        "pass": request.body.password,
        "email": request.body.email,
        "date_created": date.toJSON()
      });

      if (insertResult == null) {
        response.status(500).send({
          result: null,
          error: true,
          message: "Error creating user"
        });
      } else {
        var insertCheck = await collection.findOne({
          "user": request.body.username
        });
        console.log("Return result:\n" + JSON.stringify(insertCheck));
        response.send({
          result: insertCheck,
          error: false,
          message: "Welcome, " + insertCheck.user + "!"
        });
      }
    } else {
      //Return error if user is already found.
      response.send({
        result: null,
        error: true,
        message: "User " + request.body.username + " already exists!"
      })
    }
  } catch (e) {
    console.log(e);
    response.status(500).send({
      result: null,
      error: true,
      message: e.message
    });
  }
});

server.post("/signin", async(request, response) => {
  try {
    console.log(request.body);
    var result = await collection.findOne({
      "user": request.body.username,
      "pass": request.body.password
    });
    if (result == null) {
      response.send({
        result: null,
        error: true,
        message: "Invalid username or password"
      });
    } else {
      //Update last login date with current date before sending return result.
      var date = new Date(Date.now());
      var updateLoginDate = await collection.updateOne({
        "_id": result._id
      }, {
        "$set": {
          "last_login_date": date.toJSON()
        }
      });
      console.log("Return data:\n" + JSON.stringify(result));
      response.send({
        result: result,
        error: false,
        message: "Welcome back, " + result.user + "!"
      });
    }
  } catch (e) {
    console.log(e);
    response.status(500).send({
      result: null,
      error: true,
      message: e.message
    });
  }
});
