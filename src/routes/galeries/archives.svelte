<script>
import {onMount} from 'svelte';
import {tagsArticlesStore} from "../../stores/tagsArticles.js"
import AutoComplete from '../../components/simpleAutoComplete.svelte'

import {listeGaleries, deleteGalerie} from './../../strapi/galeries.js'
import { effaceIllustration } from "../../strapi/illustrations.js"
import {imgProxyUrl} from "./../../strapi/imgProxy.js"
import { user } from "./../../stores/user.js"
import {buildNeeded} from "./../../stores/build.js"
import Fa from 'svelte-fa'
import { faEdit, faTrashAlt, faCalendarAlt } from '@fortawesome/free-regular-svg-icons'
import { faWrench } from '@fortawesome/free-solid-svg-icons'
import Bouton from './../../components/Button/Button.svelte';
import Dialog from './../../components/Dialog.svelte';

let archivesGaleries = []
let archivesFiltrees = []
var titreFiltre = ""
var auteurFiltre = ""
var tagFiltre = ""
let flagRafraich = true
let busyEffacerGalerie = false
let flagConfirmationEffacerGalerie = false
let archiveToDelete = {}
let illustrationAEffacer = {}
let couleur = []
couleur["realisation"] = {
    texte: "text-bleuLBF",
    fond: "bg-bleuLBF",
    bordure: "border-bleuLBF",
    titre: "text-lbfbleu-700",
    divide: "divide-bleuLBFT",
    hover: " hover:bg-bleuLBF hover:text-gray-900"
}

couleur["evenement"] = {
    texte: "text-jauneLBF",
    fond: "bg-jauneLBF",
    bordure: "border-jauneLBF",
    titre: "text-lbfjaune-700",
    divide: "divide-jauneLBFT",
    hover: " hover:bg-jauneLBF hover:text-gray-900"
}

let optionsProxy = {
    'resizing_type': 'fill',
    'width': 80,
    'height': 80,
    'gravity': 'ce'
}

$: {
    if (flagRafraich) {
        listeGaleries().then((liste) => {
            archivesGaleries = liste
            archivesFiltrees = archivesGaleries.slice(0,10)
            flagRafraich = false
        }) 
    }
}

function edition(id) {
    window.location.assign(window.location.origin + "/galeries/edit/" + id)
}

function suppressionGalerie() {
    busyEffacerGalerie = true
    deleteGalerie(archiveToDelete.id).then((retour) => {
        let promises = []
        archiveToDelete.illustrations.forEach((illustration) => {
            illustrationAEffacer= {'illustrationId': illustration.id, 'imageId': illustration.media.id}
            promises.push(effaceIllustration(illustrationAEffacer))
        })
        Promise.all(promises).then((retour) => {
            buildNeeded.set(true)
            flagConfirmationEffacerGalerie = false
            busyEffacerGalerie = false
            flagRafraich = true
        })
    })
}

$: {
    if (titreFiltre && titreFiltre.titre && titreFiltre.titre !== "") {
        archivesFiltrees = archivesGaleries.filter((archive) => archive.titre == titreFiltre.titre)
    } else {
        archivesFiltrees = archivesGaleries
    }
}

$: {
    if (tagFiltre && tagFiltre.tag) {
        archivesFiltrees = archivesGaleries.filter((archive) => {
            let retour = false
            archive.tags.forEach((tag) => {
                if (tag.tag == tagFiltre.tag) retour = true
            })
            return retour
        })
    } else {
        archivesFiltrees = archivesGaleries
    }
}

$: {
    if (auteurFiltre !== "") {
        archivesFiltrees = archivesGaleries.filter((archive) => archive.auteur.includes(auteurFiltre))
    } else {
        archivesFiltrees = archivesGaleries
    }
}

</script>

<main class="max-w-720px mt-4">
    <div class="border border-bleuLBFT p-2 rounded">
        <div class="h5 text-lbfbleu-800">filtres</div>
        <div class="flex flex-col gap-2">
            <div class="flex flex-row items-center">
                <label for="titre" class="text-bleuLBF mx-2 w-1/12">
                        titre
                </label>              
                    <AutoComplete
                        items={archivesGaleries}
                        bind:selectedItem={titreFiltre}
                        labelFieldName="titre" 
                        name="titre"
                        inputId="titre"
                        inputClassName="bg-bleuLBFTT text-gray-200 focus:outline-none border border-bleuLBFT rounded block w-full appearance-none leading-normal"
                        hideArrow="true"
                        className="w-full"
                        dropdownClassName = "bg-gray-900 text-gray-500"
                        noResultsText = "Aucun résultat"
                        showClear = "true"
                        />
                
            </div>
            <div class="flex flex-row items-center">
                <label for="auteur" class="text-bleuLBF mx-2 w-1/12">
                        auteur
                </label>              
                <input 
                    bind:value= {auteurFiltre}
                    class="bg-bleuLBFTT text-gray-200 focus:outline-none border border-bleuLBFT rounded py-1 px-4 block w-full appearance-none leading-normal"
                    type="text"
                    id="auteur"
                    />
                
            </div>
            <div class="flex flex-row items-center">
                <label for="tag" class="text-bleuLBF mx-2 w-1/12">
                    tag
                </label> 
                <AutoComplete
                        items={$tagsArticlesStore}
                        bind:selectedItem={tagFiltre}
                        labelFieldName="tag" 
                        name="tag"
                        inputId="tag"
                        inputClassName="bg-bleuLBFTT text-gray-200 focus:outline-none rounded border border-bleuLBFT block w-full appearance-none leading-normal"
                        hideArrow="true"
                        className="w-full"
                        dropdownClassName = "bg-gray-900 text-gray-500"
                        noResultsText = "Aucun résultat"
                        showClear = "true"
                        />
            </div>
        </div>
    </div>
    <div class="flex flex-row flex-wrap justify-around gap-4 max-w-720px mt-4">
        {#each archivesFiltrees as archive}
            <div class={"flex flex-row flex-grow-0 flex-shrink-0 w-340px divide-x p-2 rounded border " + couleur[archive.type].bordure + " " + couleur[archive.type].divide}>
                <div class="pr-2 w-2/6">
                    {#if archive.illustrations.length > 0}
                        {#await imgProxyUrl("https://cms.labonnefabrique.fr" + archive.illustrations[0].media.url, optionsProxy)}
                            <img
                                src="/img/svg/clock-regular.svg"
                                alt="logo"
                                class={"h-full object-cover rounded"}
                                width="80"
                                />
                        {:then value}
                            <img
                                src={value.imgProxyUrl}
                                alt={archive.titre}
                                class={"h-full object-cover rounded cursor-pointer"}
                                on:click={() => edition(archive.id)}
                                width="80"
                                />
                        {/await}
                    {:else}
                        {#await imgProxyUrl("https://cms.labonnefabrique.fr/uploads/logo_LBF_bb0853ef96_c50ec315b1.png", optionsProxy)}
                            <img
                                src="/img/svg/clock-regular.svg"
                                alt="logo"
                                class={"h-full object-cover rounded"}
                                width="80"
                                />
                        {:then value}
                            <img
                                src={value.imgProxyUrl}
                                alt={archive.titre}
                                class={"h-full object-cover rounded cursor-pointer"}
                                on:click={() => edition(archive.id)}
                                width="80"
                                />
                        {/await}
                    {/if}
                </div>
                <div class="flex flex-col justify-between px-2 w-3/4">
                    <div class={"h-14 text-lg font-medium flex justify-center items-center " + couleur[archive.type].titre}><div class="line-clamp-2 text-center">{archive.titre}</div></div>
                    <div class="flex flex-row justify-between">
                        <div class={couleur[archive.type].texte}>
                            {#if archive.type == "realisation"} 
                                <Fa icon={faWrench} class="mx-auto" />
                            {:else}
                                <Fa icon={faCalendarAlt} class="mx-auto" />
                            {/if}
                        </div>
                        <div class="ml-2 text-sm text-right">{archive.auteur}</div>
                    </div>
                </div>
                <div class="flex flex-col flex-grow-0 flex-shrink-0 justify-center items-center">
                    <Bouton on:actionBouton={() =>{edition(archive.id)}} largeur="w-8" couleur={couleur[archive.type].texte + " " + couleur[archive.type].bordure + " " + couleur[archive.type].hover} noBorder={true}>
                        <Fa icon={faEdit} size="1.5x" class="mx-auto" />
                    </Bouton>
                    <Bouton on:actionBouton={() => {archiveToDelete = archive; flagConfirmationEffacerGalerie = true}} largeur="w-8" couleur="text-rougeLBF border-rougeLBF hover:bg-rougeLBF hover:text-gray-900" noBorder={true}>
                        <Fa icon={faTrashAlt} size="1.3x" class="mx-auto" />
                    </Bouton>
                </div>
            </div>
        {/each}
    </div>
</main>
<Dialog bind:visible={flagConfirmationEffacerGalerie} on:close={() => {flagConfirmationEffacerGalerie=false}}>
    <h4 slot="title">Confirmation</h4>
    <p>Confirmer la suppression de <em>{archiveToDelete.titre}</em></p>
    <div slot="actions" class="flex flex-row justify-end items-center">
        <Bouton on:actionBouton={() => flagConfirmationEffacerGalerie = false}>Annuler</Bouton>
        <Bouton occupe={busyEffacerGalerie} on:actionBouton = {suppressionGalerie} couleur="text-orangeLBF border-orangeLBF">Confirmer</Bouton>
    </div>
</Dialog>