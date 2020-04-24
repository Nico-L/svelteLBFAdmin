import { requeteGraphQL } from './gql.js'

export async function getBuildNeeded(auth, isAdmin, variables) {
    const query = `query testBuild {
            buildNeeded(where: {espace: {_eq: "atelier"}}) {
                buildNeeded
            }}
            `
    return requeteGraphQL(auth, isAdmin, query, variables)
        .then((resultats)=> {
            return resultats.buildNeeded
        })
}

export async function setBuildNeeded(auth, isAdmin, variables) {
    const query = `mutation setTestBuild($buildNeeded: Boolean) {
            update_buildNeeded(where: {espace: {_eq: "atelier"}}, _set: {buildNeeded: $buildNeeded}) {
                affected_rows
            }
            }
            `
    return requeteGraphQL(auth, isAdmin, query, variables)
        .then((resultats)=> {
            return resultats.update_buildNeeded
        })
}