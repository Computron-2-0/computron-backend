const Express = require("express");
const server = Express.Router();
const { MongoClient } = require("mongodb");

server.post("/", async(request, response) => {
    const client = new MongoClient(process.env.ATLAS_URI, { useUnifiedTopology: true });
    try {
        await client.connect();
        var collection = client.db("computron").collection("users");

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
                "date_created": date.toJSON(),
                "last_login_date": date.toJSON()
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

            client.close();
        } else {
            //Return error if user is already found.
            response.status(409).send({
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

module.exports = server;