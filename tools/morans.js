/**
 * Created by JC on 24/04/2017.
 */
const moransICalc = (weight, count, inverse) => {
    let numerator = 0;
    let denominator = 0;
    let sumWeights = 0;
    let totalCount = 0;
    let averagedCount = [];
    let observedI = 0;
    let expectedI = 0;
    let result = '';
    let average = 0;
    let finalWeight = [];

    count.forEach((item) => {
        totalCount += item;
    });

    average = totalCount / count.length;

    count.forEach((item) => {
        averagedCount.push(Math.pow(item - average, 2))
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

        // console.log(weight);

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
        console.log(finalWeight);
    } else {
        finalWeight = weight;
    }

    for (let i = 0; i < finalWeight.length; i++) {
        denominator += Math.pow(averagedCount[i], 2);
        for (let j = 0; j < finalWeight.length; j++) {
            numerator += finalWeight[i][j] * averagedCount[i] * averagedCount[j];
            sumWeights += finalWeight[i][j];
        }
    }

    // console.log(averagedCount.length / sumWeights);
    // console.log(numerator);
    // console.log(denominator);

    observedI = (averagedCount.length / sumWeights) * (numerator / denominator);
    expectedI = 1 / (averagedCount.length - 1);

    result = {
        observedI, expectedI
    };

    return result;

};

module.exports = {
    moransICalc
};