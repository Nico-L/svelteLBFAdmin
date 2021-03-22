export function verifJWT () {
    const url = "ADRESSE_CMS" + "token/decrypt"
    const redirect = window.location.pathname + window.location.search
    var userInfo = JSON.parse(localStorage.getItem('userInfo'))
    if (userInfo) {
        var entetes = new Headers({"content-type": "application/json"})
        var options = { 
            method: 'POST',
            headers: entetes,
            mode: 'cors',
            cache: 'default',
            body: JSON.stringify({
                token: userInfo.jwt
            })
        }
        return fetch(url, options)
            .then((leJSON) => {return leJSON.json()})
            .then((retourJWT)=> {
                if (retourJWT.message === "Error: Invalid token.") {
                    localStorage.removeItem('userInfo')
                    //window.location.assign(window.location.origin + '/login/?' + redirect)
                } else {
                    return userInfo.jwt
                }
            })
            .catch((erreur) => console.log('erreur', erreur))
    } else {
        localStorage.removeItem('userInfo')
        //window.location.assign(window.location.origin + '/login/?' + redirect)
    }
}