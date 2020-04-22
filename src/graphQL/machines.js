import { vaChercher } from './vaChercher.js'

export async function listeAbonnements(auth, isAdmin, variables) {
    var retourResultat;
    await auth.updateToken(5)
    .then(async function(refreshed) {
        const entetes = {
            Authorization: 'Bearer ' + auth.token,
            'x-hasura-role': isAdmin ? 'admin': 'user'
        }
        const query = `
            query listeMachines($typeTarif: String!) {
                machines(where: { lesTarifs: { _has_key: $typeTarif } }) {
                id
                lesTarifs
                }
            }
            `
        retourResultat = await vaChercher(query, entetes, variables)
    }
    ).catch(function() {
        alert('Failed to refresh the token, or the session has expired');
        retourResultat = undefined
    });
return retourResultat!==undefined?retourResultat.machines:undefined
    }


    export async function sauveAbonnements(auth, isAdmin, variables) {
    var retourResultat;
    await auth.updateToken(5)
    .then(async function(refreshed) {
        const entetes = {
            Authorization: 'Bearer ' + auth.token,
            'x-hasura-role': isAdmin ? 'admin': 'user'
        }
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
        retourResultat = await vaChercher(query, entetes, variables)
    }
    ).catch(function() {
        alert('Failed to refresh the token, or the session has expired');
        retourResultat = undefined
    });
return retourResultat!==undefined?retourResultat.update_machines:undefined
    }

        export async function majPlagesHoraires(auth, isAdmin, variables) {
    var retourResultat;
    await auth.updateToken(5)
    .then(async function(refreshed) {
        const entetes = {
            Authorization: 'Bearer ' + auth.token,
            'x-hasura-role': isAdmin ? 'admin': 'user'
        }
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
        retourResultat = await vaChercher(query, entetes, variables)
    }
    ).catch(function() {
        alert('Failed to refresh the token, or the session has expired');
        retourResultat = undefined
    });
return retourResultat!==undefined?retourResultat.update_horairesReservationMachines:undefined
    }

        export async function listePlagesHoraires(auth, isAdmin, variables) {
    var retourResultat;
    await auth.updateToken(5)
    .then(async function(refreshed) {
        const entetes = {
            Authorization: 'Bearer ' + auth.token,
            'x-hasura-role': isAdmin ? 'admin': 'user'
        }
        const query = `
            query horairesReservationMachines {
                horairesReservationMachines {
                id
                plages
                }
            }
            `
        retourResultat = await vaChercher(query, entetes, variables)
    }
    ).catch(function() {
        alert('Failed to refresh the token, or the session has expired');
        retourResultat = undefined
    });
return retourResultat!==undefined?retourResultat.horairesReservationMachines:undefined
    }

            export async function listeMachines(auth, isAdmin, variables) {
    var retourResultat;
    await auth.updateToken(5)
    .then(async function(refreshed) {
        const entetes = {
            Authorization: 'Bearer ' + auth.token,
            'x-hasura-role': isAdmin ? 'admin': 'user'
        }
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
        retourResultat = await vaChercher(query, entetes, variables)
    }
    ).catch(function() {
        alert('Failed to refresh the token, or the session has expired');
        retourResultat = undefined
    });
return retourResultat!==undefined?retourResultat.machines:undefined
    }