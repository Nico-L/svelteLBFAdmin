<script>
import {onMount} from 'svelte';
import { Calendar } from '@fullcalendar/core';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import Busy from '../../components/busy.svelte'
import {majPlagesHoraires, listePlagesHoraires} from './../../graphQL/machines.js'
import { auth } from "./../../stores/auth.js"
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
            listePlagesHoraires($auth, $user.estAdmin).then((retour)=>{
                const retourPlage = retour[0].plages
                for(let i=0; i<7; i++) {
                    for(let j=0; j<nbPlagesJour; j++) {
                        if (retourPlage[i][j][0]!== null) {
                            lesPlages[i].push(retourPlage[i][j])
                        }
                    }
                }
                lesPlages = lesPlages
            })
        }

$: {
    if ($auth && $user) {
        getlistePlages()
    }
}

$: {
    if (calendar && hasChanged) {
        hasChanged = false
        let lesPlagesFormated = '{'
        lesPlages.forEach((jour, index)=> {
            if (index===0) {lesPlagesFormated += '{'} else {lesPlagesFormated += ',{'}
            for (let i = 0; i<nbPlagesJour; i++) {
                if (i===0) {lesPlagesFormated += '{'} else {lesPlagesFormated += ',{'}
                if (i<jour.length) {
                    lesPlagesFormated += '\"' + jour[i][0] + '\",\"' + jour[i][1] + '\"}'
                } else {
                    lesPlagesFormated += 'null, null}'
                }
            }
            lesPlagesFormated += '}'
        })
        lesPlagesFormated += '}'
        if ($auth && $user) {
            flagMAJ = true
            const variables = {
                plages: lesPlagesFormated
            }
            majPlagesHoraires($auth, $user.estAdmin, variables).then((retour)=>{
                flagMAJ = false
            })
        }
    }
    if (calendar) {
        calendar.removeAllEvents()
        lesPlages.forEach((jour, index)=> {
            if (jour.length>0) {
                jour.forEach((plage, index2)=> {
                    const plageEvent = {
                        id: index + '-' + index2,
                        daysOfWeek: index.toString(),
                        startTime: plage[0],
                        endTime: plage[1],
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
            lesPlages[jour].push([horaireDebut, horaireFin])
            hasChanged = true
            lesPlages = lesPlages
        },
        eventResize: function(info) {
            console.log('info resize', info)
            let jour = info.event.start.getDay()
            let minutesDebut = info.event.start.getMinutes()===0?"00":info.event.start.getMinutes()
            let minutesFin = info.event.end.getMinutes()===0?"00":info.event.end.getMinutes()
            let horaireDebut = info.event.start.getHours() + ":" + minutesDebut + ":00"
            let horaireFin = info.event.end.getHours() + ":" + minutesFin + ":00"
            let indices = info.event.id.split('-')
            hasChanged = true
            lesPlages[Number(indices[0])][Number(indices[1])] = [horaireDebut, horaireFin]
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
<!-- <div class="flex flex-row items-center">
    <RadioBouton cbClasses="text-vertLBF" name="typeSelection" value="plages" bind:selected={selectionReservation} label="Plages autorisées"/>
    <RadioBouton cbClasses="text-orangeLBF" name="typeSelection" value="reservations" bind:selected={selectionReservation} label="Réservations machines"/>
</div> -->
<div bind:this={calendarEl} ></div>
</main>
<!-- opération en cours -->
<Busy visible={flagMAJ} >mise à jour des horaires de réservation en cours...</Busy>