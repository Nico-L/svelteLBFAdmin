import { requeteGraphQL } from './gql.js'

export async function listeEspacesBF(auth, isAdmin, variables) {
    const query = `
            query espacesBF {
            __typename
            espaceBF {
                espace
            }
            }
            `
    return requeteGraphQL(auth, isAdmin, query, variables)
        .then((resultats)=> {
            return resultats.espaceBF
        })
}