const Express = require("express");
const server = Express.Router();
const { MongoClient , ObjectID} = require("mongodb");
const Crypto = require("crypto");

server.post("/", async(request, response) => {
    const client = new MongoClient(process.env.ATLAS_URI, { useUnifiedTopology: true });
    try {
        await client.connect();
        var collection = client.db("computron").collection("users");

        var result = await collection.findOne({
            "_id": new ObjectID(request.body.userid)
        });
        if (result == null) {
            response.status(500).send({
                result: null,
                error: true,
                message: "User no longer exists."
            });
        } else {
            //Verify password.
            var password = Crypto.createHash("sha256").update(request.body.oldpassword + result.salt).digest();
            if (password.toString() == result.pass.toString()) {
                //Change the password.
                var salt = Crypto.randomBytes(Crypto.randomInt(32, 64)).toString("base64");
                password = Crypto.createHash("sha256").update(request.body.newpassword + salt).digest();

                var updatePassword = await collection.updateOne({
                    "_id": result._id
                }, {
                    "$set": {
                        "pass": password,
                        "salt": salt
                    }
                });

                response.send({
                    result: updatePassword,
                    error: false,
                    message: "Password has been changed."
                });
            } else {
                response.status(401).send({
                    result: null,
                    error: true,
                    message: "Password is incorrect"
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