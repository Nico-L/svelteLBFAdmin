<script>
import { onMount, createEventDispatcher} from 'svelte';
const dispatch = createEventDispatcher();
import {ajouterAtelier, editerAtelier, supprimerAtelier} from "./../strapi/ateliers.js"

import { tags } from "./../stores/tags.js"
import { user } from "./../stores/user.js"
import { buildNeeded } from "./../stores/build.js"
import ImageUpload from './imageUpload.svelte';
import ListeInscrits from './listeInscritsAtelier.svelte'
import EnvoiEmail from './emailToInscritsAtelier.svelte'
import CheckBox from './CheckBox.svelte';
import Editeur from './editeur.svelte';
import Bouton from './Button/Button.svelte';
import Dialog from './Dialog.svelte'
import Fa from 'svelte-fa'
import { faEuroSign, faEdit, faTrashAlt, faArrowLeft, faUsers } from '@fortawesome/free-solid-svg-icons'
import { faSave, faCopy, faEnvelope } from '@fortawesome/free-regular-svg-icons'

import {espacesBF} from './../stores/espacesBF.js'
import { dateFr, dateInscription} from './../utils/dateFr.js'
import Datepicker from './SvelteCalendar/Datepicker.svelte'

export let flagEdition=false;
export let dataAtelier = {
    id: "",
    titre:"",
    espaceId: 4,
    urlImage: "https://cms.labonnefabrique.fr/uploads/logo_LBF_bb0853ef96.png",
    nbParticipants: 8,
    surInscription: true,
    date: new Date(),
    debut: "10:00",
    fin: "12:00",
    description: "Une description",
    inscriptions_ateliers:[],
    lesTarifs: [ { description: "Adhérent", tarif: "10", qf: true }, { description: "Non adhérent", tarif: "15", qf: false} ]
}
export let archive = false;

let editAtelier = {
    ... dataAtelier
}
if (!editAtelier.dateDebut) {
  let dateDebut = new Date(editAtelier.date)
  let debutTemp = editAtelier.debut.split(':')
  dateDebut.setHours(debutTemp[0])
  dateDebut.setMinutes(debutTemp[1])
  let dateFin = new Date(editAtelier.date)
  let finTemp = editAtelier.fin.split(':')
  dateFin.setHours(finTemp[0])
  dateFin.setMinutes(finTemp[1])
  editAtelier.dateDebut = dateDebut
  editAtelier.dateFin = dateFin
}

let flagSauvegardeEnCours = false;
let flagDuplicationEnCours = false;
let flagSauvegardeSucces = false;
let flagDuplicationSucces = false;
let busyEffacerAtelier = false;
let flagConfirmationEffacerAtelier = false;
let flagDupliquer = false;
let flagListeInscrits = false;
let flagEnvoiEmail= false

var jourDebut = new Date(editAtelier.dateDebut)
var jourFin = new Date(editAtelier.dateFin)
let deuxJourAvantDebut = new Date(editAtelier.dateDebut)
let deuxAnsApresFin = new Date(editAtelier.dateFin)
var heureDebut = jourDebut.getHours() + "h"
jourDebut.getMinutes()===0? heureDebut = heureDebut + "00":heureDebut = heureDebut + jourDebut.getMinutes()
var heureFin = jourFin.getHours() + "h"
jourFin.getMinutes()===0? heureFin = heureFin + "00":heureFin = heureFin + jourFin.getMinutes()
let maintenant= new Date();
let  dateFormat = "#{l} #{j} #{F} #{Y}"
let datesFormatees = ""

// variables passée à l'upload pour tag = Atelier et espaceBF = L'atelier
let tagId;
let espaceId;
$tags.forEach((tag) => {
    if (tag.tag==="Atelier") tagId=tag.id
})
$espacesBF.forEach((espace)=> {
    if (espace.value==="L'atelier") espaceId = espace.id
})
const dataImg = {
    user: $user.id,
    espaces: espaceId,
    tags: tagId
}

$: {
    deuxJourAvantDebut = new Date(editAtelier.dateDebut)
    deuxJourAvantDebut.setDate(deuxJourAvantDebut.getDate()-2)
    deuxAnsApresFin = new Date(editAtelier.dateFin)
    deuxAnsApresFin.setMonth(deuxAnsApresFin.getMonth()+24)
    let heureDebutTemp = heureDebut.split('h')
    jourDebut.setHours(heureDebutTemp[0])
    jourDebut.setMinutes(heureDebutTemp[1])
    let heureFinTemp = heureFin.split('h')
    jourFin.setHours(heureFinTemp[0])
    jourFin.setMinutes(heureFinTemp[1])
    //datesFormatees =  dateInscription(jourDebut, jourFin)
}

const optionsURL= {
    'resizing_type': 'fill',
    'width': 400,
    'height': 180,
    'gravity': 'ce'
}
      
function fini() {
    dispatch('close')
}

function sauveAtelier() {
    let variables = {}
    let heureDebutTemp = heureDebut.split('h')
    jourDebut.setHours(heureDebutTemp[0])
    jourDebut.setMinutes(heureDebutTemp[1])
    variables = {
        titre: editAtelier.titre || "Un nouvel atelier",
        lieu: editAtelier.lieu || "La Bonne Fabrique",
        date: new Date(jourDebut),
        debut: heureDebut.split('h').join(':') + ":00",
        fin: heureFin.split('h').join(':') + ":00",
        description: editAtelier.description || "Un nouvel atelier sympa !",
        espace: editAtelier.espaceId,
        nbParticipants: editAtelier.nbParticipants,
        surInscription: editAtelier.surInscription,
        lesTarifs: editAtelier.lesTarifs,
        titre: editAtelier.titre || "Un nouvel atelier",
        urlImage: editAtelier.urlImage
    }
    flagSauvegardeEnCours = !flagDupliquer;
    flagDuplicationEnCours = flagDupliquer
    ajouterAtelier(variables).then((result)=> {
        flagSauvegardeSucces = !flagDupliquer
        flagDuplicationSucces = flagDupliquer
        flagSauvegardeEnCours = false
        flagDuplicationEnCours = false
        buildNeeded.set(true)
        fini()
    })
}

function updateAtelier() {
    let variables = {}
    let heureDebutTemp = heureDebut.split('h')
    jourDebut.setHours(heureDebutTemp[0])
    jourDebut.setMinutes(heureDebutTemp[1])
    /*var tarifs='{'
    editAtelier.tarifs.forEach((tarif, index) => {
        if(index===0) {
          tarifs = tarifs + '{'+ tarif[0] + ', ' +  tarif[1] + ', ' + tarif[2] +'}'
        } else {
          tarifs = tarifs + ', {'+ tarif[0] + ', ' +  tarif[1] + ', ' + tarif[2] +'}'
        }
      })
    tarifs = tarifs + '}' */
    variables = {
        titre: editAtelier.titre || "Un nouvel atelier",
        lieu: editAtelier.lieu || "La Bonne Fabrique",
        date: new Date(jourDebut),
        debut: heureDebut.split('h').join(':') + ":00",
        fin: heureFin.split('h').join(':') + ":00",
        description: editAtelier.description || "Un nouvel atelier sympa !",
        espace: editAtelier.espaceId,
        nbParticipants: editAtelier.nbParticipants,
        surInscription: editAtelier.surInscription,
        lesTarifs: editAtelier.lesTarifs,
        titre: editAtelier.titre || "Un nouvel atelier",
        urlImage: editAtelier.urlImage
    }
    flagSauvegardeEnCours = true;
    editerAtelier(editAtelier.id, variables).then((result)=> {
        buildNeeded.set(true)
        flagSauvegardeSucces = true
        flagSauvegardeEnCours = false
        fini()
    })
}

/*
function sauveAtelier() {
    let variables = {}
    let heureDebutTemp = heureDebut.split('h')
    jourDebut.setHours(heureDebutTemp[0])
    jourDebut.setMinutes(heureDebutTemp[1])
    let heureFinTemp = heureFin.split('h')
    jourFin.setHours(heureFinTemp[0])
    jourFin.setMinutes(heureFinTemp[1])
    var tarifs='{'
    editAtelier.tarifs.forEach((tarif, index) => {
        if(index===0) {
          tarifs = tarifs + '{'+ tarif[0] + ', ' +  tarif[1] + ', ' + tarif[2] +'}'
        } else {
          tarifs = tarifs + ', {'+ tarif[0] + ', ' +  tarif[1] + ', ' + tarif[2] +'}'
        }
      })
    tarifs = tarifs + '}'
    variables = {
        dateDebut: jourDebut,
        dateFin: jourFin,
        description: editAtelier.description || "Un nouvel atelier sympa !",
        espace: editAtelier.espace,
        nbParticipants: editAtelier.nbParticipants,
        surInscription: editAtelier.surInscription,
        tarifs: tarifs,
        titre: editAtelier.titre || "Un nouvel atelier A",
        urlImage: editAtelier.urlImage
    }
    if ($auth && $user) {
        flagSauvegardeEnCours = !flagDupliquer;
        flagDuplicationEnCours = flagDupliquer
        ajouterAtelier($auth, $user.estAdmin, variables).then((result)=> {
            flagSauvegardeSucces = !flagDupliquer
            flagDuplicationSucces = flagDupliquer
            flagSauvegardeEnCours = false
            flagDuplicationEnCours = false
            buildNeeded.set(true)
            fini()
        })
    }
}

function updateAtelier() {
    let variables = {}
    let heureDebutTemp = heureDebut.split('h')
    jourDebut.setHours(heureDebutTemp[0])
    jourDebut.setMinutes(heureDebutTemp[1])
    let heureFinTemp = heureFin.split('h')
    jourFin.setHours(heureFinTemp[0])
    jourFin.setMinutes(heureFinTemp[1])
    var tarifs='{'
    editAtelier.tarifs.forEach((tarif, index) => {
        if(index===0) {
          tarifs = tarifs + '{'+ tarif[0] + ', ' +  tarif[1] + ', ' + tarif[2] +'}'
        } else {
          tarifs = tarifs + ', {'+ tarif[0] + ', ' +  tarif[1] + ', ' + tarif[2] +'}'
        }
      })
    tarifs = tarifs + '}'
    variables = {
        id: editAtelier.id,
        dateDebut: jourDebut,
        dateFin: jourFin,
        description: editAtelier.description || "Un nouvel atelier sympa !",
        espace: editAtelier.espace,
        nbParticipants: editAtelier.nbParticipants,
        surInscription: editAtelier.surInscription,
        tarifs: tarifs,
        titre: editAtelier.titre || "Un nouvel atelier update",
        urlImage: editAtelier.urlImage
    }
    if ($auth && $user) {
        flagSauvegardeEnCours = true;
        majAtelier($auth, $user.estAdmin, variables).then((result)=> {
            buildNeeded.set(true)
            flagSauvegardeSucces = true
            flagSauvegardeEnCours = false
            fini()
        })
    }
}

function dupliqueAtelier() {
    let variables = {}
    let heureDebutTemp = heureDebut.split('h')
    jourDebut.setHours(heureDebutTemp[0])
    jourDebut.setMinutes(heureDebutTemp[1])
    let heureFinTemp = heureFin.split('h')
    jourFin.setHours(heureFinTemp[0])
    jourFin.setMinutes(heureFinTemp[1])
    var tarifs='{'
    editAtelier.tarifs.forEach((tarif, index) => {
        if(index===0) {
          tarifs = tarifs + '{'+ tarif[0] + ', ' +  tarif[1] + ', ' + tarif[2] +'}'
        } else {
          tarifs = tarifs + ', {'+ tarif[0] + ', ' +  tarif[1] + ', ' + tarif[2] +'}'
        }
      })
    tarifs = tarifs + '}'
    variables = {
        dateDebut: jourDebut,
        dateFin: jourFin,
        description: editAtelier.description || "Un nouvel atelier sympa !",
        espace: editAtelier.espace,
        nbParticipants: editAtelier.nbParticipants,
        surInscription: editAtelier.surInscription,
        tarifs: tarifs,
        titre: editAtelier.titre || "Un nouvel atelier Dupliqué",
        urlImage: editAtelier.urlImage
    }
    if ($auth && $user) {
        flagSauvegardeEnCours = !flagDupliquer;
        flagDuplicationEnCours = flagDupliquer
        ajouterAtelier($auth, $user.estAdmin, variables).then((result)=> {
            flagSauvegardeSucces = !flagDupliquer
            flagDuplicationSucces = flagDupliquer
            flagSauvegardeEnCours = false
            flagDuplicationEnCours = false
            buildNeeded.set(true)
            fini()
        })
    }
}
*/
function validationSauvegarde() {
    if (flagEdition) {
        updateAtelier()
    } else {
        sauveAtelier()
    }
}

function formatHoraire(e, horaire) {
        let l = horaire.length
    if (horaire.match(/^[0-9]$/g)===null 
        && horaire.match(/^([0-1]?[0-9]|2[0-3])$/gm)=== null 
        && horaire.match(/^([0-1]?[0-9]|2[0-3])h$/gm)=== null 
        && horaire.match(/^([0-1]?[0-9]|2[0-3])h[0-5]$/g)===null 
        && horaire.match(/^([0-1]?[0-9]|2[0-3])h[0-5][0-9]$/g)===null
        ) {
        if (horaire.match(/^([0-1]?[0-9]|2[0-3])[0-5]$/g) || horaire.match(/^([0-1]?[0-9]|2[0-3])[0-5][0-9]$/g)) {
            horaire = horaire.substr(0, 2) + "h"+ horaire.substr(2);
        } else {
            horaire = horaire.slice(0,-1)
        }
    }
    if ((e.key==="Backspace" || e.key==="Delete") && horaire.match(/^([0-1]?[0-9]|2[0-3])h$/gm))
    {
      horaire = horaire.slice(0,-1)  
    }
    return horaire
}

function effacerTarif(index) {
    editAtelier.lesTarifs.splice(index,1)
    editAtelier = editAtelier
}

function ajouterTarif() {
    editAtelier.lesTarifs.push({description: "Nouveau tarif", tarif: "10" , qf: false})
    editAtelier = editAtelier
}

function suppressionAtelier() {
    busyEffacerAtelier = true
    supprimerAtelier(editAtelier.id).then(async ()=>{
        busyEffacerAtelier = false
        buildNeeded.set(true)
        fini()
    })
}
</script>

<div class="w-480px p-1 bg-gray-900 flex flex-col border-gray-200">
    <label for="titre">
    Titre de l'atelier
        <input 
            bind:value= {editAtelier.titre}
            class="bg-gray-900 text-gray-200 focus:outline-none border border-bleuLBF rounded py-2 px-4 block w-full appearance-none leading-normal"
            type="text"
            id="titre"
            />
    </label>
    <label for="lieu" class="my-2">
    Lieu
        <input 
            bind:value= {editAtelier.lieu}
            class="bg-gray-900 text-gray-200 focus:outline-none border border-bleuLBF rounded py-2 px-4 block w-full appearance-none leading-normal"
            type="text"
            id="lieu"
            />
    </label>
    <label for="selectEspaces" class="mt-3 flex flex-row">
    <div class="mr-2 text-base font-medium  text-bleuLBF">Espace concerné</div>
        <select value={editAtelier.espaceId} id="selectEspaces" class="bg-gray-900 border border-bleuLBF rounded">
		{#each $espacesBF as espace}
			<option value={espace.id}>
				{espace.label}
			</option>
		{/each}
	    </select>
    </label>
    <div class="w-5/6 mx-auto mt-3">
        <ImageUpload dataImg={JSON.stringify(dataImg)} bind:urlImage={editAtelier.urlImage} options = {optionsURL} altImage="Illustration de l'atelier" classImage="rounded border-2 border-bleuLBF" />
    </div>
    <div class="flex flex-row items-center justify-between mt-4">
        <label for="nbParticipants" class="w-1/2 flex flex-row items-center text-vertLBF">
            <input 
                bind:value= {editAtelier.nbParticipants}
                class="bg-gray-900 text-gray-200 focus:outline-none focus:shadow-outline border border-vertLBF rounded py-2 text-center block w-1/6 appearance-none leading-normal"
                type="text"
                id="nbParticipant"
                />
            <div class="ml-2 text-base font-medium">Nb de participants</div>
        </label>
        <CheckBox label="sur inscription ?" cbClasses="text-vertLBF" bind:checked={editAtelier.surInscription}/>
    </div>
    <div class="flex flex-col text-vertLBF mt-3">
        <div class="flex flex-row justify-center my-2">
            <Datepicker
                start={deuxJourAvantDebut}
                end={jourFin}
                bind:selected={jourDebut}
                daysOfWeek={dateFr.jours}
                monthsOfYear={dateFr.mois}
                format={dateFormat}
                buttonBackgroundColor="#1a202c"
                buttonBorderColor="#93c021"
                buttonTextColor="#edf2f7"
                buttonWidth="300px"
                dayTextColor="#edf2f7"
                highlightColor="#93c021"
            />
        </div>
        <div class="flex flex-row justify-center">
            <label for="heureDebut" class="flex flex-row items-center">
                <div class="ml-8 mr-3 text-base font-medium">de :</div>
                <input 
                    bind:value={heureDebut}
                    class="bg-gray-900 text-gray-200 focus:outline-none border border-vertLBF rounded py-2 px-2 text-center block appearance-none leading-normal w-20"
                    type="text" 
                    id="heureDebut"
                    on:keyup={(event)=> {heureDebut = formatHoraire(event, heureDebut)}}
                    />
            </label>
            <label for="heureFin" class="flex flex-row items-center">
                <div class="ml-8 mr-3 text-base font-medium">à :</div>
                <input 
                    bind:value={heureFin}
                    class="bg-gray-900 text-gray-200 focus:outline-none border border-vertLBF rounded py-2 px-2 text-center block appearance-none leading-normal w-20"
                    type="text" 
                    id="heureFin"
                    on:keyup={(event)=> {heureFin = formatHoraire(event, heureFin)}}
                    />
            </label>
        </div>
    </div>
    <div class="mt-4 ">
        <div class="text-xl font-medium text-jauneLBF">Description :</div>
        <Editeur bind:contenu={editAtelier.description} couleur="jaune"/>
    </div>
    <div class="mt-4 ">
        <div class="flex flex-row justify-between mb-1">
            <div class="text-xl font-medium text-rougeLBF">Tarifs :</div>
            <button class="text-rougeLBF border border-rougeLBF rounded-sm p-1 focus:outline-none" on:click={ajouterTarif}>Ajouter un tarif</button>
        </div>
        <div class="flex flex-row flex-wrap justify-around">
            {#each editAtelier.lesTarifs as tarif, index}
                <div class="w-5/12 border border-rougeLBF rounded p-1 mx-2 my-2">
                    <div class="w-full flex flex-row justify-start items-center my-2">
                        <Fa icon={faEuroSign} fw size="lg" class="mx-1 w-8"/>
                        <input 
                            class="min-w-16 bg-gray-800 text-gray-200 focus:outline-none rounded p-0 px-1 appearance-none leading-normal"
                            type="text" 
                            bind:value={tarif.tarif}/>
                    </div>
                    <div class="flex flex-row items-center my-2">
                        <Fa icon={faEdit} fw size="lg" class="mx-1 w-8"/>
                        <input 
                            class="min-w-16 bg-gray-800 text-gray-200 focus:outline-none rounded p-0 px-1 block w-full appearance-none leading-normal"
                            type="text" 
                            bind:value={tarif.description}/>
                    </div>
                    <div class="flex flex-row justify-between items-center my-2 ml-2">
                        <CheckBox label="QF ?" cbClasses="text-gray-200" bind:checked={tarif.qf}/>
                        {#if index>0}
                            <div class="text-rougeLBF cursor-pointer focus:outline-none" on:click={() => {effacerTarif(index)}}>
                                <Fa icon={faTrashAlt} size="lg"  class="mx-1 w-8" />
                            </div>
                        {/if}
                    </div>
                </div>
            {/each}
        </div>
    </div>
    <div class="flex flex-row justify-end items-center mt-4">
        <Bouton on:actionBouton={fini} largeur="w-10" couleur="text-bleuLBF border-bleuLBF">
            <Fa icon={faArrowLeft} size="lg"  class="mx-auto" />
        </Bouton>
        {#if flagEdition && editAtelier.inscriptions_ateliers.length===0}
            <Bouton occupe={busyEffacerAtelier} on:actionBouton={() => flagConfirmationEffacerAtelier = true} largeur="w-10" couleur="text-rougeLBF border-rougeLBF">
                <Fa icon={faTrashAlt} size="lg"  class="mx-auto" />
            </Bouton>
        {/if}
        {#if flagEdition && editAtelier.inscriptions_ateliers.length!==0}
            <Bouton on:actionBouton={() => flagEnvoiEmail = true} largeur="w-10" couleur="text-violetLBF border-violetLBF">
                <Fa icon={faEnvelope} size="lg"  class="mx-auto" />
            </Bouton>
        {/if}
        {#if flagEdition}
            <Bouton on:actionBouton={() => flagListeInscrits = true} largeur="w-10" couleur="text-jauneLBF border-jauneLBF">
                <Fa icon={faUsers} size="lg"  class="mx-auto" />
            </Bouton>
            <Bouton occupe={flagDuplicationEnCours} succes={flagDuplicationSucces} on:actionBouton={() => {dupliqueAtelier()}} largeur="w-12" couleur="text-orangeLBF border-orangeLBF">
                <Fa icon={faCopy} size="lg"  class="mx-auto" />
            </Bouton>
        {/if}
        {#if !archive}
            <Bouton bind:occupe={flagSauvegardeEnCours} bind:succes={flagSauvegardeSucces} on:actionBouton={validationSauvegarde} largeur="w-12" couleur="text-vertLBF border-vertLBF">
                <Fa icon={faSave} size="lg" class="mx-auto" />
            </Bouton>
        {/if}
    </div>
</div>

<!-- confirme efface atelier -->
<Dialog bind:visible={flagConfirmationEffacerAtelier} on:close={() => {flagConfirmationEffacerAtelier=false}}>
    <h4 slot="title">Confirmation</h4>
    <p>Confirmer la suppression de l'atelier</p>
    <div slot="actions" class="flex flex-row justify-end items-center">
        <Bouton on:actionBouton={() => flagConfirmationEffacerAtelier = false}>Annuler</Bouton>
        <Bouton occupe={busyEffacerAtelier} on:actionBouton = {suppressionAtelier} couleur="text-orangeLBF border-orangeLBF">Confirmer</Bouton>
    </div>
</Dialog>

<!-- Liste des inscrits-->
<Dialog bind:visible={flagListeInscrits} on:close={() => {flagListeInscrits=false}}>
    <ListeInscrits nbParticipants={editAtelier.nbParticipants} idAtelier={editAtelier.id} archive={archive} on:close={() => {flagListeInscrits=false}}/>
</Dialog>
<!-- envoiyer email-->
<Dialog bind:visible={flagEnvoiEmail} on:close={() => {flagEnvoiEmail=false}}>
    <EnvoiEmail idAtelier={editAtelier.id} on:close={() => {flagEnvoiEmail=false}} />
</Dialog>

