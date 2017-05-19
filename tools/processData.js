/**
 * Created by JC on 29/04/2017.
 */
const {getData} = require('./getData');
const {moransICalc} = require('./morans');
const util = require('util');

const processData = (targetUrl, geohash, geoLevel, background, backgroundMatrix, inverse, callback) => {

    getData(targetUrl, geohash, background, (result) => {

        let counts = result[0];
        let goTerm = result[1];
        let geoLevelResponse = result[2];
        let grid = backgroundMatrix[geoLevel-2][0];
        let distanceMatrix = backgroundMatrix[geoLevel -2][1];
        let normalizedCounts = [];
        let returnResult = [];

        grid.forEach((row) => {
            row.forEach((col) => {
                col[Object.keys(col)][1] = 0;
                counts.forEach((targetItem) => {
                    if (targetItem.hash === Object.keys(col)[0]){
                        col[Object.keys(col)][1] = targetItem.count;
                    }
                })
            })
        });

        moransICalc(grid, distanceMatrix, inverse, goTerm, geoLevelResponse, (res) => {
            returnResult.push(res);
            returnResult.push(goTerm);
            callback(returnResult);
        });
    });
};

module.exports = {
    processData
};