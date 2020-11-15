<script>
import {onDestroy} from 'svelte'
import {buildSiteAtelier} from './../../strapi/updateNetlify.js'
import FormAtelier from './../../components/FormAtelier.svelte'
import Dialog from '../../components/Dialog.svelte';
import Busy from '../../components/busy.svelte'
import {onMount} from 'svelte';
import { Calendar } from '@fullcalendar/core';
import timeGridPlugin from '@fullcalendar/timegrid';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import { listeAteliers, editerAtelier, listeInscrits } from "../../strapi/ateliers.js"
import { user } from "./../../stores/user.js"
import { setDate } from "./../../utils/dateFr.js"
import {buildNeeded} from "./../../stores/build.js"

let flagDialogAtelier = false;
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
    espaceId: 4,
    urlImage: "https://cms.labonnefabrique.fr/uploads/logo_LBF_bb0853ef96.png",
    nbParticipants: 8,
    surInscription: true,
    dateDebut: new Date(),
    dateFin: new Date(),
    description: "Une description",
    inscriptions_ateliers:[],
    lesTarifs: [ { description: "Adhérent", tarif: "10", qf: true }, { description: "Non adhérent", tarif: "15", qf: false} ]
}

function majListeAteliers() {

    flagDialogAtelier = false
    flagMAJAtelier = true
    listeAteliers().then((ateliers) => {
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
                espace: {id: 4},
                urlImage: "https://cms.labonnefabrique.fr/uploads/logo_LBF_bb0853ef96.png",
                nbParticipants: 8,
                surInscription: true,
                date: info.start,
                debut: horaireDebut.heures + ":" + horaireDebut.minutes,
                fin: horaireFin.heures + ":" + horaireFin.minutes,
                description: "Une description",
                inscriptions_ateliers:[],
                lesTarifs: [ { description: "Adhérent", tarif: "10", qf: true }, { description: "Non adhérent", tarif: "15", qf: false} ]
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
            flagEdition = true
            dataAtelier = {}
            dataAtelier = info.event.extendedProps
            flagDialogAtelier = true
        },
        eventContent: function (args) {
            if (args.view.type === "timeGridWeek") {
                let leTitre = document.createElement('div')
                leTitre.classList.add('event-titre-atelier')
                leTitre.textContent = args.event.title
                //let illustration = document.createElement('img')
                //illustration.src='https://cms.labonnefabrique.fr' + args.event.extendedProps.illustration[0].formats.thumbnail.url
                //illustration.classList.add('event-img-atelier')
                let arrayOfDomNodes = [ leTitre ]
                return { domNodes: arrayOfDomNodes }
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

<main >
    <div bind:this={calendarEl} ></div>
    <!-- dialog info Atelier -->
    <Dialog bind:visible={flagDialogAtelier} on:close={majListeAteliers}>
        <FormAtelier bind:dataAtelier={dataAtelier} bind:flagEdition={flagEdition} on:close={majListeAteliers}/>
    </Dialog>
    <!-- operation en cours -->
    <Busy visible={flagMAJAtelier} >Modification de la fiche atelier en cours...</Busy>
</main>