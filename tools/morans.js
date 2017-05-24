/**
 * Created by JC on 24/04/2017.
 */
const util = require('util');
const fs = require('fs');

const moransICalc = (grid, distanceMatrix, inverse, goTerm, geohash, callback) => {
    let numerator = 0;
    let denominator = 0;
    let sumWeights = 0;
    let totalCount = 0;
    let averagedCount = [];
    let average = 0;
    let finalWeight = [];
    let countMatrix = [];
    let backgroundCounts = '';
    let targetCounts = '';
    let normalizedCounts = '';
    let countmatrixCsv = '';

    grid.forEach((row) => {
        row.forEach((col) => {
            let key = Object.keys(col);
            let norm = col[key][1] / col[key][0];

            backgroundCounts += key + ", " + col[key][0] + ", ";
            targetCounts += key + ", " + col[key][1] + ", ";
            normalizedCounts += key + ", " + norm + ", ";

            // console.log(col);
            // console.log(norm);

            if (col[key][0] !== 0) {
                countMatrix.push(norm);
                countmatrixCsv += key + ", " + col[key][1] + ", ";
            }
        });
        backgroundCounts += '\n';
        targetCounts += '\n';
        normalizedCounts += '\n';
        countmatrixCsv += '\n';
    });

    // console.log(util.inspect(grid, false, null));

    // console.log(countMatrix);

    // countMatrix = [1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0];

    // for (let i = 0; i < 16; i ++){
    //     for (let j = 0; j < 16; j ++){
    //         if (i % 2 === 0){
    //             if (j % 2 === 0){
    //                 countMatrix.push(0)
    //             }else {
    //                 countMatrix.push(1)
    //             }
    //         }else {
    //             if (j % 2 === 0){
    //                 countMatrix.push(1)
    //             }else {
    //                 countMatrix.push(0)
    //             }
    //         }
    //     }
    // }

    // console.log(countMatrix);

    countMatrix.forEach((item) => {
        totalCount += item;
    });

    average = totalCount / countMatrix.length;

    countMatrix.forEach((item) => {
        averagedCount.push(item - average)
    });

    if (inverse) {
        let totalMatrix = [];

        weight.forEach((item) => {
            let arbTotal = 0;
            item.forEach((value) => {
                arbTotal += value;
            });
            totalMatrix.push(arbTotal);
        });

        weight.forEach((item) => {
            let arbMatrix = [];
            item.forEach((value) => {
                if ((1 / value) !== Infinity) {
                    let inverseVal = 1 / (1 + value);
                    arbMatrix.push(inverseVal);
                } else {
                    arbMatrix.push(1);
                }
            });
            finalWeight.push(arbMatrix);
        });
    } else {
        finalWeight = distanceMatrix;
    }


    for (let i = 0; i < finalWeight.length; i++) {
        denominator += Math.pow(averagedCount[i], 2);
        for (let j = 0; j < finalWeight.length; j++) {
            numerator += finalWeight[i][j] * averagedCount[i] * averagedCount[j];
            sumWeights += finalWeight[i][j];
        }
    }

    let observedI = (averagedCount.length / sumWeights) * (numerator / denominator);
    let expectedI = 1 / (averagedCount.length - 1);

    let result = {
        observedI, expectedI, totalCount
    };

    let distanceMatrixCsv = '';
    distanceMatrix.forEach((row) => {
        row.forEach((col) => {
            distanceMatrixCsv += col + ', '
        });
        distanceMatrixCsv +=  '\n'
    });

    // fs.appendFile('./results/grid.txt', `\n${goTerm}, ${geohash}, ${result.observedI}, \n ${backgroundCounts}, \n ${targetCounts}, \n ${countmatrixCsv}, \n ${distanceMatrixCsv}`);


    callback(result);

};

module.exports = {
    moransICalc
};