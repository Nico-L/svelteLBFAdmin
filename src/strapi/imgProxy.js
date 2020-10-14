import {verifJWT} from "./verifJWT.js"

export function imgProxyUrl(url, options) {
    console.log('url initiale', url)
    const variables = {
        url: url,
        resizing_type: options.resizing_type,
        width: options.width.toString(),
        height: options.height.toString(),
        gravity: options.gravity
    }
    const urlQuery = "ADRESSE_CMS" + "imgproxy"
    return verifJWT().then((token)=> 
        {
            const auth = "Bearer " + token
            var entetes = new Headers({"content-type": "application/json", "Authorization": auth})
            var options = { 
                method: 'POST',
                headers: entetes,
                mode: 'cors',
                cache: 'default',
                body: JSON.stringify(variables)
            }
            console.log('variables', variables)
            return fetch(urlQuery, options)
                .then((leJSON)=> {return leJSON.json()})
                .then((retour)=> { return retour; })
        }
    )
}