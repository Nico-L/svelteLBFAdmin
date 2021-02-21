import {verifJWT} from "./verifJWT.js"

export function listeReservations() {
    const url = "ADRESSE_CMS" + "reservations-machines"
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

export function listeReservationsFutures(sortDate = null, limite = 0) {
    const now = (new Date()).toISOString()
    var url = "ADRESSE_CMS" + "reservations-machines?date_gte=" + now
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

export function sauveReservation(variables) {
        const url = "ADRESSE_CMS" + "reservations-machines"
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
            return fetch(url, options)
                .then((leJSON)=> {return leJSON.json()})
                .then((retour)=> {return retour})
        }
    )
}

export function majReservation(resaId, variables) {
    const url = "ADRESSE_CMS" + "reservations-machines/" + resaId
    return verifJWT().then((token)=> 
        {
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
                .then((leJSON)=> {return leJSON.json()})
                .then((retour)=> {console.log('retour maj resa', retour);return retour})
        }
    )
}

export function effaceReservation(resaId) {
    const url = "ADRESSE_CMS" + "reservations-machines/" + resaId
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