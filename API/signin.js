const Express = require("express");
const server = Express.Router();
const { MongoClient } = require("mongodb");
const Crypto = require("crypto");

server.post("/", async(request, response) => {
    const client = new MongoClient(process.env.ATLAS_URI, { useUnifiedTopology: true });
    try {
        await client.connect();
        var collection = client.db("computron").collection("users");

        console.log(request.body);
        var result = await collection.findOne({
            "user": request.body.username
        });
        if (result == null) {
            response.status(401).send({
                result: null,
                error: true,
                message: "Invalid username or password"
            });
        } else {
            //Verify password.
            var password = Crypto.createHash("sha256").update(request.body.password + result.salt).digest();
            if (password.toString() == result.pass.toString()) {
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
            } else {
                response.status(401).send({
                    result: null,
                    error: true,
                    message: "Invalid username or password"
                });
            }
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