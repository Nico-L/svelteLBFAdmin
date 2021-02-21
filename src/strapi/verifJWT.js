export function verifJWT () {
    const url = "ADRESSE_CMS" + "token/decrypt"
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
                    window.location.replace(window.location.origin + '/login')
                } else {
                    return userInfo.jwt
                }
            })
            .catch((erreur) => console.log('erreur', erreur))
    } else {
        localStorage.removeItem('userInfo')
        window.location.replace(window.location.origin + '/login')
    }
}