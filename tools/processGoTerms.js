/**
 * Created by JC on 29/04/2017.
 */
const {getGoTerms} = require('./getGoTerms');
const {processData} = require('./processData');
const fs = require('fs');

const processGoTerms = (geohash, geoLevel, backgroundMatrix, inverse, goTerms, callback) => {
    let csv = '';
    let promises = [];
    let moransMatrix = {};
    let count = 0;

    goTerms.forEach((term) => {
        moransMatrix[term] = '';
    });

    goTerms.forEach((term, i) => {

        setTimeout(() => {
            let targetUrl = `http://vb-dev.bio.ic.ac.uk:7997/solr/genea_expression/smplGeoclust?q=cvterms:"${term}"&stats.facet=${geohash}&rows=10320`;

            let promise = new Promise((resolve, reject) => {
                processData(targetUrl, geohash, geoLevel, false, backgroundMatrix, inverse, (result) => {
                    let morans = result[0];
                    let goTerm = result[1];
                    csv += `${goTerm}, ${morans.observedI}\n`;
                    console.log(morans.observedI);
                    console.log(`morans count = ${count}`);
                    count++;

                    for (let matrixTerm in moransMatrix) {
                        if (matrixTerm === goTerm) {
                            moransMatrix[goTerm] = morans.observedI;
                        }
                    }
                    resolve();
                })
            });

            promises.push(promise);

            if (goTerms.length - 1 === i){
                Promise.all(promises).then(() => {
                    callback(moransMatrix)
                });
            }
        }, 200 * i);
    });

};

module.exports = {
    processGoTerms
};