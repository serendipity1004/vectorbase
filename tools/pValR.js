/**
 * Created by JC on 27/05/2017.
 */
const math = require('mathjs');

const pValR = (x, obs, weightMatrix, sumWeight) => {

    let distanceMatrix = weightMatrix;

    let twoDistSum = math.add(distanceMatrix, math.transpose(distanceMatrix));
    twoDistSum = math.square(twoDistSum);

    let weightSum = 0;

    for (let i = 0; i < twoDistSum.length; i++) {
        for (let j = 0; j < twoDistSum[i].length; j++) {
            weightSum += twoDistSum[i][j]
        }
    }

    let s1 = 0.5 * weightSum;

    let rowSumMatrix = [];
    let colSumMatrix = [];

    for (let i = 0; i < distanceMatrix.length; i++) {
        let arbSum = 0;
        for (let j = 0; j < distanceMatrix.length; j++) {
            arbSum += distanceMatrix[i][j];
        }
        rowSumMatrix.push(arbSum);
    }

    for (let i = 0; i < distanceMatrix.length; i++) {
        let arbSum = 0;
        for (let j = 0; j < distanceMatrix.length; j++) {
            arbSum += distanceMatrix[j][i]
        }
        colSumMatrix.push(arbSum);
    }

    let rowColSum = math.add(rowSumMatrix, colSumMatrix);
    let rowColSumSqr = math.square(rowColSum);
    let s2 = 0;

    for (let i = 0; i < rowColSumSqr.length; i++) {
        s2 += rowColSumSqr[i]
    }

    let ssq = math.square(sumWeight);

    let ei = (-1) / (distanceMatrix.length - 1);

    let n = weightMatrix.length;

    let m = 0;

    let y = [];

    for (let i = 0; i < x.length; i++) {
        m += x[i];
    }

    m = m / x.length;


    for (let i = 0; i < x.length; i++) {
        y.push(x[i] - m)
    }

    let ySqr = math.square(y);
    let yQuad = math.square(ySqr);
    let sumQuad = 0;
    let v = 0;

    for (let i = 0; i < ySqr.length; i++) {
        v += ySqr[i]
    }

    for (let i = 0; i < yQuad.length; i++) {
        sumQuad += yQuad[i]
    }

    let k = (sumQuad / n) / Math.pow(v / n, 2);

    let num1 = n * ((Math.pow(n, 2) - 3 * n + 3) * s1 - n * s2 + 3 * ssq) - (k * (n * (n - 1) * s1 - 2 * n * s2 + 6 * ssq));
    console.log(`num1 : ${num1}`);

    let num2 = (n - 1) * (n - 2) * (n - 3) * ssq;
    console.log(num2);

    let num3 = 1 / (Math.pow(n - 1, 2));
    console.log(num3);

    let sdi = Math.sqrt(num1 / num2 - num3);

    let pv = (1 - math.erf((ei - obs) / (Math.sqrt(2) * sdi))) / 2;

    if (obs <= ei) {
        pv = 2 * pv
    } else {
        pv = 2 * (1 - pv);
    }
    return pv;
};

module.exports = {
    pValR
};