import {verifJWT} from "./verifJWT.js"
import qs from 'qs'

export function findIllu(id) {
    var url = "ADRESSE_CMS" + "illustrations/" + id

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

export function listeImages(userId, espaceId, tagId) {
    var url = "ADRESSE_CMS" + "illustrations?"
    var flagPremierParametre = true
    if (userId) {
        url = url + 'user=' + userId
        flagPremierParametre = false
    }
    if (espaceId) {
        if (flagPremierParametre) {
            url = url + 'espace=' + espaceId
        } else {
            url = url + '&espace=' + espaceId
        }
        flagPremierParametre = false
    }
    if (tagId) {
        if (flagPremierParametre) {
            url = url + 'tag=' + tagId
        } else {
            url = url + '&tag=' + tagId
        }
        flagPremierParametre = false 
    }
    if (flagPremierParametre) {
        url = url + '_sort=updated_at:desc'
    } else {
        url = url + '&_sort=updated_at:desc'
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
   const url = "ADRESSE_CMS" + "illustrations?tag.tag=logo"
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

export function listeImgByUuid(uuid) {
    const url = "ADRESSE_CMS" + "illustrations?uuid=" + uuid
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
    const query = qs.stringify({ _where: { tag: tagId, user: userId } })
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
            return fetch(urlImage, options)
                .then((leJSON)=> {return leJSON.json()})
                .then((retour)=> { return fetch(urlIllustration, options)})
                .then((leJSON)=> {return leJSON.json()})
                .then((retour2) => {console.log('retour efface image', retour2); return retour2})
        }
    )
}