require('isomorphic-fetch');

let _cache = {};

export default function (file, callback, responseType = 'text') {
    if (_cache[file]) {
        callback(_cache[file]);
        return;
    }

    fetch(file)
    .then(response => {
        _.invoke(response, responseType).then(text => {
            if (response.status === 200) {
                _cache[file] = text;
                callback(text);
            } else {
                console.log('Error', text); // eslint-disable-line no-console
            }
        });
    });
}
