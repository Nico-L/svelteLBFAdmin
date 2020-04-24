import { requeteGraphQL } from './gql.js'

export async function listeIllustrationsByEspace(auth, isAdmin, variables) {
    const query = `
            query listeIllustrationFSelonEspace($espace: espaceBF_enum, $typeIllustration: TypeIllustration_enum) {
            __typename
            illustrations(where: {espace: {_eq: $espace}, _and: {typeIllustration: {_eq: $typeIllustration}}}) {
                id
                idImage
                format
            }
            }
            `
    return requeteGraphQL(auth, isAdmin, query, variables)
    .then((resultats)=> {
        return resultats.illustrations
    })
}

export async function ajoutIllustration(auth, isAdmin, variables) {
    const query = `
            mutation insert_illustration(
                $idImage: String!
                $format: String!
                $espace: espaceBF_enum!
                $typeIllustration: TypeIllustration_enum!
            ) {
                __typename
                insert_illustrations(
                objects: {
                    format: $format
                    idImage: $idImage
                    espace: $espace
                    typeIllustration: $typeIllustration
                }
                ) {
                returning {
                    id
                }
                }
            }
            `
    return requeteGraphQL(auth, isAdmin, query, variables)
    .then((resultats)=> {
        return resultats.insert_illustrations
    })
}

export async function effaceCloudinary(auth, isAdmin, variables) {
    const query = `
            query effaceImage($imageId: String!) {
                effaceImage(imageId: $imageId) {
                message
                }
            }
            `
    return requeteGraphQL(auth, isAdmin, query, variables)
    .then((resultats)=> {
        return resultats.effaceImage
    })
}

export async function effaceIllustration(auth, isAdmin, variables) {
    const query = `
            mutation deleteIllu($id: uuid!) {
                __typename
                delete_illustrations(where: { id: { _eq: $id } }) {
                returning {
                    id
                }
                }
            }
            `
    return requeteGraphQL(auth, isAdmin, query, variables)
    .then((resultats)=> {
        return resultats.delete_illustrations
    })
}
