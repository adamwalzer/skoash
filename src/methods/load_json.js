import loadFile from './load_file.js';

export default function (file, callback) {
    return loadFile(file, callback, 'json');
}
