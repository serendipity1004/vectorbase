/**
 * Created by JC on 29/04/2017.
 */
const http = require('http');

const getGoTerms = (targetUrl, callback) => {

    http.get(targetUrl, (res) => {

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

            let result = [];

            try {
                let parsedData = JSON.parse(rawData);
                let termsMatrix = [];

                let targets = parsedData.response.docs;

                targets.forEach((gene) => {
                    let terms = gene.cvterms;
                    if (terms !== undefined && terms.length !== 0) {
                        terms.forEach((term) => {
                            termsMatrix.push(term);
                        })
                    }
                });

                let reducedMatrix = termsMatrix.reduce((acc, val) => {
                    if (acc.indexOf(val) < 0 ) {
                        acc.push(val);
                    }
                    return acc;
                }, []);

                callback(reducedMatrix);

            } catch (e) {
                console.error(e.message);
                callback([]);
            }
        }).on('error', (err) => {
            console.log(err.message);
        })
    })
};

module.exports = {
    getGoTerms
};