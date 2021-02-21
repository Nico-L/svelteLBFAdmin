import {verifJWT} from "./verifJWT.js"

export function getMetadata(url) {
    const variables = {url: url}
    const urlQuery = "ADRESSE_CMS" + "getmetadata"
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
            return fetch(urlQuery, options)
                .then((leJSON)=> {return leJSON.json()})
                .then((retour)=> { return retour; })
        }
    )
}