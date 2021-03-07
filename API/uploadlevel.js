const Express = require("express");
const server = Express.Router();
const { MongoClient, ObjectId } = require("mongodb");

server.post("/", async(request, response) => {
    const client = new MongoClient(process.env.ATLAS_URI, { useUnifiedTopology: true });
    try {
        await client.connect();
        var collection = client.db("computron").collection("levels");

        console.log(request.body);

        var date = new Date(Date.now());
        var level = JSON.parse(request.body.level);
        console.log(level);
        var insertResult = await collection.insertOne({
            "userid": new ObjectId(level.userid),
            "share_date": date.toJSON(),
            "name": level.name,
            "description": level.description,
            "generate_random_inputs": level.generate_random_inputs,
            "inputs": level.inputs,
            "num_inputs": level.num_inputs,
            "instructions": level.instructions,
            "cards": level.cards,
            "hints": level.hints,
            "allowed_cards": level.allowed_cards,
            "star_requirements": level.star_requirements
        });

        if (insertResult == null) {
            response.status(500).send({
                result: null,
                error: true,
                message: "Error uploading level"
            });
        } else {
            console.log(insertResult);
            response.send({
                result: insertResult,
                error: false,
                message: "Level uploaded successfully."
            })
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