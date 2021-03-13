<script>
import {onMount} from 'svelte';
import { Calendar } from '@fullcalendar/core';
import timeGridPlugin from '@fullcalendar/timegrid';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
//import {listePlagesHoraires, listeMachines} from '../../graphQL/machines.js'
import {listeMachinesComplete, getListeHoraires} from '../../strapi/machines.js'
//import {effaceReservation } from '../../graphQL/reservations.js'
import {listeReservations, sauveReservation, majReservation, effaceReservation} from '../../strapi/reservationsMachines.js'
import {findUser} from '../../strapi/users.js'
import {imgProxyUrl} from '../../strapi/imgProxy.js'
//import { envoieEmail } from './../../graphQL/emails.js'
import {envoiEmail } from '../../strapi/email.js'
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
import { v4 as uuidv4 } from 'uuid';

import { tableCouleursLBF } from './../../utils/couleursLBF.js'

let calendarEl;
let calendar;
let jourDebutCalendrier = (new Date()).getDay()
let plagesHoraires = [[], [], [], [], [], [], []]
let businessHours = []
let lesMachines = []
let filtreReservations = [];
let listeReservationFiltrees=[]
let testTousFiltresFalse = false;
let testTousFiltresTrue = false;
let lesMachinesFiltrees = []
let flagNouvelleReservation = false;
let nouvelleReservation = {nom:"", prenom:"", email:"", dateDebut:"", dateFin:""}
let message = {sujet: "Annulation de votre réservation", message:"Nous sommes désolés de ne pas pouvoir assurer votre réservation."}
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
let flagUserNotFound = false;
const options = {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit"
    };
const optionsImg = {
        'resizing_type': 'fill',
        'width': 290,
        'height': 190,
        'gravity': 'ce'
    }

function getlistePlages() {
    getListeHoraires().then((retour)=>{
        var lesPlages = []
        lesPlages[0] = retour.dimanche
        lesPlages[1] = retour.lundi
        lesPlages[2] = retour.mardi
        lesPlages[3] = retour.mercredi
        lesPlages[4] = retour.jeudi
        lesPlages[5] = retour.vendredi
        lesPlages[6] = retour.samedi
        businessHours = []
        lesPlages.forEach((plage, index) => {
            plage.forEach((creneau) => {
                businessHours.push({
                    daysOfWeek: [index],
                    startTime: creneau.debut,
                    endTime: creneau.fin                                
                })
            })
        })
        businessHours = businessHours
    })
}

function getListeReservations() {
    flagGetReservation = true
    listeReservations().then((liste)=> {
        flagGetReservation = false
        lesReservations = liste;
    })
}

function getListeMachines() {
     listeMachinesComplete().then((liste)=> {
         lesMachines = liste
         filtreReservations['tous'] = true
         liste.forEach((machine)=>{
             filtreReservations[machine.nomRaccourci] = false
         })
     })
}

$: {
        //getlistePlages()
        getListeMachines()
        getListeReservations()
}

$: {
    if (calendar) {
        calendar.setOption('businessHours', businessHours)
        //calendar.setOption('eventConstraint', 'businessHours')
        //calendar.setOption('selectConstraint', 'businessHours')

    }
}

$: {
    if (calendar) {
        calendar.removeAllEvents()
        lesReservations.forEach((resa)=> {
            if (filtreReservations[resa.machine.nomRaccourci] || filtreReservations['tous']) {
                const heureDebutSplit = resa.heureDebut.split(':')
                const debutResa = new Date(resa.date)
                debutResa.setHours(heureDebutSplit[0])
                debutResa.setMinutes(heureDebutSplit[1])
                const heureFinSplit = resa.heureFin.split(':')
                const finResa = new Date(resa.date)
                finResa.setHours(heureFinSplit[0])
                finResa.setMinutes(heureFinSplit[1])
                const resaEvent = {
                    id: resa.id,
                    title: resa.machine.nomRaccourci,
                    start: debutResa,
                    end: finResa,
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
        testTousFiltresFalse = testTousFiltresFalse || filtreReservations[machine.nomRaccourci]
        testTousFiltresTrue = testTousFiltresTrue && filtreReservations[machine.nomRaccourci]
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
            nouvelleReservation = {nom:"", prenom:"", email:"", dateDebut:"", dateFin:""}
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
            const heureDebut = info.event.start.getHours() + ":" + (info.event.start.getMinutes() ===0 ? "00": "30") + ":00"
            const heureFin = info.event.end.getHours() + ":" + (info.event.end.getMinutes() ===0 ? "00": "30") + ":00"
            const dureeReservation = info.event.end.getHours() - info.event.start.getHours() + (info.event.end.getMinutes() - info.event.start.getMinutes())/60
            nouvelleReservation = {
                id: resa.id,
                heureDebut: heureDebut,
                heureFin: heureFin,
                dureeReservation: dureeReservation
            }
            updateReservation()
        },
        eventDrop: function(info) {
        },
        eventClick: function(info) {
            let resa = info.event.extendedProps
            nouvelleReservation = {
                id: resa.id,
                nom: resa.nom, 
                prenom:resa.prenom,
                user: resa.user.id,
                email: resa.user.email,
                date: resa.date,
                heureDebut: resa.heureDebut, 
                heureFin: resa.heureFin, 
                machine: resa.machine.id,
                machineReservee: resa.machine,
                titreMachine: resa.machine.nom,
                nomRaccourci: resa.machine.nomRaccourci,
                urlImageMachine: "https://cms.labonnefabrique.fr" + resa.machine.media.url
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
    findUser(nouvelleReservation.email).then((user) => {
        if (user.length > 0) {
            nouvelleReservation.user = user[0].id
            nouvelleReservation.date = new Date(nouvelleReservation.dateDebut)
            nouvelleReservation.heureDebut = nouvelleReservation.date.getHours() + ":" + (nouvelleReservation.date.getMinutes() === 0 ? "00":"30") + ":00"
            nouvelleReservation.heureFin = nouvelleReservation.dateFin.getHours() + ":" + (nouvelleReservation.dateFin.getMinutes() === 0 ? "00":"30") + ":00"
            nouvelleReservation.dureeReservation = nouvelleReservation.dateFin.getHours() - nouvelleReservation.date.getHours() + (nouvelleReservation.dateFin.getMinutes() - nouvelleReservation.date.getMinutes())/60
            nouvelleReservation.uuid = uuidv4()
            sauveReservation(nouvelleReservation).then((retour) => {
                mailConfirmation(retour.uuid, retour.machine)
                busySauverReservation = false
                flagNouvelleReservation = false
                finiResa()
                getListeReservations()
            })
        } else {
            flagUserNotFound = true
        }
    })
}

function updateReservation() {
    if (nouvelleReservation.id) {
        if (editResa) {busySauverReservation = true} else  {flagMAJReservation = true}
        majReservation(nouvelleReservation.id, nouvelleReservation).then((retour) => {
            flagMAJReservation = false
            busySauverReservation = false
            finiResa()
            getListeReservations() 
        })
    }
}

function effacerReservation() {
    if (nouvelleReservation.id) {
        busyEffacerReservation = true
        effaceReservation(nouvelleReservation.id).then((retour)=> {
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
        imgProxyUrl(nouvelleReservation.urlImageMachine, optionsImg).then((retour)=>{
            var infoMail = {
            sujet: message.sujet,
            message: message.message,
            machine: nouvelleReservation.machineReservee.nom,
            urlImage: retour.imgProxyUrl
            };
            var tableEmails = nouvelleReservation.email
            const variables = {
                from: "atelier@labonnefabrique.fr",
                to: tableEmails,
                replyTo: "atelier@labonnefabrique.fr",
                templateId: "d-5e081fec5d1543d183be7cc16d0f1d26",
                dynamicTemplateData: infoMail
            }
            envoiEmail(variables).then((retour)=>{
                flagEnvoieMail = false;
                flagEnvoieMailOK = true;
            }).catch((error) => {console.log('error', error)})
        })
    }    
}

function mailConfirmation(uuidResa, detailsMachine) {
    let tempDuree = (nouvelleReservation.dateFin - nouvelleReservation.dateDebut)/1000/60
    let dureeString = Math.floor(tempDuree/60) + "h"
    dureeString += tempDuree % 60 === 0 ? "00" : tempDuree % 60
    let dateDebut = new Date(nouvelleReservation.dateDebut)
    let arrayMails = [];
    arrayMails.push(nouvelleReservation.email);
    console.log('machine', detailsMachine)
    imgProxyUrl("https://cms.labonnefabrique.fr" + detailsMachine.media.url, optionsImg).then((retour)=>{
        let envoiMail = {
        machine: detailsMachine.nom,
        prenom: nouvelleReservation.prenom,
        duration: dureeString,
        jour: dateDebut
            .toLocaleDateString("fr-fr", options)
            .replace(":", "h"),
        urlDelete:
            "https://atelier.labonnefabrique.fr/reservations/?uuidReservation=" + uuidResa,
        altMachine: nouvelleReservation.titreMachine,
        urlImageMail: retour.imgProxyUrl
        };
        let variables = {
            from: "atelier@labonnefabrique.fr",
            to: arrayMails,
            replyTo: "atelier@labonnefabrique.fr",
            dynamicTemplateData: envoiMail,
            templateId: "d-08bb9e1b96ac4d56a9210660cac6cd07"
        }
        envoiEmail(variables)
    })
}

function resetFiltre(status) {
    if (status) {
        lesMachines.forEach((machine) => {
            filtreReservations[machine.nomRaccourci] = false
        })
    }
}
</script>

<main class="max-w-820px">
<div class="border border-4 border-gray-600 bg-gray-800 rounded p-4 mt-2 mb-6">
    <h4>Filtrage des réservations</h4>
    <div class="flex flex-row flex-wrap items-center mt-2">
        <div class="mr-4">
            <CheckBox label="Tous" cbClasses="text-gray-400" bind:checked={filtreReservations['tous']} on:change={(val) => {resetFiltre(val.detail)}} />
        </div>
        {#each lesMachines as machine}
            <div class="mr-4 text">
                <CheckBox label={machine.nomRaccourci} cbClasses={tableCouleursLBF[machine.couleur].classText} bind:checked={filtreReservations[machine.nomRaccourci]} />
            </div>
        {/each}
    </div>
</div>

<div bind:this={calendarEl} ></div>
</main>
<!-- form reservation -->
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
                <RadioBouton cbClasses={tableCouleursLBF[machine.couleur].classText} name="machineReservation" value={machine.id} bind:selected={nouvelleReservation.machine} label={machine.nomRaccourci}/>
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
        <Bouton largeur="w-12" couleur = "text-vertLBF border-vertLBF" occupe={busySauverReservation} on:actionBouton = {() => {if (editResa) {updateReservation()} else {sauverReservation()}}} disabled={nouvelleReservation.email==="" || nouvelleReservation.machine===""} >
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
        <div class="font-medium">destinataire : {nouvelleReservation.email}</div>
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
<Dialog bind:visible={flagUserNotFound} on:close={() => {busySauverReservation = false; flagUserNotFound = false}}>
    <div slot="title">Utilisateur inconnu</div>
    <div>
        <div class="max-w-480px">L'adresse email n'a pas été trouvée dans la base de donnée. L'utilisateur n'est peut-être pas enregistré.</div>
    </div>
    <div slot="actions">
        <Bouton largeur="w-10" on:actionBouton={() => {busySauverReservation = false; flagUserNotFound = false}} >
            <Fa icon={faArrowLeft} size="lg"  class="mx-auto" />
        </Bouton>
    </div>
</Dialog>
<!-- update en cours -->
<Busy visible={flagMAJReservation} >Modification de la réservation en cours...</Busy>
<!-- rafraichissement réservation-->
<Busy visible={flagGetReservation} >Mise à jour de la liste des réservations en cours...</Busy>