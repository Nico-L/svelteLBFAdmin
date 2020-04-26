<script>
import {onMount} from 'svelte';
import { Calendar } from '@fullcalendar/core';
import timeGridPlugin from '@fullcalendar/timegrid';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import {listePlagesHoraires, listeMachines} from '../../graphQL/machines.js'
import { sauveReservation, listeReservations, effaceReservation, majReservation } from '../../graphQL/reservations.js'
import { envoieEmail } from './../../graphQL/emails.js'
import { auth } from "./../../stores/auth.js"
import { user } from "./../../stores/user.js"
import CheckBox from './../../components/CheckBox.svelte';
import Bouton from './../../components/Button/Button.svelte';
import Dialog from './../../components/Dialog.svelte'
import RadioBouton from './../../components/radioButton.svelte'
import Editeur from './../../components/editeur.svelte';
import Busy from '../../components/busy.svelte'
import Fa from 'svelte-fa'
import { faArrowLeft, faTrashAlt } from '@fortawesome/free-solid-svg-icons'
import { faSave, faEnvelope } from '@fortawesome/free-regular-svg-icons'

import { tableCouleursLBF } from './../../utils/couleursLBF.js'

let calendarEl;
let calendar;
let jourDebutCalendrier = (new Date()).getDay()
let firstSetup = false
let plagesHoraires = [[], [], [], [], [], [], []]
let businessHours = []
let nbPlagesJour = 4;
let lesMachines = []
let filtreReservations = [];
let listeReservationFiltrees=[]
let testTousFiltresFalse = false;
let testTousFiltresTrue = false;
let lesMachinesFiltrees = []
let flagNouvelleReservation = false;
let nouvelleReservation = {nom:"", prenom:"", email:"", dateDebut:"", dateFin:"", idMachine: ""}
let message = {sujet: "", message:""}
let busySauverReservation = false;
let lesReservations=[];
let resaOverlap = [];
let editResa = false;
let flagConfirmationEffacer = false;
let busyEffacerReservation = false;
let flagEnvoieMail = false;
let flagEnvoieMailOK = false;
let flagMAJReservation = false;
let flagOverlap = false;
let flagGetReservation = false;

function getlistePlages() {
    listePlagesHoraires($auth, $user.estAdmin).then((retour)=>{
        const retourPlage = retour[0].plages
        businessHours = []
        for(let i=0; i<7; i++) {
            for(let j=0; j<nbPlagesJour; j++) {
                if (retourPlage[i][j][0]!== null) {
                    plagesHoraires[i].push(retourPlage[i][j])
                        businessHours.push({
                            daysOfWeek: [i],
                            startTime: retourPlage[i][j][0],
                            endTime: retourPlage[i][j][1]                                
                        })
                }
            }
        }
        plagesHoraires = plagesHoraires
        businessHours = businessHours
    })
}

function getListeReservations() {
    flagGetReservation = true
    listeReservations($auth, $user.estAdmin).then((liste)=> {
        flagGetReservation = false
        lesReservations = liste;
    })
}

function getListeMachines() {
     listeMachines($auth, $user.estAdmin).then((liste)=> {
         console.log('listeMachine', liste)
         lesMachines = liste
         filtreReservations['tous'] = true
         liste.forEach((machine)=>{
             filtreReservations[machine.tag] = false
         })
     })
}

$: {
    if ($auth && $user) {
        getlistePlages()
        getListeMachines()
        getListeReservations()
    }
}

$: {
    if (calendar) {
        calendar.setOption('businessHours', businessHours)
        calendar.setOption('eventConstraint', 'businessHours')
        calendar.setOption('selectConstraint', 'businessHours')
    }
}

$: {
    if (calendar) {
        calendar.removeAllEvents()
        lesReservations.forEach((resa)=> {
            if (filtreReservations[resa.machine.tag] || filtreReservations['tous']) {
                const resaEvent = {
                    id: resa.id,
                    title: resa.machine.tag,
                    start: resa.dateDebut,
                    end: resa.dateFin,
                    backgroundColor: tableCouleursLBF[resa.machine.couleur].numCouleur,
                    borderColor: tableCouleursLBF[resa.machine.couleur].numCouleur,
                    extendedProps: resa
                }
                calendar.addEvent(resaEvent)
            }
        })
    }
}

$: {
    testTousFiltresFalse = false
    testTousFiltresTrue = true
    lesMachines.forEach((machine)=> {
        testTousFiltresFalse = testTousFiltresFalse || filtreReservations[machine.tag]
        testTousFiltresTrue = testTousFiltresTrue && filtreReservations[machine.tag]
    })
    if (testTousFiltresTrue) {resetFiltre(true); filtreReservations['tous'] = true} else {filtreReservations['tous'] = !testTousFiltresFalse}

}

onMount(()=> {
    calendar = new Calendar(calendarEl, {
        selectable: true,
        editable: true,
        eventStartEditable: false,
        eventResizableFromStart: true,
        plugins: [timeGridPlugin, dayGridPlugin, interactionPlugin],
        initialView: 'timeGridWeek',
        defaultView: 'timeGridWeek',
        locale: 'fr',
        firstDay: jourDebutCalendrier,
        slotDuration: '00:30',
        scrollTime: '09:00:00',
        slotMinTime: '09:00:00',
        slotMaxTime: '22:00:00',
        allDaySlot: false,
        buttonText: {
            today:    'aujourd\'hui',
            month:    'mois',
            week:     'semaine',
            day:      'jour',
            list:     'liste',
            month: 'vue mois',
            week: 'vue semaine'
            },
        headerToolbar: {
            right: 'prev,next today',
            center: 'title',
            left: 'dayGridMonth,timeGridWeek'
            },
        weekNumbers: true,
        weekText: "S",
        navLinks: true,
        navLinkDayClick: "timeGridWeek",
        select: function(info) {
            if (!flagOverlap) lesMachinesFiltrees = lesMachines
            nouvelleReservation = {nom:"", prenom:"", email:"", dateDebut:"", dateFin:"", idMachine: ""}
            nouvelleReservation.dateDebut = info.start;
            nouvelleReservation.dateFin = info.end;
            flagNouvelleReservation = true
        },
        eventOverlap: function(stillEvent, movingEvent) {
            return stillEvent.extendedProps.machine.id !== movingEvent.extendedProps.machine.id;
        },
        selectOverlap: function(event) {
            flagOverlap = true
            resaOverlap.push(event.extendedProps.machine.id)
            lesMachinesFiltrees = lesMachines.filter(machine => resaOverlap.indexOf(machine.id)<0)
            return true;
        },
        eventResize: function(info) {
            let resa = info.event.extendedProps
            nouvelleReservation = {
                id: resa.id,
                nom: resa.nom, 
                prenom:resa.prenom, 
                email: resa.email, 
                dateDebut: info.event.start, 
                dateFin: info.event.end, 
                idMachine: resa.machine.id
            }
            updateReservation()
        },
        eventDrop: function(info) {
        },
        eventClick: function(info) {
            console.log('info', info)
            let resa = info.event.extendedProps
            nouvelleReservation = {
                id: resa.id,
                nom: resa.nom, 
                prenom:resa.prenom, 
                email: resa.email, 
                dateDebut: resa.dateDebut, 
                dateFin: resa.dateFin, 
                idMachine: resa.machine.id,
                titreMachine: resa.machine.titre,
                urlImage: resa.machine.urlImage
            }
            resaOverlap = []
            lesReservations.forEach((resa) => {
                if ((info.event.start<=resa.dateDebut<=info.event.end) || (info.event.start<=resa.dateDebut<=info.event.end)) {
                    if(info.event.extendedProps.machine.id!==resa.machine.id) resaOverlap.push(resa.machine.id)
                }
            })
            lesMachinesFiltrees = lesMachines.filter(machine => resaOverlap.indexOf(machine.id)<0)
            editResa = true
            flagNouvelleReservation = true
        },
        eventContent: function (args) {
        } 
    });
    calendar.render();
})

function sauverReservation() {
    busySauverReservation = true
    if ($auth && $user) {
        sauveReservation($auth, $user.estAdmin, nouvelleReservation).then((retour)=> {
            getListeReservations()
            busySauverReservation = false
            flagNouvelleReservation = false
        })
    }
}

function updateReservation() {
    if (nouvelleReservation.id) {
        if (editResa) {busySauverReservation = true} else  {flagMAJReservation = true}
        let variables = {
            id: nouvelleReservation.id, 
            dateDebut: nouvelleReservation.dateDebut,
            dateFin: nouvelleReservation.dateFin,
            email: nouvelleReservation.email,
            idMachine: nouvelleReservation.idMachine,
            nom: nouvelleReservation.nom,
            prenom: nouvelleReservation.prenom
        }
        if($auth && $user) {
            majReservation($auth, $user.estAdmin, variables).then((retour)=> {
                flagMAJReservation = false
                busySauverReservation = false
                finiResa()
                getListeReservations()
            })
        }
    }
}

function effacerReservation() {
    if (nouvelleReservation.id) {
        busyEffacerReservation = true
        let variables = {
            idReservation: nouvelleReservation.id
        }
        effaceReservation($auth, $user.estAdmin, variables).then((retour)=> {
            flagConfirmationEffacer = false
            busyEffacerReservation = false
            finiResa()
            getListeReservations()
        })
    }
}

function finiResa() {
    editResa= false
    flagOverlap = false;
    resaOverlap = [];
    flagNouvelleReservation=false
}

function envoyerEmail() {
    if (message.sujet!=="" && message.message!=="" && message.message!=="<p><br></p>") {
        flagEnvoieMail = true
        var infoMail = {
            sujet: message.sujet,
            message: message.message,
            machine: nouvelleReservation.titreMachine,
            urlImage: "https://res.cloudinary.com/la-bonne-fabrique/image/upload/ar_1.5,w_auto,c_fill/" + nouvelleReservation.urlImage
        };
        var tableEmails = nouvelleReservation.email
        const variables = {
            email: tableEmails,
            templateId: "d-5e081fec5d1543d183be7cc16d0f1d26",
            template: JSON.stringify(infoMail)
        }
        if ($auth && $user) {
            envoieEmail($auth, $user.estAdmin, variables).then((retour)=>{
                flagEnvoieMail = false;
                flagEnvoieMailOK = true;
            }).catch((error) => {console.log('error', error)})
        }
    }
    
    
}

function resetFiltre(status) {
    if (status) {
        lesMachines.forEach((machine) => {
            filtreReservations[machine.tag] = false
        })
    }
}
</script>

<main>
<div class="border border-4 border-gray-600 bg-gray-800 rounded p-4 mt-2 mb-6">
    <h4>Filtrage des réservations</h4>
    <div class="flex flex-row items-center mt-2">
        <div class="mr-4">
            <CheckBox label="Tous" cbClasses="text-gray-400" bind:checked={filtreReservations['tous']} on:change={(val) => {resetFiltre(val.detail)}} />
        </div>
        {#each lesMachines as machine}
            <div class="mr-4 text">
                <CheckBox label={machine.tag} cbClasses={tableCouleursLBF[machine.couleur].classText} bind:checked={filtreReservations[machine.tag]} />
            </div>
        {/each}
    </div>
</div>

<div bind:this={calendarEl} ></div>
</main>
<!-- Liste des inscrits-->
<Dialog bind:visible={flagNouvelleReservation} on:close={() => finiResa()}>
    <div slot="title">Nouvelle Réservation</div>
        <div class="mb-2">
            <div class="flex flex-row">
            <label for="prenomResa" class="w-full mx-1 my-1 flex flex-col">
            <div>Prénom :</div>
                <input 
                bind:value={nouvelleReservation.prenom}
                class="p-1 text-sm bg-gray-800 text-gray-200 rounded focus:outline-none appearance-none leading-normal"
                type="text"
                id="prenomResa"
                />
            </label>
            <label for="nomResa" class="w-full mx-1 my-1 flex flex-col">
            <div>Nom :</div>
            <input 
                bind:value={nouvelleReservation.nom}
                class="w-full p-1 text-sm bg-gray-800 text-gray-200 rounded focus:outline-none appearance-none leading-normal"
                type="text"
                id="nomResa"
                />
                </label>
        </div>
        <label for="emailResa" class="mx-1 my-1 flex flex-col">
        <div>Email (requis) :</div>
        <input 
            bind:value={nouvelleReservation.email}
            class="p-1 text-sm bg-gray-800 text-gray-200 rounded focus:outline-none appearance-none leading-normal"
            type="text"
            id="emailResa"
            />
        </label>
        <h4>Machine concernée</h4>
        <div class="mt-2 flex flex-row items-center">
            {#each lesMachinesFiltrees as machine}
                <RadioBouton cbClasses={tableCouleursLBF[machine.couleur].classText} name="machineReservation" value={machine.id} bind:selected={nouvelleReservation.idMachine} label={machine.tag}/>
            {/each}
        </div>
    </div>
    <div slot="actions">
        <Bouton largeur="w-10" on:actionBouton={() => finiResa()} >
            <Fa icon={faArrowLeft} size="lg"  class="mx-auto" />
        </Bouton>
        {#if editResa}
            <Bouton largeur="w-12" couleur = "text-rougeLBF border-rougeLBF" on:actionBouton = {() => flagConfirmationEffacer = true} >
                <Fa icon={faTrashAlt} size="lg" class="mx-auto" />
            </Bouton>
        {/if}
        <Bouton largeur="w-12" couleur = "text-vertLBF border-vertLBF" occupe={busySauverReservation} on:actionBouton = {() => {if (editResa) {updateReservation()} else {sauverReservation()}}} disabled={nouvelleReservation.email==="" || nouvelleReservation.idMachine===""} >
            <Fa icon={faSave} size="lg" class="mx-auto" />
        </Bouton>
    </div>
</Dialog>
<!-- confirmation effacer Resa-->
<Dialog bind:visible={flagConfirmationEffacer} on:close={() => flagConfirmationEffacer = false}>
    <div slot="title">Confirmation</div>
    <div>
        <div class="max-w-480px">Merci de confirmer l'annulation de cette réservation. Vous pouvez envoyer un message à l'utilisateur expliquant l'annulation</div>
    </div>
    <div class="mt-4">
        <h4>Envoyer un message</h4>
            <label for="sujetEmail" class="mt-2">
            <div class="text-base text-bleuLBF">Sujet</div>
                    <input 
                    bind:value= {message.sujet}
                    class="bg-gray-900 text-gray-200 focus:outline-none border border-bleuLBF rounded py-2 px-4 block w-full appearance-none leading-normal"
                    type="text"
                    id="sujetEMail"
                    />
            </label>
            <div class="mt-2 ">
                <div class="text-base text-bleuLBF">Message</div>
                <Editeur bind:contenu={message.message} couleur="bleu"/>
            </div>
            <div class="text-right mt-2">
                 <Bouton disabled={message.sujet==="" || message.corps==="" || message.corps ==="<p><br></p>"} largeur="w-12" couleur="text-bleuLBF border-bleuLBF" on:actionBouton={() => {if (!flagEnvoieMailOK) {envoyerEmail()}}} occupe={flagEnvoieMail} succes={flagEnvoieMailOK}>
                    <Fa icon={faEnvelope} size="lg" class="mx-auto" />
                </Bouton>
            </div>
        </div>
    <div slot="actions">
        <Bouton largeur="w-10" on:actionBouton={() => flagConfirmationEffacer = false} >
            <Fa icon={faArrowLeft} size="lg"  class="mx-auto" />
        </Bouton>
        <Bouton largeur="w-12" couleur = "text-rougeLBF border-rougeLBF" on:actionBouton = {() => effacerReservation()} occupe={busyEffacerReservation}>
                <Fa icon={faTrashAlt} size="lg" class="mx-auto" />
        </Bouton>
    </div>
</Dialog>
<!-- update en cours -->
<Busy visible={flagMAJReservation} >Modification de la réservation en cours...</Busy>
<!-- rafraichissement réservation-->
<Busy visible={flagGetReservation} >Mise à jour de la liste des réservations en cours...</Busy>