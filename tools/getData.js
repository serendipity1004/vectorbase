/**
 * Created by JC on 24/04/2017.
 */
const http = require('http');
const math = require('mathjs');
const fs = require('fs');
const util = require('util');

const {getDescendingIndices} = require('./getDescendingIndices');
const {gridMaker} = require ('./gridMaker');

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
                let distanceMatrixEuc = [];
                let distanceMatrixBin = [];
                let xVals = [];
                let yVals = [];
                let neighboursDistanceMatrix = [];
                let grid = [];
                let geoLevel = geohash.split('_')[1];

                let xVal = parsedData.stats.stats_fields.geo_coords_ll_0_coordinate.facets[geohash];
                // console.log(xVal);

                let yVal = parsedData.stats.stats_fields.geo_coords_ll_1_coordinate.facets[geohash];
                // console.log(yVal);

                //Calculate distance and count if background === true

                if (background){
                    grid = gridMaker(math.pow(2, geoLevel), geoLevel);

                    for (let item in xVal) {
                        xVals.push(xVal[item].mean);
                        grid.forEach((row) => {
                            row.forEach((col) => {
                                if (item == Object.keys(col)){
                                    col[item][0] = xVal[item].count;
                                }
                            })
                        })
                    }

                    for (let item in yVal) {
                        // yVals.push(yVal[item].mean);
                    }



                    // if (geoLevel == 2) {
                    //     console.log(util.inspect(grid, false, null));
                    // }



                    for (let i = 0; i < xVals.length; i ++){
                        let arbMatrixEuc = [];
                        let arbMatrixBin = [];
                        for (let j = 0; j < yVals.length; j++){
                            let distance = math.sqrt(math.pow(xVals[i]-xVals[j], 2) + math.pow(yVals[i]-yVals[j], 2));

                            // grid.forEach((row) => {
                            //     row.forEach((col) => {
                            //         if (object.keys(col) === )
                            //     })
                            // })
                            arbMatrixEuc.push(distance);

                            if (distance > 50 || i === j){
                                arbMatrixBin.push(0)
                            } else {
                                arbMatrixBin.push(1)
                            }
                            // console.log(`distance of `)
                        }
                        distanceMatrixEuc.push(arbMatrixEuc);
                        distanceMatrixBin.push(arbMatrixBin);
                    }

                    //Only four neighbouring points have distance values but others 0
                    distanceMatrixEuc.forEach((row) => {
                        let indices = getDescendingIndices(row);
                        // console.log(indices);
                        let firstFour = [];
                        let arbRow = [];
                        let rowSum = 0;

                        for (let i = 1; i < 5; i++) {
                            firstFour.push(indices[i]);
                            // console.log('first four');
                            // console.log(row[indices[i]]);
                            rowSum += row[indices[i]];
                            // console.log('row sum');
                            // console.log(rowSum);
                        }

                        // console.log('first four');
                        // console.log(firstFour);

                        for (let i = 0; i < row.length; i++){
                            arbRow.push(0);
                        }

                        for (let numb in firstFour){
                            let indice = firstFour[numb];
                            // arbRow[indice] = row[indice];
                            // arbRow[indice] = 1;
                            arbRow[indice] = 1/(row[indice]/rowSum);
                        }

                        // console.log('arb-row');
                        // console.log(arbRow);
                        neighboursDistanceMatrix.push(arbRow);

                    });

                    // Return CSV of neighboursDistanceMatrix

                    // let arbCsv = '';
                    //
                    // neighboursDistanceMatrix.forEach((row) => {
                    //     row.forEach((col) => {
                    //         arbCsv += col + ','
                    //     });
                    //     arbCsv += '\n'
                    // });
                    //
                    // console.log(arbCsv);

                    // result.push(count);

                    // Pass Euclidean Matrix
                    // result.push(distanceMatrixEuc);
                    // console.log('neighbour matrix');
                    callback(grid);

                } else {

                    //Calculate only count if background === false

                    for (let item in xVal) {
                        count.push({hash : item, count: xVal[item].count});
                    }

                    callback(count);
                }

                // console.log(result);

                // console.log(result)
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