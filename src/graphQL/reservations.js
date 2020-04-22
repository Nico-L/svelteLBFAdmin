import { vaChercher } from './vaChercher.js'

export async function sauveReservation(auth, isAdmin, variables) {
    var retourResultat;
    await auth.updateToken(5)
    .then(async function(refreshed) {
        const entetes = {
            Authorization: 'Bearer ' + auth.token,
            'x-hasura-role': isAdmin ? 'admin': 'user'
        }
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
        retourResultat = await vaChercher(query, entetes, variables)
    }
    ).catch(function() {
        alert('Failed to refresh the token, or the session has expired');
        retourResultat = undefined
    });
return retourResultat!==undefined?retourResultat.insert_reservationMachines:undefined
    }

export async function listeReservations(auth, isAdmin, variables) {
    var retourResultat;
    await auth.updateToken(5)
    .then(async function(refreshed) {
        const entetes = {
            Authorization: 'Bearer ' + auth.token,
            'x-hasura-role': isAdmin ? 'admin': 'user'
        }
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
        retourResultat = await vaChercher(query, entetes, variables)
    }
    ).catch(function() {
        alert('Failed to refresh the token, or the session has expired');
        retourResultat = undefined
    });
return retourResultat!==undefined?retourResultat.reservationMachines:undefined
    }

export async function effaceReservation(auth, isAdmin, variables) {
    var retourResultat;
    await auth.updateToken(5)
    .then(async function(refreshed) {
        const entetes = {
            Authorization: 'Bearer ' + auth.token,
            'x-hasura-role': isAdmin ? 'admin': 'user'
        }
        const query = `
            mutation effaceReservation($idReservation: uuid) {
                __typename
                delete_reservationMachines(where: { id: { _eq: $idReservation } }) {
                returning {
                    id
                }
                }
            }
            `
        retourResultat = await vaChercher(query, entetes, variables)
    }
    ).catch(function() {
        alert('Failed to refresh the token, or the session has expired');
        retourResultat = undefined
    });
return retourResultat!==undefined?retourResultat.delete_reservationMachines:undefined
    }

export async function majReservation(auth, isAdmin, variables) {
    var retourResultat;
    await auth.updateToken(5)
    .then(async function(refreshed) {
        const entetes = {
            Authorization: 'Bearer ' + auth.token,
            'x-hasura-role': isAdmin ? 'admin': 'user'
        }
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
        retourResultat = await vaChercher(query, entetes, variables)
    }
    ).catch(function() {
        alert('Failed to refresh the token, or the session has expired');
        retourResultat = undefined
    });
return retourResultat!==undefined?retourResultat.update_reservationMachines:undefined
    }