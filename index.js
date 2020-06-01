const express = require("express");
const app = express();
let { getToken, getTweets, filterTweets } = require("./twitter");
const { promisify } = require("util");
getToken = promisify(getToken);
getTweets = promisify(getTweets);

app.use(express.static("./ticker"));

//SERVICE GET REQUEST FROM TICKER FUNCTION
app.get("/links.json", (req, res) => {
    //GET BEARER TOKEN FOR API ACCESS.
    getToken().then((token) => {
        return Promise.all([getTweets(token, "nytimes"), getTweets(token, "theonion"), getTweets(token, "bbcnews")])
            .then((result) => {
                // MERGE TWEETS INTO SINGLE ARRAY.
                const mergedResults = [...result[0], ...result[1], ...result[2]];
                // SORT TWEETS BY MOST RECENT.
                const sortedTweets = mergedResults.sort((a, b) => {
                    return new Date(b.created_at) - new Date(a.created_at);
                });
                return sortedTweets;
            })
            .then((sortedTweets) => {
                // FILTER RELEVANT INFO.
                return filterTweets(sortedTweets);
            })
            .then((filteredTweets) => {
                // SEND JSON OF FILTERED TWEETS.
                res.json(filteredTweets);
            })
            .catch((err) => {
                console.log("ERROR: ", err);
            });
    });
});

app.listen(8080, () => console.log("Running..."));
