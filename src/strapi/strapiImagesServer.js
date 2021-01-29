export const strapiUpload = (token, data) => ({
    process: (fieldName, file, metadata, load, error, progress, abort) => {
        console.log('data', data)
        // `fieldName` and `meta` are not used for now
        const url = `https://cms.labonnefabrique.fr/illustrations`;
        const xhr = new XMLHttpRequest();
        const formData = new FormData();

        xhr.open('POST', url);
        //xhr.setRequestHeader('X-Requested-With', 'XMLHttpRequest');
        xhr.setRequestHeader('Authorization', 'Bearer ' + token);

        xhr.upload.addEventListener('progress', e => {
            progress(e.lengthComputable, e.loaded, e.total);
        });

        xhr.onreadystatechange = e => {

            if (xhr.readyState !== 4) {
                return;
            }
            console.log('xhr', xhr)

            if (xhr.status >= 200 && xhr.status < 300) {
                const response = JSON.parse(xhr.responseText);
                console.log('response', response)
                load(response.public_id);
                return;
            }

            error('oh no!');
        };

        //formData.append('upload_preset', unsignedUploadPreset);
        //formData.append('tags', 'browser_upload');
        formData.append('files.illustration', file);
        formData.append('data', JSON.stringify(data))
        //formData.append('api_key', CLOUDINARY_API_KEY) // Replace API key with your own Cloudinary key
        //formData.append('timestamp', (Date.now() / 1000) | 0)
        xhr.send(formData);
        
        return {
            abort: () => {
                xhr.abort();
            }
        }
    },
    revert: null
});