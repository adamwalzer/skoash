import loadFile from './load_file';

export default function (file, callback) {
    loadFile(file, data => {
        callback(_.isString(data) ? JSON.parse(data) : data);
    }, 'json');
}
