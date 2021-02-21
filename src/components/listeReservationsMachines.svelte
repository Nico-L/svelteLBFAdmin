<script>
import {onMount} from 'svelte';

import {user} from '../stores/user.js'
import {imgProxyUrl} from "../strapi/imgProxy.js"
import {dateLisible} from "../utils/dateFr.js"
import Fa from 'svelte-fa'
import { faEdit, faTrashAlt } from '@fortawesome/free-regular-svg-icons'
import Bouton from './Button/Button.svelte';
import Dialog from './Dialog.svelte';


import {listeReservationsFutures} from '../strapi/reservationsMachines.js'

export let limiteNbReservations = 0
export let couleur = "vert"

var bgColoree = ""
var textColore = ""
var borderColore = ""

switch (couleur) {
    case "bleu":
        var bgColoree = "bg-bleuLBFTT"
        var textColore = "text-bleuLBF"
        var borderColore = "border-bleuLBF"
        break;
    case "vert":
        var bgColoree = "bg-vertLBFTT"
        var textColore = "text-vertLBF"
        var borderColore = "border-vertLBF"
        break;
}

var reservations = []
let optionsProxy = {
    'resizing_type': 'fill',
    'width': 60,
    'height': 60,
    'gravity': 'ce'
}

onMount(() => {
    listeReservationsFutures('asc', limiteNbReservations).then((retour) => {
        reservations = retour
    })
})

function fondListe (index) {
    var retour = " divide-gray-700"
    if (index % 2 == 0) {
        switch (couleur) {
            case "bleu":
                retour = " divide-gray-900 " + bgColoree
                break;
            case "vert":
                retour = " divide-gray-900 " + bgColoree 
                break;
        }
    }
    return retour
}

</script>

<div class="flex flex-col mt-4">
    {#each reservations as reservation, index}
    <div class={"flex flex-row divide-x py-2 justify-between border border-gray-900" + fondListe(index)}>
        <div class="px-4 flex-shrink-0 text-gray-700">
            {#await imgProxyUrl(reservation.machine.urlImage, optionsProxy)}
                <img
                    src="/img/svg/clock-regular.svg"
                    alt="logo"
                    class={"rounded border " + borderColore}
                    width="100"
                    height="100"
                    />
            {:then value}
                <img
                    src={value.imgProxyUrl}
                    alt={reservation.titre}
                    class={"rounded border cursor-pointer " + borderColore}
                    width="100"
                    height="100"
                    />
            {/await}
        </div>
        <div class="px-2 flex-grow flex flex-col justify-start cursor-pointer">
            <h5 class="ml-2">{reservation.machine.nom}</h5>
            <div class="text-sm">par {reservation.user.email}</div>
            <div class="text-sm">{dateLisible(reservation.date,reservation.heuredebut, reservation.heurefin)}</div>
        </div>
        <div class="flex flex-row gap-1 px-2 flex-shrink-0">
            <Bouton largeur="w-10" couleur={textColore + " " + borderColore}>
                <Fa icon={faEdit} class="mx-auto" />
            </Bouton>
        </div>
    </div>
    {:else}
    <div>Aucune réservation de machine en cours...</div>
    {/each}
</div>


