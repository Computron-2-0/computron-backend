const Express = require("express");
const server = Express.Router();
const { MongoClient, ObjectID } = require("mongodb");

server.post("/", async(request, response) => {
    const client = new MongoClient(process.env.ATLAS_URI, { useUnifiedTopology: true });
    try {
        await client.connect();
        var collection = client.db("computron").collection("levels");

        console.log(request.body);
        var searchResult = await collection.findOne({
            "_id": new ObjectID(request.body._id),
            "userid": new ObjectID(request.body.userid)
        });
        if (searchResult == null) {
            response.send({
                result: null,
                error: true,
                message: "Level not found"
            });
        } else {
            console.log("Deleting level with id:\n" + request.body._id);
            var deleteResult = await collection.deleteOne({
                "_id": new ObjectID(request.body._id),
                "userid": new ObjectID(request.body.userid)
            });
            console.log(deleteResult);
            if (deleteResult == null || deleteResult.deletedCount == 0) {
                response.status(500).send({
                    result: null,
                    error: true,
                    message: "Unable to delete level"
                });
            } else {
                response.send({
                    result: deleteResult,
                    error: false,
                    message: "Level deleted!"
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