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

        weight.forEach((item, i) => {
            let arbMatrix = [];
            item.forEach((value) => {
                if (1 / value !== Infinity) {
                    let inverse = 1 / value;
                    arbMatrix.push(inverse/totalMatrix[i]);
                } else {
                    arbMatrix.push(0);
                }
            });
            finalWeight.push(arbMatrix);
        })
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

    console.log(observedI);

    return result;

};

module.exports = {
    moransICalc
};