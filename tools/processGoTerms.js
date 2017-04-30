/**
 * Created by JC on 29/04/2017.
 */
const {getGoTerms} = require('./getGoTerms');
const {returnData} = require('./returnData');
const fs = require('fs');

const processGoTerms = (baseUrl, geohash, geoLevel, backgroundMatrix, inverse, callback) => {
    let csv = '';
    getGoTerms(baseUrl, (result) => {
        result.forEach((term) => {
            let targetUrl = `http://vb-dev.bio.ic.ac.uk:7997/solr/genea_expression/smplGeoclust?q=cvterms:"${term}"&stats.facet=${geohash}`;
            returnData(targetUrl, geohash, geoLevel, false, backgroundMatrix, inverse, (morans) => {
                csv += `${term}, ${morans.observedI}`;
                console.log(`${term}, ${morans.observedI}`);
            })
        });
        callback(csv);
    })
};

module.exports = {
    processGoTerms
};