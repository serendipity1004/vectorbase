/**
 * Created by JC on 24/04/2017.
 */
const express = require('express');
const cluster = require('cluster');
const numCPUs = require('os').cpus().length;

const {getData} = require('./tools/getData');
const {returnData} = require('./tools/returnData');
const {processGoTerms} = require('./tools/processGoTerms');
const {getGoTerms} = require('./tools/getGoTerms');


if (cluster.isMaster) {

    console.log(`Master ${process.pid} is running`);

    for (let i = 0; i < numCPUs; i++) {
        cluster.fork();
    }

    cluster.on('exit', (worker, code, signal) => {
        console.log(`worker ${worker.process.pid} died`);
    });

} else {
    let app = express();

    //Get background

    let backgroundMatrix = [];
    let goTermsMatrix = [];
    let moransMatrix = {};
    let baseUrl = 'http://vb-dev.bio.ic.ac.uk:7997/solr/genea_expression/select?indent=on&q=*:*&wt=json';
    let promises = [];

    for (let i = 2; i < 6; i++) {
        let targetUrl = `http://vb-dev.bio.ic.ac.uk:7997/solr/genea_expression/smplGeoclust?q=*:*&stats.facet=geohash_${i}`;
        let geohash = `geohash_${i}`;

        let getDataPromise = new Promise((resolve, reject) => {
            getData(targetUrl, geohash, true, (result) => {
                backgroundMatrix[i - 2] = result;
                resolve();
            });
        });

        promises.push(getDataPromise);
    }

    let getGoTermsPromise = new Promise((resolve, reject) => {
        getGoTerms(baseUrl, (result) => {
            goTermsMatrix = result;
            goTermsMatrix.forEach((term) => {
                moransMatrix[term] = [];
            });
            resolve();
        });
    });

    promises.push(getGoTermsPromise);

    Promise.all(promises).then(() => {
        console.log(`worker ${process.pid} is ready...`)
    });

    //get Target

    app.get('/morans/all', (req, res) => {
        let queryLevel = parseInt(req.query.geohash) + 1;
        let inverse = req.query.inverse !== 'false' ? true : false;
        let promises = [];
        let csv = '';

        console.log('start GET /all request');

        for (let i = 2; i < queryLevel; i++) {
            let geohash = `geohash_${i}`;

            let promise = new Promise((resolve, reject) => {
                processGoTerms(geohash, i, backgroundMatrix, inverse, goTermsMatrix, (result) => {
                    // console.log(result);

                    for (let item in result) {
                        moransMatrix[item][i-2] = result[item];
                    }

                    resolve();

                })
            });

            promises.push(promise);
        }

        Promise.all(promises).then(() => {
            res.send(moransMatrix);
        });

    });

    app.get('/morans/', (req, res) => {
        let geoLevel = req.query.geohash;
        let geohash = `geohash_${geoLevel}`;
        let field = req.query.field;
        let value = req.query.value;
        let inverse = req.query.inverse !== 'false' ? true : false;
        let getAll = req.query.all !== 'false' ? true : false;

        let targetUrl = `http://vb-dev.bio.ic.ac.uk:7997/solr/genea_expression/smplGeoclust?q=${field}:${value}&stats.facet=${geohash}`;
        console.log(targetUrl);
        console.log(geohash);

        returnData(targetUrl, geohash, geoLevel, false, backgroundMatrix, inverse, (morans) => {

            console.log(morans);
        })

    });

    app.listen(3000, () => {
        console.log(`worker ${process.pid} started`)
    });

}