/**
 * Created by JC on 24/04/2017.
 */
const http = require('http');
const math = require('mathjs');

const getData = (targetUrl, geohash, background, callback) => {

    http.get(targetUrl, (res) => {

        const {statusCode} = res;

        let error;
        if (statusCode !== 200) {
            error = new Error(`Request failed \n` +
                `Status Code : ${statusCode}`)
        }

        if (error) {
            console.error(error.message);
            res.resume();
            return;
        }

        res.setEncoding('utf8');
        let rawData = '';
        res.on('data', (chunk) => {
            rawData += chunk;
        }).on('end', () => {

            let result = [];

            try {
                let parsedData = JSON.parse(rawData);
                let count = [];
                let distanceMatrix = [];
                let xVals = [];
                let yVals = [];

                let xVal = parsedData.stats.stats_fields.geo_coords_ll_0_coordinate.facets[geohash];
                let yVal = parsedData.stats.stats_fields.geo_coords_ll_1_coordinate.facets[geohash];

                //Calculate distance and count if background === true

                if (background){
                    for (let item in xVal) {
                        xVals.push(xVal[item].mean);
                        count.push({hash : item, count: xVal[item].count});
                    }

                    for (let item in yVal) {
                        yVals.push(yVal[item].mean);
                    }

                    for (let i = 0; i < xVals.length; i ++){
                        let arbMatrix = [];
                        for (let j = 0; j < yVals.length; j++){
                            arbMatrix.push(math.sqrt(math.pow(xVals[i]-xVals[j], 2) + math.pow(yVals[i]-yVals[j], 2)))
                        }
                        distanceMatrix.push(arbMatrix);
                    }

                    result.push(count);
                    result.push(distanceMatrix);

                } else {

                    //Calculate only count if background === false

                    for (let item in xVal) {
                        count.push({hash : item, count: xVal[item].count});
                    }

                    result = count;
                }

                // console.log(result);

                callback(result);
            } catch (e) {
                console.error(e.message);
            }
        }).on('error', (err) => {
            console.log(err.message);
        })
    })
};

module.exports = {
    getData
};