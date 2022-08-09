import {verifJWT} from "./verifJWT.js"

export function saveTexte(variables) {
    
    const url = "ADRESSE_CMS" + "text-accueils/" + variables.id
    console.log('var', url)
    return verifJWT().then((token)=> {
        const auth = "Bearer " + token
        var entetes = new Headers({"content-type": "application/json", "Authorization": auth})
        var options = { 
            method: 'PUT',
            headers: entetes,
            mode: 'cors',
            cache: 'default',
            body: JSON.stringify(variables)
        }
        return fetch(url, options)
                .then((leJSON) => {return leJSON.json()})
                .then((retour) => {return retour})
    })
}

export function loadTexte() {
    const url = "ADRESSE_CMS" + "text-accueils/1"
    return verifJWT().then((token)=> {
        const auth = "Bearer " + token
        var entetes = new Headers({"content-type": "application/json", "Authorization": auth})
        var options = { 
            method: 'GET',
            headers: entetes,
            mode: 'cors',
            cache: 'default'
        }
        return fetch(url, options)
                .then((leJSON) => {return leJSON.json()})
                .then((retour) => {return retour})
    })
}