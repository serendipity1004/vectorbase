/**
 * Created by JC on 29/04/2017.
 */
const {getGoTerms} = require('./getGoTerms');
const {returnData} = require('./returnData');
const fs = require('fs');

const processGoTerms = (geohash, geoLevel, backgroundMatrix, inverse, goTerms, callback) => {
    let csv = '';
    let promises = [];
    let moransMatrix = {};

    goTerms.forEach((term) => {
        moransMatrix[term] = '';
    });

    goTerms.forEach((term) => {
        let targetUrl = `http://vb-dev.bio.ic.ac.uk:7997/solr/genea_expression/smplGeoclust?q=cvterms:"${term}"&stats.facet=${geohash}`;
        let promise = new Promise((resolve, reject) => {
            returnData(targetUrl, geohash, geoLevel, false, backgroundMatrix, inverse, (morans) => {
                csv += `${term}, ${morans.observedI}\n`;

                for (let matrixTerm in moransMatrix) {
                    if (matrixTerm === term) {
                        moransMatrix[matrixTerm] = morans.observedI;
                    }
                }
                resolve();
            })
        });
        promises.push(promise);
    });
    Promise.all(promises).then(() => {
        callback(moransMatrix)
    });
};

module.exports = {
    processGoTerms
};