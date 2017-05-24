/**
 * Created by JC on 29/04/2017.
 */
const {getGoTerms} = require('./getGoTerms');
const {processData} = require('./processData');
const fs = require('fs');

const processGoTerms = (geohash, geoLevel, backgroundMatrix, inverse, goTerm, host, callback) => {
    let csv = '';
    let promises = [];
    let moransMatrix = {};
    let count = 0;

            let targetUrl = `http://${host}:7997/solr/genea_expression/smplGeoclust?q=cvterms:"${goTerm}"&stats.facet=${geohash}&rows=10320`;
            console.log(targetUrl);

            let promise = new Promise((resolve, reject) => {
                processData(targetUrl, geohash, geoLevel, false, backgroundMatrix, inverse, (result) => {
                    if (result.length == 0){
                        callback(result);
                    }

                    let morans = result[0];
                    let goTerm = result[1];
                    let geolevel = result[2];
                    callback(result);


                    // csv += `${goTerm}, ${morans.observedI}\n`;
                    // console.log(morans.observedI);
                    // console.log(`morans count = ${count}`);
                    // count++;
                    //
                    // for (let matrixTerm in moransMatrix) {
                    //     if (matrixTerm === goTerm) {
                    //         moransMatrix[goTerm] = morans.observedI;
                    //     }
                    // }
                    // resolve();
                })
            });

            // promises.push(promise);
            //
            // if (goTerms.length - 1 === i){
            //     Promise.all(promises).then(() => {
            //         callback(moransMatrix)
            //     });
            // }
};

module.exports = {
    processGoTerms
};