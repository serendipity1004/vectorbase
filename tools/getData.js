/**
 * Created by JC on 24/04/2017.
 */
const http = require('http');
const math = require('mathjs');
const fs = require('fs');
const util = require('util');

const {getDescendingIndices} = require('./getDescendingIndices');
const {gridMaker} = require('./gridMaker');

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
                let xVals = [];
                let yVals = [];
                let grid = [];
                let geoLevel = geohash.split('_')[1];
                let distanceMatrix = [];
                let result = [];
                let removeIndices = [];

                let xVal = parsedData.stats.stats_fields.geo_coords_ll_0_coordinate.facets[geohash];

                let yVal = parsedData.stats.stats_fields.geo_coords_ll_1_coordinate.facets[geohash];

                //Calculate distance and count if background === true

                if (background) {
                    let gridSize = math.pow(2, geoLevel);
                    grid = gridMaker(gridSize, geoLevel, false);
                    distanceMatrix = gridMaker(Math.pow(gridSize, 2), geoLevel, true);

                    for (let item in xVal) {
                        xVals.push(xVal[item].mean);
                        grid.forEach((row) => {
                            row.forEach((col) => {
                                if (item == Object.keys(col)) {
                                    col[item][0] = xVal[item].count;
                                }
                            })
                        })
                    }

                    // create a distance matrix

                    for (let i = 0; i < grid.length; i++) {
                        for (let j = 0; j < grid.length; j++) {
                            let key = Object.keys(grid[i][j])[0];

                            let object = grid[i][j][key];

                            if (object[0] === 0) {
                                removeIndices.push(i * grid.length + j);
                            } else {
                                for (let k = 0; k < grid.length; k++) {
                                    for (let l = 0; l < grid.length; l++) {
                                        let key2 = Object.keys(grid[k][l])[0];
                                        let objectInside = grid[k][l][key2];

                                        if (((i + 1 === k && j === l) ||
                                            (i - 1 === k && j === l) ||
                                            (i === k && j + 1 === l) ||
                                            (i === k && j - 1 === l)) &&
                                            objectInside[0] !== 0) {

                                            distanceMatrix[i * grid.length + j][k * grid.length + l] = 1;
                                        } else {
                                            distanceMatrix[i * grid.length + j][k * grid.length + l] = 0;
                                        }
                                    }
                                }
                            }

                        }
                    }

                    // remove positions that do not have background counts.
                    let removed = 0;

                    for (let i = 0; i < removeIndices.length; i++) {
                        distanceMatrix.splice(removeIndices[i] - removed, 1);
                        if (geoLevel == 2){
                            console.log(removeIndices[i] - removed);
                            console.log(`removed : ${removed}`);
                        }
                        removed++;
                    }

                    for (let i = 0; i < distanceMatrix.length; i++) {
                        let removed = 0;
                        for (let j = 0; j < removeIndices.length; j++) {
                            distanceMatrix[i].splice(removeIndices[j] - removed, 1);
                            removed++;
                        }
                    }

                    if (geoLevel == 2) {
                        console.log(util.inspect(distanceMatrix, false, null));
                        console.log(removeIndices);
                    }

                    result.push(grid);
                    result.push(distanceMatrix);

                    callback(result);

                } else {

                    //Calculate only count if background === false

                    for (let item in xVal) {
                        count.push({hash: item, count: xVal[item].count});
                    }

                    callback(count);
                }

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