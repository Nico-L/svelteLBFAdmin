<script>
import {onMount} from 'svelte';

import {user} from '../stores/user.js'
import {imgProxyUrl} from "../strapi/imgProxy.js"
import {dateJourMoisHeure} from "../utils/dateFr.js"
import Fa from 'svelte-fa'
import { faEdit, faTrashAlt } from '@fortawesome/free-regular-svg-icons'
import Bouton from './Button/Button.svelte';
import Dialog from './Dialog.svelte';
import CheckBoxAlone from './CheckBoxAlone.svelte';

import {listeAteliersFuturs} from '../strapi/ateliers.js'


export let limiteNbAteliers = 0
export let couleur = "bleu"

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

var ateliers = []
let optionsProxy = {
    'resizing_type': 'fill',
    'width': 100,
    'height': 100,
    'gravity': 'ce'
}

onMount(() => {
    listeAteliersFuturs('asc', limiteNbAteliers).then((retour) => {
        ateliers = retour
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
    {#each ateliers as atelier, index}
    <div class={"flex flex-row divide-x py-2 justify-between border border-gray-900" + fondListe(index)}>
        <div class="px-4 flex-shrink-0 text-gray-700">
            {#await imgProxyUrl(atelier.urlImage, optionsProxy)}
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
                    alt={atelier.titre}
                    class={"rounded border cursor-pointer " + borderColore}
                    width="100"
                    height="100"
                    />
            {/await}
        </div>
        <div class="px-2 flex-grow flex flex-col justify-start cursor-pointer">
            <h5 class="ml-2">{atelier.titre}</h5>
            <div class="text-sm">{@html atelier.description}</div>
        </div>
        <div class="flex flex-row gap-1 px-2 flex-shrink-0">
            <Bouton largeur="w-10" couleur={textColore + " " + borderColore}>
                <Fa icon={faEdit} class="mx-auto" />
            </Bouton>
        </div>
    </div>
    {:else}
    <div>Aucun atelier n'est prévu pour l'instant</div>
    {/each}
</div>

