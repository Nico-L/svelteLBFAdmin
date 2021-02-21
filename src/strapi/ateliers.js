import {verifJWT} from "./verifJWT.js"

export function nombreInscrits(atelierId) {
    const url = "ADRESSE_CMS" + "inscriptions-ateliers/count/?atelier_eq=" + atelierId
    var entetes = {"content-type": "application/json"}
    var options = { 
        method: 'GET',
        headers: entetes,
        mode: 'cors',
        cache: 'default'
    }
    return fetch(url, options)
            .then((leJSON) => {return leJSON.json()})
            .then((retour) => {return retour})
}

export function listeAteliers() {
    const url = "ADRESSE_CMS" + "ateliers"
    return verifJWT().then((token)=> 
        {
            const auth = "Bearer " + token
            var entetes = new Headers({"content-type": "application/json", "Authorization": auth})
            var options = { 
                method: 'GET',
                headers: entetes,
                mode: 'cors',
                cache: 'default',
            }
            return fetch(url, options)
                .then((leJSON)=> {return leJSON.json()})
                .then((retour)=> {return retour})
        }
    )
}

export function listeAteliersFuturs(sortDate = null, limite = 0) {
    const now = (new Date()).toISOString()
    var url = "ADRESSE_CMS" + "ateliers?date_gte=" + now
    if (sortDate && sortDate !== "") url += "&_sort=date:" + sortDate
    if (limite && limite > 0) url += "&_limit=" + limite
    return verifJWT().then((token)=> 
        {
            const auth = "Bearer " + token
            var entetes = new Headers({"content-type": "application/json", "Authorization": auth})
            var options = { 
                method: 'GET',
                headers: entetes,
                mode: 'cors',
                cache: 'default',
            }
            return fetch(url, options)
                .then((leJSON)=> {return leJSON.json()})
                .then((retour)=> {return retour})
        }
    )
}


export function listeAteliersArchives() {
    const maintenant = (new Date()).toISOString()
    const url = "ADRESSE_CMS" + "ateliers?date_lte=" + maintenant + "&_sort=date:desc"
    return verifJWT().then((token)=> 
        {
            const auth = "Bearer " + token
            var entetes = new Headers({"content-type": "application/json", "Authorization": auth})
            var options = { 
                method: 'GET',
                headers: entetes,
                mode: 'cors',
                cache: 'default',
            }
            return fetch(url, options)
                .then((leJSON)=> {return leJSON.json()})
                .then((retour)=> {return retour})
        }
    )
}

export function supprimerAtelier(id) {
    const url = "ADRESSE_CMS" + "ateliers/" + id
    return verifJWT().then((token)=> 
        {
            const auth = "Bearer " + token
            var entetes = new Headers({"content-type": "application/json", "Authorization": auth})
            var options = { 
                method: 'DELETE',
                headers: entetes,
                mode: 'cors',
                cache: 'default',
            }
            return fetch(url, options)
                .then((leJSON)=> {return leJSON.json()})
                .then((retour)=> {return retour})
        }
    )
}

export function ajouterAtelier(variables) {
    const url = "ADRESSE_CMS" + "ateliers"
    return verifJWT().then((token)=> {
        const auth = "Bearer " + token
        var entetes = new Headers({"content-type": "application/json", "Authorization": auth})
        var options = { 
            method: 'POST',
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

export function editerAtelier(id, variables) {
    const url = "ADRESSE_CMS" + "ateliers/" + id
    return verifJWT().then((token) => {
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

export function listeInscrits(atelierId) {
    const url = "ADRESSE_CMS" + "inscriptions-ateliers?atelier_eq=" + atelierId
    return verifJWT().then((token) => {
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

export function saveNouvelInscrit(variables) {
    const url = "ADRESSE_CMS" + "inscriptions-ateliers"
    return verifJWT().then((token)=> {
        const auth = "Bearer " + token
        var entetes = new Headers({"content-type": "application/json", "Authorization": auth})
        var options = { 
            method: 'POST',
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

export function majInscrit(variables) {
    const url = "ADRESSE_CMS" + "inscriptions-ateliers/" + variables.id
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

export function effacerInscription(inscripionId) {
    const url = "ADRESSE_CMS" + "inscriptions-ateliers/" + inscripionId
    return verifJWT().then((token)=> {
        const auth = "Bearer " + token
        var entetes = new Headers({"content-type": "application/json", "Authorization": auth})
        var options = { 
            method: 'DELETE',
            headers: entetes,
            mode: 'cors',
            cache: 'default'
        }
        return fetch(url, options)
                .then((leJSON) => {return leJSON.json()})
                .then((retour) => {return retour})
    })
}