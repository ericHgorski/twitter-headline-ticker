const https = require("https");
// const { consumerKey, consumerSecret } = require("./secrets.json");

// GET BEARER TOKEN FOR ACCESS.
module.exports.getToken = (callback) => {
    let encodedCreds = Buffer.from(`${process.env.consumerKey}:${process.env.consumerSecret}`).toString("base64");

    const options = {
        host: "api.twitter.com",
        path: "/oauth2/token",
        method: "POST",
        headers: {
            Authorization: `Basic ${encodedCreds}`,
            "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8",
        },
    };

    const cb = function (response) {
        if (response.statusCode != 200) {
            callback(response.statusCode);
        }
        let body = "";
        response.on("data", (chunk) => {
            body += chunk;
        });
        response.on("end", () => {
            let parsedBody = JSON.parse(body);
            callback(null, parsedBody.access_token); //null means no error was found
        });
    };

    const req = https.request(options, cb);

    req.on("error", (err) => callback(err));

    req.end("grant_type=client_credentials");
};

// REQUESTING TWEETS FROM API FROM targetAccount.
module.exports.getTweets = (bearerToken, twitterHandle, callback) => {
    const targetAccount = twitterHandle;
    const targetPath = `/1.1/statuses/user_timeline.json?screen_name=${targetAccount}&tweet_mode=extended`;
    const options = {
        host: "api.twitter.com",
        path: targetPath,
        method: "GET",
        headers: {
            Authorization: `Bearer ${bearerToken}`,
        },
    };

    const cb = function (response) {
        if (response.statusCode != 200) {
            callback(response.statusCode);
            return;
        }
        let body = "";
        response.on("data", (chunk) => {
            body += chunk;
        });
        response.on("end", () => {
            let parsedBody = JSON.parse(body);
            callback(null, parsedBody);
        });
    };
    const req = https.request(options, cb);
    req.end();
};

// FILTER NUM NUMBER OF TWEETS FOR HEADLINE AND URL.
module.exports.filterTweets = (tweets) => {
    const linksInTicker = 10;
    var tweetJson = [];
    for (let i = 0; i < linksInTicker; i++) {
        let headlineUrl = tweets[i].entities.urls[0];
        // ONLY ACCEPT TWEETS WITH LINKS.
        if (headlineUrl) {
            var headlineObj = {
                title: `${tweets[i].user.screen_name} : ${tweets[i].full_text.substring(0, 50)}...`,
                url: headlineUrl.url,
            };
            tweetJson.push(headlineObj);
        }
    }
    return tweetJson;
};
