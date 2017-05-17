/**
 * Created by JC on 16/05/2017.
 */
const {encode} = require('../geohash4/geohash4').GeoHash4;


const gridMaker = (size, geoLevel, empty) => {

    let grid = [];

    if (!empty){
        for (let i = 0; i < size; i ++){
            grid.push([]);
            for (let j = 0; j < size; j ++){
                let hash = encode(i, j, geoLevel, 0, size);
                let obj = {};

                obj[hash] = [0,0];

                grid[i].push(obj)

            }
        }
    } else {
        for (let i = 0; i < size; i ++){
            grid.push([]);
            for (let j = 0; j < size; j ++){
                let hash = encode(i, j, geoLevel, 0, size);
                grid[i].push(0)
            }
        }
    }


    return grid;
};

module.exports = {
    gridMaker
};