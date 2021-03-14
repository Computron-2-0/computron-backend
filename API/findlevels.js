const Express = require("express");
const server = Express.Router();
const { MongoClient, ObjectID, ObjectId } = require("mongodb");

server.post("/", async(request, response) => {
    const client = new MongoClient(process.env.ATLAS_URI, { useUnifiedTopology: true });
    try {
        await client.connect();
        var collection = client.db("computron").collection("levels");

        console.log(request.body);
        var payload = JSON.parse(request.body.filter);
        var filter;
        switch (payload.searchType) {
            //Search by ID
            case 0:
                filter = {
                    "_id": new ObjectId((payload._id))
                };
                break;
            //Search by UserID
            case 1:
                filter = {
                    "userid": new ObjectID(payload.userid)
                };
                break;
            //Search by Level Name
            case 2:
                filter = {
                    "name": {
                        $regex: payload.name,
                        $options: "i"
                    }
                };
                break;
        }
        var result = await collection.find(filter).toArray();
        if (result == null) {
            response.send({
                result: [],
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