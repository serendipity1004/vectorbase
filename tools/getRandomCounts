const http = require('http');

const getRandomCounts = (numberOfGenes, geohash, callback) => {
    let start = new Date();

    let seed = Math.random().toString(36).substring(10);
    console.log(seed);
    let targetUrl = `http://vb-dev.bio.ic.ac.uk:7997/solr/genea_expression/select?indent=on&q=*:*&rows=${numberOfGenes}&fl=${geohash}&wt=json&sort=random_${seed}%20desc`

    http.get(targetUrl, (res) => {
        let receivedResult = new Date();

        const {statusCode} = res;

        let error;
        if (statusCode !== 200) {
            error = new Error(`Request failed \n` +
                `Status Code : ${statusCode}`)
        }

        if (error) {
            console.error(error.message);
            res.resume();
            return;
        }

        res.setEncoding('utf8');
        let rawData = '';
        res.on('data', (chunk) => {
            rawData += chunk;
        }).on('end', () => {
            let dataEnded = new Date();

            let result = JSON.parse(rawData);
            let genes = result.response.docs;
            let countMatrix = [];

            for (let i = 0; i < genes.length; i++) {
                let pass = false;
                let position = genes[i][geohash];
                for (let j = 0; j < countMatrix.length; j++) {
                    if (countMatrix[j].hash == position) {
                        countMatrix[j].count++;
                        pass = true;
                        break;
                    }
                }
                if (!pass) {
                    countMatrix.push({hash: position, count: 1})
                }
            }
            let end = new Date();
            callback(countMatrix)
        })
    })
};

module.exports = {
    getRandomCounts
};