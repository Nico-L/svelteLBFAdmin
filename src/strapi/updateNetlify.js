import {verifJWT} from "./verifJWT.js"

export function buildSiteAtelier() {
    const url = "https://api.netlify.com/build_hooks/5e1f0dc8b38f91846de6fccd"
            /*const auth = "Bearer " + token
            var entetes = new Headers({"content-type": "application/json", "Authorization": auth})*/
    var options = { 
        method: 'POST',
        headers: entetes,
        mode: 'cors',
        cache: 'default',
    }
    return fetch(url, options)
        .then((leJSON)=> {return leJSON.json()})
        .then((retour)=> {return retour})
}