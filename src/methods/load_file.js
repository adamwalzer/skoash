require('isomorphic-fetch');

export default function (file, callback, responseType = 'text') {
    if (!skoash) skoash = {};
    if (!skoash._cache) skoash._cache = {};

    if (skoash._cache[file]) {
        callback(skoash._cache[file]);
        return;
    }

    fetch(file)
    .then(response => {
        _.invoke(response, responseType).then(text => {
            if (response.status === 200) {
                skoash._cache[file] = text;
                callback(text);
            } else {
                console.log('Error', text); // eslint-disable-line no-console
            }
        });
    });
}
