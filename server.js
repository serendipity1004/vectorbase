/**
 * Created by JC on 24/04/2017.
 */
const express = require('express');
const cluster = require('cluster');
const numCPUs = require('os').cpus().length;

const {getData} = require('./tools/getData');


if (cluster.isMaster) {

    console.log(`Master ${process.pid} is running`);

    for (let i = 0; i < numCPUs; i++) {
        cluster.fork();
    }

    cluster.on('exit', (worker, code, signal) => {
        console.log(`worker ${worker.process.pid} died`);
    });

} else {
    const {moransICalc} = require('./tools/morans');

    let app = express();

    //Get background

    let backgroundMatrix = [];
    for (let i = 2; i < 6; i++){
        let targetUrl = `http://vb-dev.bio.ic.ac.uk:7997/solr/genea_expression/smplGeoclust?q=*:*&stats.facet=geohash_${i}`;
        let geohash = `geohash_${i}`;

        getData(targetUrl, geohash, true, (result) => {
            backgroundMatrix[i-2] = result;
        });
    }

    //get Target

    app.get('/morans/', (req, res) => {

        let geoLevel = req.query.geohash;
        let geohash = `geohash_${geoLevel}`;
        let field = req.query.field;
        let value = req.query.value;

        let targetUrl = `http://vb-dev.bio.ic.ac.uk:7997/solr/genea_expression/smplGeoclust?q=${field}:${value}&stats.facet=${geohash}`;

        getData(targetUrl, geohash, false, (result) => {

            let backgroundCounts = backgroundMatrix[geoLevel-2][0];
            let distanceMatrix = backgroundMatrix[geoLevel-2][1];

            let normalizedCounts = [];

            console.log(result);
            console.log(backgroundCounts);

            backgroundCounts.forEach((backgroundItem) => {
                let pass = false;
                result.forEach((targetItem) => {
                    if (backgroundItem.hash === targetItem.hash) {
                        // normalizedCounts.push(targetItem.count/backgroundItem.count);
                        normalizedCounts.push(targetItem.count);
                        pass = true;
                    }
                });

                if (!pass) {
                   normalizedCounts.push(0);
                }
            });

            let moransI = moransICalc(distanceMatrix, normalizedCounts, true);

            console.log(moransI);

        });
    });

    app.listen(3000, () => {
        console.log(`worker ${process.pid} started`)
    });

}