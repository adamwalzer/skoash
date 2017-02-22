import loadFile from './load_file.js';

export default function (file, callback) {
    let data = loadFile(file, callback, 'json');
    return _.isString(data) ? JSON.parse(data) : data;
}
