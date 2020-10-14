import {verifJWT} from "./verifJWT.js"

export function listeImgByEspaceEtTag(espaceId, tagId) {
    const url = "ADRESSE_CMS" + "illustrations?espaces=" + espaceId + "&tags=" + tagId
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

export function effaceIllustration(data) {
    console.log('data inside function effacer', data)
    const urlIllustration = "ADRESSE_CMS" + "illustrations/" + data.illustrationId
    const urlImage = "ADRESSE_CMS" + "upload/files/" + data.imageId
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
            return fetch(urlIllustration, options)
                .then((leJSON)=> {return leJSON.json()})
                .then((retour)=> {return fetch(urlImage, options)})
                .then((leJSON)=> {return leJSON.json()})
                .then((retour) => {return retour})
        }
    )
}