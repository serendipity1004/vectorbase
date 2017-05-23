/**
 * Created by JC on 23/05/2017.
 */
const http = require('http');


const getGoTermDetails = (goTerm, callback) => {

    let targetUrl = `http://www.ebi.ac.uk/QuickGO/GTerm?id=${goTerm}&format=json`;

    console.log(targetUrl);

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
            let result = JSON.parse(rawData);
            let ontology = result.termInfo.info.ontology;
            let detail = result.termInfo.info.name;
            let editedDetail = detail.split(',').join(' /');

            callback([ontology, editedDetail])
        })

    })
}

module.exports = {
    getGoTermDetails
}