export const strapiUpload = (token, data) => ({
    process: (fieldName, file, metadata, load, error, progress, abort) => {
        const url = `https://cms.labonnefabrique.fr/illustrations`;
        const xhr = new XMLHttpRequest();
        const formData = new FormData();

        xhr.open('POST', url);
        xhr.setRequestHeader('Authorization', 'Bearer ' + token);

        xhr.upload.addEventListener('progress', e => {
            progress(e.lengthComputable, e.loaded, e.total);
        });

        xhr.onreadystatechange = e => {

            if (xhr.readyState !== 4) {
                return;
            }

            if (xhr.status >= 200 && xhr.status < 300) {
                const response = JSON.parse(xhr.responseText);
                load(response.public_id);
                return response;
            }

            error('oh no!');
        };
        formData.append('files.media', file);
        formData.append('data', JSON.stringify(data))
        xhr.send(formData);
        
        return {
            abort: () => {
                xhr.abort();
            }
        }
    },
    revert: null
});