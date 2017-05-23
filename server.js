/**
 * Created by JC on 24/04/2017.
 */
const express = require('express');
const cluster = require('cluster');
const numCPUs = require('os').cpus().length;
const http = require('http');
const fs = require('fs');
const async = require('async');
const util = require('util');
// const {eachLimit} = require('async/eachLimit');

const {getData} = require('./tools/getData');
const {processData} = require('./tools/processData');
const {processGoTerms} = require('./tools/processGoTerms');
const {getGoTerms} = require('./tools/getGoTerms');
const {getGoTermDetails} = require('./tools/getGoTermDetails');


if (cluster.isMaster) {

    console.log(`Master ${process.pid} is running`);

    for (let i = 0; i < 1; i++) {
        cluster.fork();
    }

    cluster.on('exit', (worker, code, signal) => {
        console.log(`worker ${worker.process.pid} died`);
    });

} else {
    let app = express();

    //Get background

    let backgroundGrid = [];
    let goTermsMatrix = [];
    let moransMatrix = {};
    let baseUrl = 'http://localhost:7997/solr/genea_expression/select?indent=on&q=*:*&wt=json&rows=10320';
    let promises = [];

    for (let i = 2; i < 6; i++) {
        let targetUrl = `http://localhost:7997/solr/genea_expression/smplGeoclust?q=*:*&stats.facet=geohash_${i}&rows=10320`;
        let geohash = `geohash_${i}`;

        let getDataPromise = new Promise((resolve, reject) => {
            getData(targetUrl, geohash, true, (result) => {
                backgroundGrid[i - 2] = result;
                resolve();
            });
        });

        promises.push(getDataPromise);
    }

    let getGoTermsPromise = new Promise((resolve, reject) => {
        getGoTerms(baseUrl, (result) => {
            goTermsMatrix = result;
            goTermsMatrix.forEach((term) => {
                if (term.length == 0) {
                    reject();
                }
                moransMatrix[term] = [];
            });
            resolve();
        });
    });

    promises.push(getGoTermsPromise);

    let count = 0;

    let detailsAsync = (term, callback) => {

        getGoTermDetails(term, (result) => {
            moransMatrix[term][0] = result[0];
            moransMatrix[term][1] = result[1];
            console.log(`${term} ready`)
            console.log(count++)
            callback(null, '');
        })
    }

    Promise.all(promises).then(() => {
        console.log('go term matrix ready')
        async.eachLimit(goTermsMatrix, 100, detailsAsync, (err) => {
            if (err) {
                console.log(err)
            }

            console.log('details ready...');
        })

        console.log(`worker ${process.pid} is ready...`);
        console.log(goTermsMatrix.length);
    });

    app.get('/morans/test', (req, res) => {
        console.log(`start test request`);
        let targetUrl = `http://localhost:7997/solr/genea_expression/smplGeoclust?q=cvterms:"GO:0003674"&stats.facet=geohash_3&rows=10320`;
        let i = 0;
        let promises = [];

        console.log(`making request ${i}`);


        for (let i = 0; i < 200; i++) {
            setTimeout(
                () => {
                    let testReq = new Promise((resolve, reject) => {
                        http.get(targetUrl, (result) => {
                            result.on('data', (chunk) => {
                                console.log(`working ${i}`);
                            }).on('end', () => {
                                console.log(`ending ${i}`);
                                resolve();
                            }).on('error', (err) => {
                                console.log(`this is error message ${err}`);
                            })
                        })
                    });

                    promises.push(testReq);

                    if (promises.length == 200) {
                        Promise.all(promises).then(() => {
                            console.log('done');
                        })
                    }
                }, 50 * i
            )
        }
    });


    //get Target

    app.get('/morans/all', (req, res) => {
            let queryLevel = parseInt(req.query.geohash) + 1;
            let inverse = req.query.inverse == 'true' ? true : false;
            let promises = [];
            let csv = '';
            let asyncParameters = [];
            let count = 0;


            console.log('start GET /all request');

            for (let i = 2; i < queryLevel; i++) {
                let geohash = `geohash_${i}`;
                for (let j = 0; j < goTermsMatrix.length; j++) {
                    let targetUrl = `http://localhost:7997/solr/genea_expression/smplGeoclust?q=cvterms:"${goTermsMatrix[j]}"&stats.facet=${geohash}&rows=10320`
                    asyncParameters.push([targetUrl, geohash, i, goTermsMatrix[j]])
                }
            }

            let eachAsync = (inputParameters, callback) => {

                console.log('starting eachasync')

                let geohash = inputParameters[1];
                let i = inputParameters[2];
                let goTerm = inputParameters[3];

                processGoTerms(geohash, i, backgroundGrid, inverse, goTerm, (result) => {

                    for (let item in moransMatrix) {
                        if (item === result[1]) {
                            moransMatrix[item][result[2]] = result[0].observedI;
                        }
                    }
                    console.log(`Count : ${count++}, Term : ${result[1]}, I : ${result[0].observedI}, level : ${result[2]}`)
                    callback(null, '');
                })
            }


            async.eachLimit(asyncParameters, 50, eachAsync, (err) => {
                if (err) {
                    console.log(err)
                }

                console.log('requests finished')

                let result = '';

                for (let item in moransMatrix) {
                    let write = '';
                    result += `${item}`;
                    write += `${item}`;
                    moransMatrix[item].forEach((value) => {
                        result += `, ${value}`;
                    });
                    result += '\n';
                }

                console.log('result is')
                console.log(result)
                fs.writeFile('./results/result.txt', result);
            });


        }
    )
    ;

    app.get('/morans/', (req, res) => {
        let geoLevel = req.query.geohash;
        let geohash = `geohash_${geoLevel}`;
        let field = req.query.field;
        let value = req.query.value;
        let inverse = req.query.inverse == 'true' ? true : false;
        // console.log(inverse);

        let targetUrl = `http://localhost:7997/solr/genea_expression/smplGeoclust?q=${field}:${value}&stats.facet=${geohash}&rows=10320`;
        console.log(targetUrl);
        console.log(geohash);

        processData(targetUrl, geohash, geoLevel, false, backgroundGrid, inverse, (morans) => {
            res.send(morans[0]);
            console.log(morans[0]);
        })
    });

    app.listen(3000, () => {
        console.log(`worker ${process.pid} started`)
    }).on('error', (err) => {
        console.log(`Caught error : ${err}`);
    });

    process.on('uncaughtException', (err) => {
        console.log(err)
    })

}