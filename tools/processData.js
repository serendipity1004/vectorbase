/**
 * Created by JC on 29/04/2017.
 */
const {getData} = require('./getData');
const {moransICalc} = require('./morans');
const util = require('util');

const processData = (targetUrl, geohash, geoLevel, background, backgroundMatrix, inverse, callback) => {

    getData(targetUrl, geohash, background, (result) => {
        //
        // let backgroundCounts = backgroundMatrix[geoLevel-2][0];
        // let distanceMatrix = backgroundMatrix[geoLevel-2][1];

        let grid = backgroundMatrix[geoLevel-2];
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

        // console.log(result)

        // console.log(result);
        // console.log(backgroundCounts);

        // console.log(util.inspect(grid, false, null));

        // backgroundCounts.forEach((backgroundItem) => {
        //     let pass = false;
        //     result.forEach((targetItem) => {
        //         if (backgroundItem.hash === targetItem.hash) {
        //             normalizedCounts.push(targetItem.count/backgroundItem.count);
        //             // normalizedCounts.push(targetItem.count);
        //             pass = true;
        //         }
        //     });
        //
        //     if (!pass) {
        //         normalizedCounts.push(0);
        //     }
        // });

        let moransI = moransICalc(grid, inverse);
        // console.log('this is distance matrix');
        // let output = '';
        // distanceMatrix.forEach((i) => {
        //     i.forEach((j) => {
        //         output += j + ','
        //     });
        //     output += '\n';
        // });

        // console.log(output);

        // console.log(distanceMatrix);
        callback(moransI)

    });
};

module.exports = {
    processData
};