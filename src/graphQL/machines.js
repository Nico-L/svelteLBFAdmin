import { requeteGraphQL } from './gql.js'

export async function listeAbonnements(auth, isAdmin, variables) {
    const query = `
        query listeMachines($typeTarif: String!) {
            machines(where: { lesTarifs: { _has_key: $typeTarif } }) {
            id
            lesTarifs
            }
        }
        `
    return requeteGraphQL(auth, isAdmin, query, variables).then((resultats)=> {return resultats.machines[0].lesTarifs.abonnement})
}

export async function sauveAbonnements(auth, isAdmin, variables) {
    const query = `
            mutation modifAbonnements($lesTarifs: jsonb, $typeTarif: String!) {
                update_machines(
                where: { lesTarifs: { _has_key: $typeTarif } }
                _set: { lesTarifs: $lesTarifs }
                ) {
                returning {
                    id
                }
                }
            }
            `
    return requeteGraphQL(auth, isAdmin, query, variables)
        .then((resultats)=> {return resultats.update_machines})
}

export async function majPlagesHoraires(auth, isAdmin, variables) {
    const query = `
            mutation majHorairesReservationMachine($plages: _text) {
                update_horairesReservationMachines(
                where: { id: { _eq: 2 } }
                _set: { plages: $plages }
                ) {
                returning {
                    id
                }
                }
            }
            `
    return requeteGraphQL(auth, isAdmin, query, variables)
        .then((resultats)=> {return resultats.update_horairesReservationMachines})
}

export async function listePlagesHoraires(auth, isAdmin, variables) {
    const query = `
            query horairesReservationMachines {
                horairesReservationMachines {
                id
                plages
                }
            }
            `
    return requeteGraphQL(auth, isAdmin, query, variables)
        .then((resultats)=> {return resultats.horairesReservationMachines})
}

export async function listeMachines(auth, isAdmin, variables) {
    const query = `
            query listeMachines {
                __typename
                machines {
                id
                titre
                tag
                couleur
                urlImage
                }
            }`
    return requeteGraphQL(auth, isAdmin, query, variables)
        .then((resultats)=> {return resultats.machines})
}

export async function getMachineById(auth, isAdmin, variables) {
    const query = `
        query singleMachine($id: uuid!) {
            __typename
            machines(where: {id: {_eq: $id}}) {
                    id
                    couleur
                    decoupe
                    description
                    gravure
                    hauteur
                    largeur
                    lesTarifs
                    longueur
                    tag
                    tagMachine
                    titre
                    urlImage
                }
        }
        `
    return requeteGraphQL(auth, isAdmin, query, variables)
        .then((resultats)=> {return resultats.machines[0]})
}

export async function creerMachine(auth, isAdmin, variables) {
    const query = `
        mutation createMachine(
            $titre: String!
            $tag: String
            $description: String
            $urlImage: String
            $lesTarifs: jsonb
            $longueur: String
            $largeur: String
            $hauteur: String
            $tagMachine: String
            $decoupe: _text
            $gravure: _text
            $couleur: String
        ) {
            __typename
            insert_machines(
            objects: {
                titre: $titre
                tag: $tag
                urlImage: $urlImage
                description: $description
                lesTarifs: $lesTarifs
                largeur: $largeur
                longueur: $longueur
                hauteur: $hauteur
                tagMachine: $tagMachine
                decoupe: $decoupe
                gravure: $gravure
                couleur: $couleur
            }
            ) {
            affected_rows
            returning {
                id
            }
            }
        }
        `
    return requeteGraphQL(auth, isAdmin, query, variables)
        .then((resultats)=> {return resultats.insert_machines})
}

export async function majMachine(auth, isAdmin, variables) {
    const query = `
        mutation updateMachine(
            $id: uuid!
            $titre: String!
            $tag: String
            $description: String
            $urlImage: String
            $lesTarifs: jsonb
            $longueur: String
            $largeur: String
            $hauteur: String
            $tagMachine: String
            $decoupe: _text
            $gravure: _text
            $couleur: String
        ) {
            __typename
            update_machines(
            where: { id: { _eq: $id } }
            _set: {
                titre: $titre
                tag: $tag
                urlImage: $urlImage
                description: $description
                lesTarifs: $lesTarifs
                largeur: $largeur
                longueur: $longueur
                hauteur: $hauteur
                tagMachine: $tagMachine
                decoupe: $decoupe
                gravure: $gravure
                couleur: $couleur
            }
            ) {
            returning {
                id
            }
            }
        }
        `
    return requeteGraphQL(auth, isAdmin, query, variables)
        .then((resultats)=> {return resultats.update_machines})
}

export async function listeMachinesComplete(auth, isAdmin, variables) {
    const query = `
            query listeMachines {
                __typename
                machines {
                    id
                    couleur
                    decoupe
                    description
                    gravure
                    hauteur
                    largeur
                    lesTarifs
                    longueur
                    tag
                    tagMachine
                    titre
                    urlImage
                }
            }`
    return requeteGraphQL(auth, isAdmin, query, variables)
        .then((resultats)=> {return resultats.machines})
}

export async function effacerMachine(auth, isAdmin, variables) {
    const query = `mutation effacerMachine($idMachine: uuid) {
        delete_machines(where: {id: {_eq: $idMachine}}) {
            affected_rows
        }
        }`
    return requeteGraphQL(auth, isAdmin, query, variables)
        .then((resultats)=> {return resultats.delete_machines})
}
