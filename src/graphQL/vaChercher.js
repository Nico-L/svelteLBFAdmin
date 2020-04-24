export async function requeteGraphQL(auth, isAdmin, query, variables) {
    console.log('pif')
        var retourResultat;
    await auth.updateToken(5)
    .then(async function(refreshed) {
        const entetes = {
            Authorization: 'Bearer ' + auth.token,
            'x-hasura-role': isAdmin ? 'admin': 'user'
        }
        retourResultat = await vaChercher(query, entetes, variables)
    }
    ).catch(function() {
        alert('Failed to refresh the token, or the session has expired');
        retourResultat = undefined
    });
    console.log('requete', retourResultat)
return retourResultat!==undefined?retourResultat:undefined
    }

export async function vaChercher(query, entetes, variables) {
    var body = {query: query}
    if (variables!== undefined) {
        body.variables = variables
    }
    var options = {
        method: "POST",
        headers: entetes,
        cache: "no-cache",
        body: JSON.stringify(body)
    }
    return await fetch("https://graphql.labonnefabrique.fr/v1/graphql", options)
        .then(async retour => {
            let resultat = await retour.json();
            console.log('retour VaChercher', resultat)
            return resultat.data
        }).catch((error)=>{console.log('erreur va chercher', error)})
}