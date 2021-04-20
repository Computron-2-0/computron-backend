const Express = require("express");
const server = Express.Router();
const { MongoClient, ObjectID} = require("mongodb");

server.post("/", async(request, response) => {
    const client = new MongoClient(process.env.ATLAS_URI, { useUnifiedTopology: true });
    try {
        await client.connect();
        var collection = client.db("computron").collection("levels");

        console.log(request.body);
        var payload = JSON.parse(request.body.filter);
        var filter;

        if (payload._id != "") {
            filter = {
                "_id": new ObjectID(payload._id)
            };
        }
        else {
            filter = {
                "name": {
                    $regex: payload.name,
                    $options: "i"
                }
            };
            if (payload.author != "")
                filter.author = {
                    $regex: payload.author,
                    $options: "i"
                };
        }

        var todaysDate = new Date(Date.now());
        var dateRange;
        switch (payload.date_range) {
            //within 14 days
            case 0:
                dateRange = getMillisFromDays(14);
                break;
            //within 30 days
            case 1:
                dateRange = getMillisFromDays(30);
                break;
            //within 90 days
            case 2:
                dateRange = getMillisFromDays(90);
                break;
            //within 180 days
            case 3:
                dateRange = getMillisFromDays(180);
                break;
            //default fetch all
            default:
                dateRange = null;
        }
        if (dateRange != null) {
            var searchDateFrom = new Date(todaysDate.valueOf() - dateRange);
            console.log("Searching levels from " + searchDateFrom);
            filter.share_date = {
                $gte: searchDateFrom.toISOString()
            }
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

function getMillisFromDays(days) {
    //Number of days * 24 hours/day * 60 minutes/hour * 60 seconds/minute * 1000 milliseconds/second
    return days * 24 * 60 * 60 * 1000;
}

module.exports = server;