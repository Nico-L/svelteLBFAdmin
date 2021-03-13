<script>
import { createEventDispatcher} from 'svelte';
const dispatch = createEventDispatcher();
import { navigate } from "svelte-routing";
//import { auth } from "./../stores/auth.js"
import { user } from "./../stores/user.js"
import {espacesBF} from './../stores/espacesBF.js'
import { tags } from "./../stores/tags.js"
import {listeAbonnements, getMachineById, majMachine, creerMachine} from './../strapi/machines.js'
import ImageUpload from './imageUpload.svelte';
import Editeur from './editeur.svelte';
import Bouton from './Button/Button.svelte';
import RadioBouton from './radioButton.svelte'
import CheckBox from './CheckBox.svelte'
import Busy from './busy.svelte'
import Fa from 'svelte-fa'
import { faEuroSign, faTrashAlt, faPlus, faArrowLeft } from '@fortawesome/free-solid-svg-icons'
import { faSave } from '@fortawesome/free-regular-svg-icons'
import { tableCouleursLBFNum } from './../utils/couleursLBF.js'

export let flagEdition = false;
export let idMachine = "";

// variables passée à l'upload pour tag = Atelier et espaceBF = L'atelier
let tagId;
let espaceId;
$tags.forEach((tag) => {
    if (tag.tag==="machine") tagId=tag.id
})
$espacesBF.forEach((espace)=> {
    if (espace.value==="l'atelier") espaceId = espace.id
})
const dataImg = {
    espace: espaceId,
    tag: tagId
}
const optionsURL= {
    'resizing_type': 'fill',
    'width': 400,
    'height': 180,
    'gravity': 'ce'
}

let lesAbonnements = []
let typeTarif = "abonnement"
let newTarifHoraire = {tarification: "", tarif: ""}
let specificationMateriaux = false
let laMachine= {
                nom: "",
                modele: "",
                nomRaccourci: "",
                illustration: "",
                description: "",
                resume: "",
                surAbonnement: false,
                tarifHoraire: "",
                abonnements: null,
                couleur: "rouge"
}
let laDecoupe = ""
let laGravure = ""
let flagSauvegardeEnCours = false;
let flagSauvegardeSucces = false;
let flagGetMachine = false;

$: listeAbonnements().then((retour)=> {
        lesAbonnements = retour.abonnements
    })

$: {
    if(idMachine !== "" && !flagEdition) {
        flagGetMachine = true
        getMachineById(idMachine).then((retour)=> {
            flagGetMachine = false
            flagEdition = true
            laMachine = retour
            laMachine.illustration = laMachine.illustration.id
            if (!laMachine.surAbonnement) {
                typeTarif = "horaire"
            }
            
        })
    }
}

$: laMachine.surAbonnement = typeTarif==="abonnement"

function validationSauvegarde() {
    flagSauvegardeEnCours = true
    flagGetMachine = true
    if (idMachine==="") {
        creerMachine(laMachine).then((retour)=>{
            flagSauvegardeEnCours=false
            flagGetMachine = false
            navigate("/machines/listeMachines", { replace: true });
        })
    } else {
        majMachine(idMachine, laMachine).then((retour)=>{
            flagSauvegardeEnCours= false
            flagGetMachine = false
            dispatch('close')
        })
    }
}

function fini() {
    dispatch('close')
}
</script>

{#if !flagGetMachine}
    <div class="w-480px p-1 bg-gray-900 flex flex-col border-gray-200">
        <label for="titre" class="text-sm">
            Nom de la machine
            <div class="border border-bleuLBFT rounded p-1">
                <input 
                bind:value= {laMachine.nom}
                class="bg-gray-800 text-base text-gray-200 focus:outline-none rounded py-1 px-1 block w-full appearance-none leading-normal"
                type="text"
                id="titre"
                />
            </div>
        </label>
        <label for="modele" class="text-sm">
            Modele
            <div class="border border-bleuLBFT rounded p-1">
                <input 
                bind:value= {laMachine.modele}
                class="bg-gray-800 text-base text-gray-200 focus:outline-none rounded py-1 px-1 block w-full appearance-none leading-normal"
                type="text"
                id="modele"
                />
            </div>
        </label>
        <label for="tag" class="text-sm">
            raccourci
            <div class="border border-bleuLBFT rounded p-1">
                <input 
                bind:value= {laMachine.nomRaccourci}
                class="bg-gray-800 text-base text-gray-200 focus:outline-none rounded py-1 px-1 block w-full appearance-none leading-normal"
                type="text"
                id="tag"
                />
            </div>
        </label>
            <div class="mt-2 mb-4">
            <div class="h4 font-medium text-gray-400">Couleur associée (rendu calendriers)</div>
            <div class="flex flex-row items-center justify-between mt-2">
                {#each tableCouleursLBFNum as couleur}
                    <div class="mr-2 flex flex-row items-center">
                    <RadioBouton cbClasses={couleur.classText} name="typeSelection" value={couleur.variante} bind:selected={laMachine.couleur} />
                        <div class={"w-6 h-6 " + couleur.classBG}></div>
                    </div>
                {/each}
            </div>
        </div>
        <div class="w-5/6 mx-auto">
            <ImageUpload
                espaceId = {espaceId}
                tagId = {tagId}
                bind:idIllustration={laMachine.illustration}
                options = {optionsURL}
                altImage="Illustration de la machine"
                classImage="rounded border-2 border-bleuLBF w-400px h-180px" />
        </div>
        <div class="mt-4 ">
            <div class="h4 font-medium text-vertLBF">Résumé</div>
            <Editeur bind:contenu={laMachine.resume} couleur="vert"/>
        </div>
        <div class="mt-4 ">
            <div class="h4 font-medium text-vertLBF">Description</div>
            <Editeur bind:contenu={laMachine.description} couleur="vert"/>
        </div>
        <div class="mt-4">
            <div class="h4 font-medium text-orangeLBF">Tarifs</div>
            <div class="flex flex-row items-center mt-1">
                <RadioBouton mettreApres={true} cbClasses="text-gray-400" name="typeTarif" value="abonnement" bind:selected={typeTarif} label="abonnement"/>
                <RadioBouton mettreApres={true} cbClasses="text-gray-400" name="typeTarif" value="horaire" bind:selected={typeTarif} label="tarif horaire"/>
            </div>
            {#if laMachine.surAbonnement}
                <table class="mx-auto table-auto border-collapse border-2 border-gray-300 mt-3">
                    <thead>
                        <tr>
                        <th class="border border-gray-600 px-2 py-1 text-orangeLBF">Durée</th>
                        <th class="border border-gray-600 px-2 py-1 text-orangeLBF">Tarif (€)</th>
                        </tr>
                    </thead>
                    {#each lesAbonnements as abonnement, index}
                        <tr>
                            <td class="border border-gray-600 px-2 py-1">
                                {abonnement.duree}
                            </td>
                            <td class="border border-gray-600 px-2 py-1">
                            {abonnement.tarif} 
                            </td>
                        </tr>
                    {/each}
                </table>
            {:else}
                <div class=" flex flex-row items-center mt-3">
                    <div class="font-medium mx-2">Tarif : </div>
                    <input 
                    bind:value={laMachine.tarifHoraire}
                    class="w-12 p-1 bg-gray-800 text-gray-200 rounded focus:outline-none appearance-none leading-normal text-right"
                    type="text"
                    id="nouveauTarif"
                    />
                    <Fa icon={faEuroSign} size="lg" class="mx-auto ml-2" />
                </div>  
            {/if}
        </div>
        <div class="mt-4 flex flex-row items-center justify-end">
            {#if idMachine!==""}
            <Bouton on:actionBouton={fini} largeur="w-10" couleur="text-bleuLBF border-bleuLBF">
                <Fa icon={faArrowLeft} size="lg"  class="mx-auto" />
            </Bouton>
            {/if}
            <Bouton bind:occupe={flagSauvegardeEnCours} bind:succes={flagSauvegardeSucces} on:actionBouton={validationSauvegarde} largeur="w-12" couleur="text-vertLBF border-vertLBF">
                <Fa icon={faSave} size="lg" class="mx-auto" />
            </Bouton>
        </div>
    </div>
{:else}
    <Busy visible={flagGetMachine} >Récupération des données, merci de patienter...</Busy>
{/if}