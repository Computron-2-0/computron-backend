const Express = require("express");
const server = Express.Router();
const { MongoClient, ObjectID } = require("mongodb");

server.post("/", async(request, response) => {
    const client = new MongoClient(process.env.ATLAS_URI, { useUnifiedTopology: true });
    try {
        await client.connect();
        var collection = client.db("computron").collection("levels");

        console.log(request.body);
        var result = await collection.find({
            
        }).toArray();
        if (result == null) {
            response.send({
                result: null,
                error: true,
                message: "No levels found"
            });
        } else {
            console.log("Return data:\n" + JSON.stringify(result));
            response.send({
                result: result,
                error: false,
                message: "Levels found " + result.length
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