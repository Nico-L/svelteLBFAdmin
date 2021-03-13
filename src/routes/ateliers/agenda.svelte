<script>
import {onDestroy} from 'svelte'
import {buildSiteAtelier} from './../../strapi/updateNetlify.js'
import FormAtelier from './../../components/FormAtelier.svelte'
import ListeInscrits from './../../components/listeInscritsAtelier.svelte'
import EnvoiEmail from './../../components/emailToInscritsAtelier.svelte'
import Dialog from '../../components/Dialog.svelte';
import Busy from '../../components/busy.svelte'
import {onMount} from 'svelte';
import { Calendar } from '@fullcalendar/core';
import timeGridPlugin from '@fullcalendar/timegrid';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import { listeAteliers, listeAteliersFuturs, editerAtelier, listeInscrits } from "../../strapi/ateliers.js"
import { user } from "./../../stores/user.js"
import { setDate, getMinutes } from "./../../utils/dateFr.js"
import {buildNeeded} from "./../../stores/build.js"

let flagDialogAtelier = false;
var flagListeInscrits = false;
var flagEnvoiEmail = false;
let dateDebutAtelier = new Date();
let dateFinAtelier = new Date();

let calendarEl;
let calendar;
let jourDebutCalendrier = (new Date()).getDay();
let lesAteliers=[];
let flagMAJAtelier = false;
let flagEdition = false;
let dataAtelier = {
    id: "",
    titre:"",
    espace: {id: 2},
    illustration:{},
    nbParticipants: 8,
    surInscription: true,
    dateDebut: new Date(),
    dateFin: new Date(),
    description: "Une description",
    inscriptions_ateliers:[],
    tarifs: [ { description: "Adhérent", tarif: "10", qf: true }, { description: "Non adhérent", tarif: "15", qf: false} ]
}

var eventEditAdded = []

function majListeAteliers() {

    flagDialogAtelier = false
    flagMAJAtelier = true
    listeAteliersFuturs().then((ateliers) => {
        lesAteliers = []
        flagMAJAtelier = false
        ateliers.forEach((atelier)=> {
            flagMAJAtelier = true
            listeInscrits(atelier.id).then((listeInscrits)=> {
                atelier.inscriptions_ateliers = listeInscrits
                lesAteliers = [... lesAteliers, atelier]
                flagMAJAtelier = false
            })
        })
    })
}

function updateHoraireAtelier(id, debut, fin) {
    flagMAJAtelier = true
    var minDebut = "30"
    if ((new Date(debut)).getMinutes()===0) minDebut = "00"
    const horaireDebut = (new Date(debut)).getHours() + ":" + minDebut + ":00"
    var minFin = "30"
    if ((new Date(fin)).getMinutes()===0) minFin = "00"
    const horaireFin = (new Date(fin)).getHours() + ":" + minFin + ":00"
    const variables = {
        date: new Date(debut),
        debut: horaireDebut,
        fin: horaireFin
    }
    editerAtelier(id, variables).then((retour) => {
            buildNeeded.set(true)
            flagMAJAtelier = false
            majListeAteliers()
        })
}

$: {
    if (calendar) {
        calendar.removeAllEvents()
        lesAteliers.forEach((atelier)=> {
            const atelierEvent = {
                id: atelier.id,
                title: atelier.titre,
                start: setDate(atelier.date, atelier.debut),
                end: setDate(atelier.date, atelier.fin),
                editable: atelier.inscriptions_ateliers.length===0,
                extendedProps: atelier,
                color: "#ee732e"
            }
            calendar.addEvent(atelierEvent)
            
        })
    }
}

$: {
    lesAteliers.forEach((atelier)=> {
        const editId = 'btn-edit-' + atelier.id
        const elementEdit = document.getElementById(editId)
        if (elementEdit !== null) {
            elementEdit.addEventListener('click', function () {
                    flagEdition = true
                    dataAtelier = {}
                    dataAtelier = atelier
                    console.log('dataAtelier', dataAtelier)
                    flagDialogAtelier = true
                })    
        }
        const usersId = 'btn-inscrits-' + atelier.id
        const elementUsers = document.getElementById(usersId)
        if (elementUsers !== null) {
            elementUsers.addEventListener('click', function () {
                    flagEdition = true
                    dataAtelier = {}
                    dataAtelier = atelier
                    flagListeInscrits = true
                })    
        }
        const emailId = 'btn-email-' + atelier.id
        const elementEmail = document.getElementById(emailId)
        if (elementEmail !== null) {
            elementEmail.addEventListener('click', function () {
                    flagEdition = true
                    dataAtelier = {}
                    dataAtelier = atelier
                    flagEnvoiEmail = true
                })    
        }
    })
}

onMount(async ()=> {
    majListeAteliers()
    calendar = new Calendar(calendarEl, {
        height: "auto",
        selectable: true,
        editable: true,
        plugins: [timeGridPlugin, dayGridPlugin, interactionPlugin],
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
            const horaireDebut = {
                heures: info.start.getHours(),
                minutes: info.start.getMinutes()
            }
            const horaireFin = {
                heures: info.end.getHours(),
                minutes: info.end.getMinutes()
            }
            dataAtelier = {
                id: "",
                titre:"",
                espace: {id: 2},
                illustration: {},
                nbParticipants: 8,
                surInscription: true,
                date: info.start,
                debut: horaireDebut.heures + ":" + horaireDebut.minutes,
                fin: horaireFin.heures + ":" + horaireFin.minutes,
                description: "Une description",
                inscriptions_ateliers:[],
                tarifs: [ { description: "Adhérent", tarif: "10", qf: true }, { description: "Non adhérent", tarif: "15", qf: false} ]
            }
            flagEdition = false
            flagDialogAtelier = true
        },
        eventResize: function(info) {
            updateHoraireAtelier(info.event.id, info.event.start, info.event.end)
        },
        eventDrop: function(info) {
            updateHoraireAtelier(info.event.id, info.event.start, info.event.end)
        },
        eventClick: function(info) {
            if (info.view.type !== "timeGridWeek") {
            flagEdition = true
            dataAtelier = {}
            dataAtelier = info.event.extendedProps
            flagDialogAtelier = true
            }
        },
        eventDidMount: function(args) {
            if (args.view.type === "timeGridWeek") {
                const id = parseInt(args.event._def.publicId)
                const elementId = 'btn-edit-' + id.toString()
                const element = document.getElementById(elementId)
                const atelier = lesAteliers.filter(atelier => atelier.id == id)
                element.addEventListener('click', function () {
                    flagEdition = true
                    dataAtelier = {}
                    dataAtelier = atelier[0]
                    flagDialogAtelier = true
                })
                const usersId = 'btn-inscrits-' + id.toString()
                const elementUsers = document.getElementById(usersId)
                elementUsers.addEventListener('click', function () {
                    flagEdition = true
                    dataAtelier = {}
                    dataAtelier = atelier[0]
                    flagListeInscrits = true
                })    
                const emailId = 'btn-email-' + id.toString()
                const elementEmail = document.getElementById(emailId)
                elementEmail.addEventListener('click', function () {
                    flagEdition = true
                    dataAtelier = {}
                    dataAtelier = atelier[0]
                    flagEnvoiEmail = true
                })
            }  
        },
        eventContent: function (args) {
            var listeNodes = []
            const urlImage = "https://cms.labonnefabrique.fr" + args.event.extendedProps.illustration.media.url
            if (args.view.type === "timeGridWeek") {
                const dureeEvent = getMinutes(args.event.extendedProps.fin) - getMinutes(args.event.extendedProps.debut)
                if (dureeEvent > 90) {
                    const imageDiv = document.createElement('div')
                    imageDiv.classList.add('event-imgDiv-atelier')
                    const image = document.createElement('img')
                    image.setAttribute('src', urlImage)
                    image.classList.add('event-img-atelier')
                    imageDiv.appendChild(image)
                    listeNodes.push(imageDiv)
                }
                const leTitre = document.createElement('div')
                leTitre.classList.add('event-titre-atelier')
                if (dureeEvent < 90 ) {
                    leTitre.classList.add('event-titre-decale')
                }
                leTitre.textContent = args.event.title;
                listeNodes.push(leTitre)

                const boutons = document.createElement('div')
                boutons.classList.add('event-boutons')
                // bouton nb inscrits
                const inscrits = document.createElement('div')
                inscrits.classList.add('event-inscrits')
                inscrits.classList.add('event-bouton')
                inscrits.setAttribute('id', 'btn-inscrits-' + args.event.id.toString())
                const SVG = document.createElementNS("http://www.w3.org/2000/svg", "svg")
                SVG.setAttribute('aria-hidden', "true")
                SVG.setAttribute("width", "16")
                SVG.setAttribute("height", "16")
                SVG.setAttribute("viewBox", "0 0 640 512")
                const pathSVG = document.createElementNS("http://www.w3.org/2000/svg", 'path')
                pathSVG.setAttribute('d', "M96 224c35.3 0 64-28.7 64-64s-28.7-64-64-64-64 28.7-64 64 28.7 64 64 64zm448 0c35.3 0 64-28.7 64-64s-28.7-64-64-64-64 28.7-64 64 28.7 64 64 64zm32 32h-64c-17.6 0-33.5 7.1-45.1 18.6 40.3 22.1 68.9 62 75.1 109.4h66c17.7 0 32-14.3 32-32v-32c0-35.3-28.7-64-64-64zm-256 0c61.9 0 112-50.1 112-112S381.9 32 320 32 208 82.1 208 144s50.1 112 112 112zm76.8 32h-8.3c-20.8 10-43.9 16-68.5 16s-47.6-6-68.5-16h-8.3C179.6 288 128 339.6 128 403.2V432c0 26.5 21.5 48 48 48h288c26.5 0 48-21.5 48-48v-28.8c0-63.6-51.6-115.2-115.2-115.2zm-223.7-13.4C161.5 263.1 145.6 256 128 256H64c-35.3 0-64 28.7-64 64v32c0 17.7 14.3 32 32 32h65.9c6.3-47.4 34.9-87.3 75.2-109.4z");
                SVG.appendChild(pathSVG)
                inscrits.appendChild(SVG)
                const nbInscrits = document.createElement('div')
                nbInscrits.classList.add('event-nbInscrits')
                nbInscrits.textContent = args.event.extendedProps.inscriptions_ateliers.length
                inscrits.appendChild(nbInscrits)
                boutons.appendChild(inscrits)

                // bouton edit fiche
                const edit = document.createElement('div')
                edit.classList.add('event-bouton')
                edit.setAttribute('id', 'btn-edit-' + args.event.id.toString())
                const SVG2 = document.createElementNS("http://www.w3.org/2000/svg", "svg")
                SVG2.setAttribute('aria-hidden', "true")
                SVG2.setAttribute("width", "16")
                SVG2.setAttribute("height", "16")
                SVG2.setAttribute("viewBox", "0 0 576 512")
                const pathSVG2 = document.createElementNS("http://www.w3.org/2000/svg", 'path')
                pathSVG2.setAttribute('d', "M402.3 344.9l32-32c5-5 13.7-1.5 13.7 5.7V464c0 26.5-21.5 48-48 48H48c-26.5 0-48-21.5-48-48V112c0-26.5 21.5-48 48-48h273.5c7.1 0 10.7 8.6 5.7 13.7l-32 32c-1.5 1.5-3.5 2.3-5.7 2.3H48v352h352V350.5c0-2.1.8-4.1 2.3-5.6zm156.6-201.8L296.3 405.7l-90.4 10c-26.2 2.9-48.5-19.2-45.6-45.6l10-90.4L432.9 17.1c22.9-22.9 59.9-22.9 82.7 0l43.2 43.2c22.9 22.9 22.9 60 .1 82.8zM460.1 174L402 115.9 216.2 301.8l-7.3 65.3 65.3-7.3L460.1 174zm64.8-79.7l-43.2-43.2c-4.1-4.1-10.8-4.1-14.8 0L436 82l58.1 58.1 30.9-30.9c4-4.2 4-10.8-.1-14.9z");
                SVG2.appendChild(pathSVG2)
                edit.appendChild(SVG2)
                boutons.appendChild(edit)

                // bouton envoyer mail
                const email = document.createElement('div')
                email.classList.add('event-bouton')
                email.setAttribute('id', 'btn-email-' + args.event.id.toString())
                const SVG3 = document.createElementNS("http://www.w3.org/2000/svg", "svg")
                SVG3.setAttribute('aria-hidden', "true")
                SVG3.setAttribute("width", "16")
                SVG3.setAttribute("height", "16")
                SVG3.setAttribute("viewBox", "0 0 512 512")
                const pathSVG3 = document.createElementNS("http://www.w3.org/2000/svg", 'path')
                pathSVG3.setAttribute('d', "M464 64H48C21.49 64 0 85.49 0 112v288c0 26.51 21.49 48 48 48h416c26.51 0 48-21.49 48-48V112c0-26.51-21.49-48-48-48zm0 48v40.805c-22.422 18.259-58.168 46.651-134.587 106.49-16.841 13.247-50.201 45.072-73.413 44.701-23.208.375-56.579-31.459-73.413-44.701C106.18 199.465 70.425 171.067 48 152.805V112h416zM48 400V214.398c22.914 18.251 55.409 43.862 104.938 82.646 21.857 17.205 60.134 55.186 103.062 54.955 42.717.231 80.509-37.199 103.053-54.947 49.528-38.783 82.032-64.401 104.947-82.653V400H48z");
                SVG3.appendChild(pathSVG3)
                email.appendChild(SVG3)
                boutons.appendChild(email)

                listeNodes.push(boutons)

                return { domNodes: listeNodes }
            }
        } 
    });
    calendar.render();
})

onDestroy(()=> {
    if ($buildNeeded) {
        buildSiteAtelier()
        buildNeeded.set(false)
    }
})

</script>

<main class="max-w-820px">
    <div bind:this={calendarEl} ></div>
    <!-- operation en cours -->
    <Busy visible={flagMAJAtelier} >Modification de la fiche atelier en cours...</Busy>
</main>
<!-- dialog info Atelier -->
<Dialog bind:visible={flagDialogAtelier} on:close={majListeAteliers}>
    <FormAtelier bind:editAtelier={dataAtelier} bind:flagEdition={flagEdition} on:close={majListeAteliers}/>
</Dialog>
<!-- Liste des inscrits-->
<Dialog bind:visible={flagListeInscrits} on:close={() => {flagListeInscrits=false}}>
    <ListeInscrits nbParticipants={dataAtelier.nbParticipants} idAtelier={dataAtelier.id} on:close={() => {flagListeInscrits=false}}/>
</Dialog>
<!-- envoyer email-->
<Dialog bind:visible={flagEnvoiEmail} on:close={() => {flagEnvoiEmail=false}}>
    <EnvoiEmail idAtelier={dataAtelier.id} on:close={() => {flagEnvoiEmail=false}} />
</Dialog>