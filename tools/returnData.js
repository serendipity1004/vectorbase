/**
 * Created by JC on 29/04/2017.
 */
const {getData} = require('./getData');
const {moransICalc} = require('./morans');

const returnData = (targetUrl, geohash, geoLevel, background, backgroundMatrix, inverse, callback) => {

    getData(targetUrl, geohash, background, (result) => {

        let backgroundCounts = backgroundMatrix[geoLevel-2][0];
        let distanceMatrix = backgroundMatrix[geoLevel-2][1];

        let normalizedCounts = [];

        // console.log(result);
        // console.log(backgroundCounts);

        backgroundCounts.forEach((backgroundItem) => {
            let pass = false;
            result.forEach((targetItem) => {
                if (backgroundItem.hash === targetItem.hash) {
                    normalizedCounts.push(targetItem.count/backgroundItem.count);
                    // normalizedCounts.push(targetItem.count);
                    pass = true;
                }
            });

            if (!pass) {
                normalizedCounts.push(0);
            }
        });

        let moransI = moransICalc(distanceMatrix, normalizedCounts, inverse);
        callback(moransI)

    });
};

module.exports = {
    returnData
};