/**
 * Created by JC on 16/05/2017.
 */
const {encode} = require('../geohash4/geohash4').GeoHash4;


const gridMaker = (size, geoLevel) => {

    let grid = [];

    for (let i = 0; i < size; i ++){
        grid.push([]);
        for (let j = 0; j < size; j ++){
            let hash = encode(i, j, geoLevel, 0, size);
            let obj = {};

            obj[hash] = [0,0];

            grid[i].push(obj)

        }
    }

    return grid;

    // console.log(grid);

    // let grid = [];
    // let stop = size;
    //
    // for (let i = 0; i < size; i++){
    //     grid.push([]);
    //     for (let j = 0; j < size; j++){
    //         grid[i].push('');
    //     }
    // }
    //
    // while(stop !== 1){
    //     let rowIndex = 0;
    //     let colIndex = 0;
    //
    //     while (rowIndex !== stop && colIndex !== stop){
    //         console.log('colIndex: ' + colIndex);
    //         console.log('rowIndex: ' + rowIndex);
    //         if (colIndex < stop/2 && rowIndex < stop/2){
    //             grid[colIndex][rowIndex] += 'a'
    //         } else if (colIndex < stop/2 && rowIndex >= stop/2){
    //             grid[colIndex][rowIndex] += 'b'
    //         } else if (colIndex >= stop/2 && rowIndex < stop/2){
    //             grid[colIndex][rowIndex] += 'c'
    //         } else {
    //             grid[colIndex][rowIndex] += 'd'
    //         }
    //
    //         if (colIndex === stop - 1){
    //             colIndex = 0;
    //             rowIndex ++;
    //         } else {
    //             colIndex ++;
    //         }
    //     }
    //
    //     stop /= 2
    // }
    //
    //
    // console.log(grid);
};

module.exports = {
    gridMaker
};