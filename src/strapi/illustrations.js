import {verifJWT} from "./verifJWT.js"
import qs from 'qs'

export function listeImages(userId, espaceId, tagId) {
    var url = "ADRESSE_CMS" + "illustrations?"
    var flagPremierParametre = true
    if (userId) {
        url = url + 'user=' + userId
        flagPremierParametre = false
    }
    if (espaceId) {
        if (flagPremierParametre) {
            url = url + 'espaces=' + espaceId
        } else {
            url = url + '&espaces=' + espaceId
        }
        flagPremierParametre = false
    }
    if (tagId) {
        if (flagPremierParametre) {
            url = url + 'tags=' + tagId
        } else {
            url = url + '&tags=' + tagId
        }
        flagPremierParametre = false 
    }
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

export function getLogo() {
   const url = "ADRESSE_CMS" + "illustrations/51"
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

export function listeImgByEspaceEtTagEtUser(espaceId, tagId, userId) {
    const url = "ADRESSE_CMS" + "illustrations?espaces=" + espaceId + "&tags=" + tagId + "&user=" + userId
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

export function listeIllustrationsOrphelines(tagId, userId) {
    const query = qs.stringify({ _where: { tags: tagId, user: userId } })
    const url = "ADRESSE_CMS" + "illustrations?" + query
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