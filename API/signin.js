const Express = require("express");
const server = Express.Router();
const { MongoClient, ObjectID } = require("mongodb");

server.post("/", async(request, response) => {
    const client = new MongoClient(process.env.ATLAS_URI, { useUnifiedTopology: true });
    try {
        await client.connect();
        var collection = client.db("computron").collection("users");

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

        client.close();
    } catch (e) {
        console.log(e);
        response.status(500).send({
            result: null,
            error: true,
            message: e.message
        });
    }
});

module.exports = server;