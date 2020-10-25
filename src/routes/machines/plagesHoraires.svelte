<script>
import {onMount} from 'svelte';
import { Calendar } from '@fullcalendar/core';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import Busy from '../../components/busy.svelte'
import {getListeHoraires, majListeHoraires} from "./../../strapi/machines.js"
//import { auth } from "./../../stores/auth.js"
import { user } from "./../../stores/user.js"

let calendarEl;
let calendar;
//let selectionReservation = "plages";
let lesPlages = [[], [], [], [], [], [], []]
let nbPlagesJour = 4
let hasChanged = false
let flagMAJ = false

function getlistePlages() {
            lesPlages = [[], [], [], [], [], [], []]
            getListeHoraires().then((retour)=>{
                lesPlages[0] = retour.dimanche
                lesPlages[1] = retour.lundi
                lesPlages[2] = retour.mardi
                lesPlages[3] = retour.mercredi
                lesPlages[4] = retour.jeudi
                lesPlages[5] = retour.vendredi
                lesPlages[6] = retour.samedi
            })
        }

$: {
    if ($user) {
        getlistePlages()
    }
}

$: {
    if (calendar && hasChanged) {
        hasChanged = false
        var horairesPourSauvegarde = {
            dimanche: lesPlages[0],
            lundi: lesPlages[1],
            mardi: lesPlages[2],
            mercredi: lesPlages[3],
            jeudi: lesPlages[4],
            vendredi: lesPlages[5],
            samedi: lesPlages[6]
        }
        flagMAJ = true
        majListeHoraires(horairesPourSauvegarde).then((retour) => {
            flagMAJ = false
        })
    }
    if (calendar) {
        calendar.removeAllEvents()
        lesPlages.forEach((jour, index)=> {
            if (jour.length>0) {
                jour.forEach((plage, index2)=> {
                    const plageEvent = {
                        id: index + '-' + index2,
                        daysOfWeek: index.toString(),
                        startTime: plage.debut,
                        endTime: plage.fin,
                        color: "#4bbcc4"
                    }
                    calendar.addEvent(plageEvent)
                })
            }
        })
    }
}

onMount(()=> {
    calendar = new Calendar(calendarEl, {
        selectable: true,
        editable: true,
        eventStartEditable: false,
        eventResizableFromStart: true,
        plugins: [timeGridPlugin, interactionPlugin],
        defaultView: 'timeGridWeek',
        locale: 'fr',
        firstDay: 1,
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
            list:     'liste'
            },
        select: function(info) {
            let jour = info.start.getDay()
            let minutesDebut = info.start.getMinutes()===0?"00":info.start.getMinutes()
            let minutesFin = info.end.getMinutes()===0?"00":info.end.getMinutes()
            let horaireDebut = info.start.getHours() + ":" + minutesDebut + ":00"
            let horaireFin = info.end.getHours() + ":" + minutesFin + ":00"
            lesPlages[jour].push({debut: horaireDebut, fin: horaireFin})
            hasChanged = true
            lesPlages = lesPlages
        },
        eventResize: function(info) {
            let jour = info.event.start.getDay()
            let minutesDebut = info.event.start.getMinutes()===0?"00":info.event.start.getMinutes()
            let minutesFin = info.event.end.getMinutes()===0?"00":info.event.end.getMinutes()
            let horaireDebut = info.event.start.getHours() + ":" + minutesDebut + ":00"
            let horaireFin = info.event.end.getHours() + ":" + minutesFin + ":00"
            let indices = info.event.id.split('-')
            hasChanged = true
            lesPlages[Number(indices[0])][Number(indices[1])] = {debut: horaireDebut, fin: horaireFin}
        },
        eventDrop: function(info) {
        },
        eventClick: function(info) {
            let indices = info.event.id.split('-')
            lesPlages[Number(indices[0])].splice(Number(indices[1]),1)
            hasChanged = true
            lesPlages = lesPlages
        },
        eventContent: function (args) {
        } 
    });
    calendar.render();
})
</script>

<main class="mt-4 mb-3">
<div bind:this={calendarEl} ></div>
</main>
<!-- opération en cours -->
<Busy visible={flagMAJ} >mise à jour des horaires de réservation en cours...</Busy>