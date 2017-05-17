/**
 * Created by JC on 16/05/2017.
 */

const getDescendingIndices = (matrix) => {
    let indices = [];

    for (let i = 0; i < matrix.length; i++) {
        indices.push(i);
    }

    indices.sort((a, b) => {
        return matrix[a] - matrix[b];
    });

    return indices;

};

module.exports = {
    getDescendingIndices
};