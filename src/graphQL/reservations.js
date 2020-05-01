import { requeteGraphQL } from './gql.js'

export async function sauveReservation(auth, isAdmin, variables) {
    const query = `
            mutation ajoutReservation(
                $dateDebut: timestamptz
                $dateFin: timestamptz
                $email: String
                $idMachine: uuid
                $nom: String
                $prenom: String
            ) {
                insert_reservationMachines(
                objects: {
                    dateDebut: $dateDebut
                    dateFin: $dateFin
                    email: $email
                    idMachine: $idMachine
                    nom: $nom
                    prenom: $prenom
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
            return resultats.insert_reservationMachines.returning[0]
        })
}

export async function listeReservations(auth, isAdmin, variables) {
    const query = `
                query listeReservations {
                    __typename
                    reservationMachines {
                    id
                    dateDebut
                    dateFin
                    email
                    nom
                    prenom
                    machine {
                        id
                        titre
                        tag
                        couleur
                        urlImage
                    }
                    }
                }
                `
    return requeteGraphQL(auth, isAdmin, query, variables)
        .then((resultats)=> {
            return resultats.reservationMachines
        })
}

export async function effaceReservation(auth, isAdmin, variables) {
    const query = `
            mutation effaceReservation($idReservation: uuid) {
                __typename
                delete_reservationMachines(where: { id: { _eq: $idReservation } }) {
                returning {
                    id
                }
                }}
            `
    return requeteGraphQL(auth, isAdmin, query, variables)
        .then((resultats)=> {
            return resultats.delete_reservationMachines
        })
}

export async function majReservation(auth, isAdmin, variables) {
    const query = `
            mutation majReservation(
                $id: uuid
                $dateDebut: timestamptz
                $dateFin: timestamptz
                $email: String
                $idMachine: uuid
                $nom: String
                $prenom: String
            ) {
                update_reservationMachines(
                    where: {id: {_eq: $id}}, 
                    _set: {
                        dateDebut: $dateDebut,
                        dateFin: $dateFin,
                        email: $email,
                        idMachine: $idMachine,
                        nom: $nom,
                        prenom: $prenom}) 
                {
                    affected_rows
                    }
                }
            `
    return requeteGraphQL(auth, isAdmin, query, variables)
        .then((resultats)=> {
            return resultats.update_reservationMachines
        })
}
