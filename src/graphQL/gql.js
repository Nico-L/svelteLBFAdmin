export async function requeteGraphQL(auth, isAdmin, query, variables) {
    var retourResultat;
    var body = {query: query}
    if (variables!== undefined) {
        body.variables = variables
    }
    const entetes = {
        Authorization: 'Bearer ' + auth.token,
        'x-hasura-role': isAdmin ? 'admin': 'user'
    }
    var options = {
        method: "POST",
        headers: entetes,
        cache: "no-cache",
        body: JSON.stringify(body)
    }
    return auth.updateToken(5)
        .then( (refreshed) => {return fetch("https://graphql.labonnefabrique.fr/v1/graphql", options)})
        .then((retourFetch)=>{
            return retourFetch.json()
        })
        .then((retourJSON)=>{
            console.log('retourJSON', retourJSON)
            return retourJSON.data
        }).catch((error)=>{console.log('erreur', erreur)})
    }