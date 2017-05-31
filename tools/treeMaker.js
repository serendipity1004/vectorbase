/**
 * Created by JC on 31/05/2017.
 */
const XLS = require('xlsjs');
const csv = require('csvtojson');
const util = require('util');
const hsl = require('hsl-to-hex');
const fs = require('fs');

const treeMaker = (goTermsInDb, allTermsFile, targetTermsFile) => {

    let allTerms = [];
    let targetTerms = [];
    let promises = [];
    let dbTerms = [];
    let result = [];

    let dbPromise = new Promise((resolve, reject) => {
        csv()
            .fromFile(goTermsInDb)
            .on('csv', (csvRow) => {
                dbTerms.push(csvRow);
            }).on('done', () => {
            resolve();
        })
    });

    promises.push(dbPromise);

    let allTermsPromise = new Promise((resolve, reject) => {
        csv()
            .fromFile(allTermsFile)
            .on('csv', (csvRow) => {
                allTerms.push(csvRow);
            }).on('done', () => {
            resolve();
        })
    });

    promises.push(allTermsPromise);

    let targetTermsPromise = new Promise((resolve, reject) => {
        csv()
            .fromFile(targetTermsFile)
            .on('csv', (csvRow) => {
                targetTerms.push(csvRow);
            }).on('done', () => {
            resolve();
        })
    });

    let hslReturn = (number, total) => {
        let lum = 100 - number / total * 100;

        return hsl(0, 0, lum);
    };

    promises.push(targetTermsPromise);

    Promise.all(promises).then(() => {

            for (let i = 0; i < allTerms.length; i++) {
                for (let j = 0; j < dbTerms.length; j++) {
                    if (allTerms[i][0] === dbTerms[j][0]) {
                        result.push(allTerms[i])
                    }
                }
            }

            console.log('this is result')
            console.log(util.inspect(result, false, null));

            for (let i = 0; i < result.length; i++) {
                for (let j = 0; j < targetTerms.length; j++) {
                    if (result[i][0] == targetTerms[j][0]) {
                        let morans = targetTerms[j][4];
                        result[i].push(hslReturn(morans, 0.6))
                    }
                }
            }

            let output = '{';

            for (let i = 0; i < result.length; i++) {
                if (result[i].length === 1) {
                    output += "\"" + result[i][0] + "\"" + ":{}, " + "\n";
                    continue
                }
                for (let j = 0; j < result[i].length; j++) {
                    if (j === 0) {
                        output += "\"" + result[i][j] + "\"" + ":" + "{"
                    } else {
                        output += "\"" + "fill" + "\"" + ":" + "\"" + result[i][j] + "\"}," + "\n"
                    }

                }
            }

            output += "}";

            fs.writeFile('./results/output.csv', output, () => {
                console.log('done')
            });
        }
    )

};

module.exports = {
    treeMaker
};