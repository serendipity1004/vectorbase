/**
 * Created by JC on 29/04/2017.
 */
const {getData} = require('./getData');
const {moransICalc} = require('./morans');
const util = require('util');

const processData = (targetUrl, geohash, geoLevel, background, backgroundMatrix, inverse, callback) => {

    getData(targetUrl, geohash, background, (result) => {

        let grid = backgroundMatrix[geoLevel-2][0];
        let distanceMatrix = backgroundMatrix[geoLevel -2][1];
        let normalizedCounts = [];

        grid.forEach((row) => {
            row.forEach((col) => {
                result.forEach((targetItem) => {
                    if (targetItem.hash === Object.keys(col)[0]){
                        col[Object.keys(col)][1] = targetItem.count;
                    }
                })
            })
        });

        let moransI = moransICalc(grid, distanceMatrix, inverse);

        callback(moransI)

    });
};

module.exports = {
    processData
};