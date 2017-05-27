/**
 * Created by JC on 25/05/2017.
 */
const XLS = require('xlsjs');
const util = require('util');
const fs = require('fs');
const csv = require('csvtojson');

const pValCalc = (targetFile, randomFile, geohash) => {
    let targetObject = [];
    let randomObject = [];
    let sortedRandom = [];
    let promises = [];

    let targetPromise = new Promise((resolve, reject) => {
        csv()
            .fromFile(targetFile)
            .on('csv', (csvRow) => {
                targetObject.push(csvRow);
            })
            .on('done', () => {
                console.log(`target file ready`);
                resolve();
            });
    });

    promises.push(targetPromise);

    let randomPromise = new Promise((resolve, reject) => {
        csv()
            .fromFile(randomFile)
            .on('csv', (csvRow) => {
                randomObject.push(csvRow)
            })
            .on('done', () => {
                console.log(`random file ready`);
                sortedRandom = randomObject
                    .filter((el, i, a) => {
                        let count = el[0];
                        let unique = true;

                        if (i !== 0 && count === a[i - 1][0]) {
                            unique = false;
                        }

                        return unique;
                    });
                for (let i = 0; i < sortedRandom.length; i++) {
                    for (let j = 0; j < sortedRandom.length; j++) {
                        sortedRandom[i][j] = parseFloat(sortedRandom[i][j])
                    }
                }

                console.log(randomObject[0]);
                resolve();
            });
    });

    promises.push(randomPromise);

    Promise.all(promises).then(() => {
        console.log('promises finished');

        for (let i = 0; i < targetObject.length; i++) {
            let targetRow = targetObject[i];
            let count = 0;
            for (let j = 0; j < sortedRandom.length; j++) {
                let randomRow = sortedRandom[j];
                if (parseFloat(targetRow[1]) === parseFloat(randomRow[0])) {
                    for (let k = 1; k < randomRow.length; k++) {
                        if (parseFloat(targetRow[geohash + 2]) > 0) {
                            if (parseFloat(randomRow[k]) >= parseFloat(targetRow[geohash + 2])) {
                                count++
                            }
                        } else {
                            if (parseFloat(randomRow[k]) <= parseFloat(targetRow[geohash + 2])) {
                                count++
                            }
                        }

                    }
                    break;
                }
            }
            targetRow.push(count / 100)
        }

        let csvTest = '';
        for (let i = 0; i < targetObject.length; i++) {
            for (let j = 0; j < targetObject[i].length; j++) {
                csvTest += targetObject[i][j] + ', ';
            }
            csvTest += '\n'
        }
        fs.writeFile('./results/sortTest.csv', csvTest, () => {
            console.log('writing file done')
        });


    });
};

module.exports = {
    pValCalc
};