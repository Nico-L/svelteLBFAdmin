<script>
import { onMount, createEventDispatcher} from 'svelte';
const dispatch = createEventDispatcher();
import { user } from "./../stores/user.js"
import Editeur from './editeur.svelte';
import Bouton from './Button/Button.svelte';
import Dialog from './Dialog.svelte'
import Fa from 'svelte-fa'
import { faTrashAlt, faCheck, faArrowLeft } from '@fortawesome/free-solid-svg-icons'
import { faSave, faEnvelope } from '@fortawesome/free-regular-svg-icons'
import { listeInscrits, saveNouvelInscrit, effacerInscription, nombreInscrits } from './../strapi/ateliers.js'
import { findUser } from "./../strapi/users"

import { v4 as uuidv4 } from 'uuid';

export let idAtelier = "";
export let nbParticipants = ""
export let archive = false;

let lesInscrits = []
let classesPaires = "border border-gray-600 bg-lbfvertt-900 px-2 py-0"
let classesImpaires = "border border-gray-600 px-2 py-0"
let nouvelInscrit = {
    prenom: "",
    nom: "",
    email: ""
}
let message= {
    sujet: "",
    corps: ""
}
let warningComplet = "Attention, l'atelier est officiellement complet."
var flagComplet = false
var nbInscrits = 0
let idInscritAEffacer = ""
let flagEnvoiMail = false;
let flagEnvoieMailOK = false;
let flagSauveNouvelInscrit = false;
let flagEffaceInscrit = [];
let flagConfirmationEffacerInscrit = false;

$: {
    nbInscrits = lesInscrits.length
    flagComplet = nbInscrits >= nbParticipants
}

function getlisteInscrits() {
    listeInscrits(idAtelier).then((retour) => {
        lesInscrits = []
        retour.forEach((inscrit)=> {
            flagEffaceInscrit[inscrit.id] = false
            lesInscrits.push(
                {
                    id: inscrit.id,
                    prenom: inscrit.prenom,
                    nom: inscrit.nom,
                    email: inscrit.email,
                    uuid: inscrit.uuid
                }
            )
        })
        lesInscrits = lesInscrits
    })
}

function sauveNouvelInscrit() {
    flagSauveNouvelInscrit = true
    let flagEmailExists = false
    var variables = {
        atelier: idAtelier,
        email: nouvelInscrit.email,
        nom: nouvelInscrit.nom,
        prenom: nouvelInscrit.prenom,
        uuid: uuidv4()
    }
    lesInscrits.forEach((inscrit) => {
        if (nouvelInscrit.email===inscrit.email) {
            console.log('bob ?')
            variables.uuid = inscrit.uuid
        }
    })
    findUser(nouvelInscrit.email)
        .then((retour) => {
            console.log('retour user', retour)
            if (retour.length > 0 && retour[0].id) {
                variables.user = retour[0].id
            }
            console.log('variables nouvel inscrit', variables)
            saveNouvelInscrit(variables).then((retour) => {
                flagSauveNouvelInscrit = false;
                nouvelInscrit = {
                    prenom: "",
                    nom: "",
                    email: ""
                }
                getlisteInscrits()
            })
        })
}

function prepEffacerInscrit(id) {
    idInscritAEffacer = id
    flagConfirmationEffacerInscrit = true
}

function effacerInscrit() {
    flagEffaceInscrit[idInscritAEffacer] = true;
    effacerInscription(idInscritAEffacer).then((retour) => {
        flagEffaceInscrit[idInscritAEffacer] = true;
            flagConfirmationEffacerInscrit = false
            getlisteInscrits()
        })
}

onMount(()=> {
    getlisteInscrits()
})

</script>

<main>
<h4>Liste des inscripts</h4>
<table class="table-auto text-sm border-collapse border-gray-300 mb-2 mx-auto">
  <thead>
    <tr>
      <th class="border border-gray-600 px-2 py-1 text-vertLBF">Prénom</th>
      <th class="border border-gray-600 px-2 py-1 text-vertLBF">Nom</th>
      <th class="border border-gray-600 px-2 py-1 text-vertLBF">email</th>
      <th class="border border-gray-600 px-2 py-1 text-vertLBF">~</th>
    </tr>
  </thead>
  <tbody>
    {#each lesInscrits as inscrit, index (inscrit.id +'-' + index)}
        <tr>
            <td class={index%2===0?classesPaires:classesImpaires}>{inscrit.prenom}</td>
            <td class={index%2===0?classesPaires:classesImpaires}>{inscrit.nom}</td>
            <td class={index%2===0?classesPaires:classesImpaires}>{inscrit.email}</td>
            <td class={index%2===0?classesPaires:classesImpaires}>
            {#if !archive}
                <Bouton noBorder={true} largeur="w-8" couleur="text-orangeLBF border-orangeLBF" on:actionBouton={()=>{prepEffacerInscrit(inscrit.id)}} occupe={flagEffaceInscrit[inscrit.id]}>
                    <Fa icon={faTrashAlt} size="lg" class="mx-auto" />
                </Bouton>
            {/if}
            </td>
        </tr>
    {/each}
    <!-- {#if !archive} -->
    <tr>
        <td class="border border-gray-600 px-2 py-1">
            <input 
                bind:value={nouvelInscrit.prenom}
                class="w-32 p-1 text-sm bg-gray-800 text-gray-200 rounded focus:outline-none appearance-none leading-normal"
                type="text"
                id="prenomInscrit"
                />
        </td>
        <td class="border border-gray-600 px-2 py-1">
            <input
                bind:value={nouvelInscrit.nom}
                class="w-32 p-1 text-sm bg-gray-800 text-gray-200 rounded focus:outline-none appearance-none leading-normal"
                type="text"
                id="nomInscrit"
                />
        </td>
        <td class="border border-gray-600  px-2 py-1">
            <input
                bind:value={nouvelInscrit.email}
                class="w-full p-1 text-sm bg-gray-800 text-gray-200 rounded focus:outline-none appearance-none leading-normal"
                type="text"
                id="emailInscrit"
                />
        </td>
        <td class="border border-gray-600 px-2 py-1">
            {#if nouvelInscrit.email!=="" && nouvelInscrit.prenom!==""}
                <Bouton noBorder={true} largeur="w-10" couleur="text-vertLBF border-vertLBF" on:actionBouton={sauveNouvelInscrit} occupe={flagSauveNouvelInscrit}>
                    <Fa icon={faSave} size="lg" class="mx-auto" />
                </Bouton>
            {/if}
        </td>
    </tr>
    <!-- {/if} -->
  </tbody>
</table>
    {#if flagComplet}
    <div class="text-rougeLBF">{warningComplet}</div>
    {/if}
    <div class="flex flex-row justify-end items-center mt-4">
        <Bouton largeur="w-10" couleur="text-bleuLBF border-bleuLBF" on:actionBouton={()=>{dispatch('close')}}>
            <Fa icon={faArrowLeft} size="lg"  class="mx-auto" />
        </Bouton>
    </div>
</main>
<!-- confirme efface atelier -->
<Dialog bind:visible={flagConfirmationEffacerInscrit} on:close={() => {flagConfirmationEffacerInscrit=false}}>
    <h4 slot="title">Confirmation</h4>
    <p>Confirmer la suppression de cet inscrit</p>
    <div slot="actions" class="flex flex-row justify-end items-center">
        <Bouton on:actionBouton={() => flagConfirmationEffacerInscrit = false}>Annuler</Bouton>
        <Bouton on:actionBouton = {effacerInscrit} couleur="text-orangeLBF border-orangeLBF">Confirmer</Bouton>
    </div>
</Dialog>