export function pixabayListe(variables) {
    const url = "ADRESSE_CMS" + "pixabay"
    var entetes = new Headers({"content-type": "application/json"})
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

export function savePixabayImage(url) {
    return fetch(url).then(res => res.blob()).then((blob) => {return blob})
}
/*export function savePixabayImage(variables) {
    const url = "ADRESSE_CMS" + "pixabay/save"
    var entetes = new Headers({"content-type": "application/json"})
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
}*/

/*export function pixabayListe(variables) {
    variables.key = encodeURIComponent("20690716-08ed473364b730397197d1b00")
    const url = "https://pixabay.com/api/?key=" + variables.key + "&q=" + variables.q
    //const url = "https://pixabay.com/api"
    var entetes = new Headers({"content-type": "text/html"})
    var options = { 
        method: 'GET',
        headers: entetes
        }
    return fetch(url, options)
        .then((leJSON)=> {return leJSON.json()})
        .then((retour)=> {return retour}).catch((err) => console.log('err', err))
}*/