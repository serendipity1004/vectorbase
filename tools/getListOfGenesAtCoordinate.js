/**
 * Created by JC on 02/06/2017.
 */
const http = require('http');
const util = require('util');
const fs = require('fs');
const csv = require('csvtojson');

const getListOfGenesAtCoordinate = (coordinate, csvFile) => {
    let targetUrl = `http://bio-iisrv2.bio.ic.ac.uk/popbio-map-preview/asolr/solr/genea_expression/smplTable?&q=(text:(*GO%5C:0044428*))&fq=geo_coords:[${coordinate}]&sort=id%20asc&callback=?&cursorMark=*&_=1496408531202&rows=10320`

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
            let parsedData = JSON.parse(rawData);
            let targetGenes = [];
            let genes = parsedData.response.docs;
            let allGenes = [];

            console.log(util.inspect(parsedData, false, null));

            for (let i = 0; i < genes.length; i++) {
                targetGenes.push(genes[i].accession);
            }

            console.log(util.inspect(targetGenes, false, null));

            let genesPromise = new Promise((resolve, reject) => {
                csv()
                    .fromFile(csvFile)
                    .on('csv', (csvRow) => {
                        allGenes.push(csvRow);
                    }).on('done', () => {
                    console.log('reading done')
                    resolve();
                })
            });

            Promise.all([genesPromise]).then(() => {
                console.log('promises done')
                let processedTerms = [];
                let allAverageMatrix = [];
                let targetAverageMatrix = [];
                let normalizedMatrix = [];

                for (let i = 1; i < allGenes[0].length; i++) {
                    let total = 0;
                    let count = 0;
                    for (let j = 0; j < allGenes.length; j++) {
                        let eachGene = allGenes[j][i];


                        if (eachGene !== '') {
                            total += parseFloat(eachGene);
                            count++
                        }
                    }
                    allAverageMatrix.push(total / count);
                }

                for (let i = 0; i < targetGenes.length; i++) {
                    for (let j = 0; j < allGenes.length; j++) {
                        if (targetGenes[i] === allGenes[j][0]) {
                            processedTerms.push(allGenes[j]);
                        }
                    }
                }

                console.log(util.inspect(processedTerms, false, null));
                console.log(`dimensions ${processedTerms.length} x ${processedTerms[0].length}`);

                console.log(processedTerms[335]);

                for (let i = 1; i < processedTerms[0].length; i++) {
                    let total = 0;
                    let number = 0;
                    let average = 0;
                    for (let j = 0; j < processedTerms.length; j++) {
                        if (processedTerms[j] === undefined){
                            console.log(`i : ${i} j : ${j}`)
                        }
                        let eachValue = processedTerms[j][i];

                        if (eachValue !== '') {
                            total += parseFloat(eachValue);
                            number++;
                        }
                    }

                    if (number !== 0){
                        average = total/number;
                    }
                    targetAverageMatrix.push(average);


                }

                console.log(targetAverageMatrix);
                console.log(allAverageMatrix);
                
                for (let i = 0; i < allAverageMatrix.length; i++){
                    normalizedMatrix.push([targetAverageMatrix[i], allAverageMatrix[i]])
                }
                
                let csvOutput = '';
                
                for (let i = 0; i < normalizedMatrix.length; i ++){
                    csvOutput += normalizedMatrix[i][0] + ', ' + normalizedMatrix[i][1];
                    csvOutput += '\n'
                }

                fs.appendFile('./results/geneExpression.csv', csvOutput, () => {
                    console.log('done')
                })
                
            })

        })
    })
};

module.exports = {
    getListOfGenesAtCoordinate
};