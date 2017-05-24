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
                let countMatrix = [];

                let terms = parsedData.facet_counts.facet_fields.cvterms;
                console.log(terms)

                for (let i = 0; i < terms.length; i ++){
                    if (i % 2 === 0){
                        termsMatrix.push(terms[i].toUpperCase())
                    }else {
                        countMatrix.push(terms[i])
                    }
                }

                callback([termsMatrix, countMatrix]);

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