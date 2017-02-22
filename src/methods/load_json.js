import loadFile from './load_file.js';

export default function (file, callback) {
    loadFile(file, data => {
        callback(_.isString(data) ? JSON.parse(data) : data);
    }, 'json');
}
