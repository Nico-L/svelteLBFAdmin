<script>
import { onMount, createEventDispatcher} from 'svelte';
const dispatch = createEventDispatcher();
//import { auth } from "./../stores/auth.js"
import { user } from "./../stores/user.js"
import Editeur from './editeur.svelte';
import Bouton from './Button/Button.svelte';
import Fa from 'svelte-fa'
import { faTrashAlt, faCheck, faArrowLeft } from '@fortawesome/free-solid-svg-icons'
import { faSave, faEnvelope } from '@fortawesome/free-regular-svg-icons'
import {listeInscrits} from './../strapi/ateliers.js'
import {envoiEmail} from "./../strapi/email.js"
import {imgproxyURL} from "../apollo/imgproxyUrl.js"
import { dateLisible } from "./../utils/dateFr.js"
const optionsImg = {
    'resizing_type': 'fill',
    'width': 290,
    'height': 190,
    'gravity': 'ce'
}

let lesInscrits = []
export let idAtelier = ""

let message= {
    sujet: "",
    corps: ""
}

let flagEnvoiMail = false;
let flagEnvoieMailOK = false;

function envoyerEmail() {
    if (message.sujet!=="" && message.corps!=="" && message.corps!=="<p><br></p>" && idAtelier!=="") {
        flagEnvoiMail = true
        var tableEmails = []
        listeInscrits(idAtelier).then((inscrits)=> {
            const infoAtelier = inscrits[0].atelier
            tableEmails = inscrits.map( inscrit => inscrit.email)
            imgproxyURL(infoAtelier.urlImage, optionsImg).then((urlImage) => {
                var infoMail = {
                    sujet: message.sujet,
                    message: message.corps,
                    titreAtelier: infoAtelier.titre,
                    date: dateLisible(infoAtelier.date, infoAtelier.debut, infoAtelier.fin),
                    urlDesinscription: "https://atelier.labonnefabrique.fr/",
                    altMachine: "Illustration Atelier",
                    urlImage: urlImage.imgproxyURL
                };
                const variables = {
                    from: "atelier@labonnefabrique.fr",
                    to: tableEmails,
                    replyTo: "atelier@labonnefabrique.fr",
                    templateId: "d-a3a4bd4f471742f7a092f2872b9917b1",
                    dynamicTemplateData: infoMail
                }
                envoiEmail(variables).then((retour => {
                    flagEnvoiMail = false
                    message.sujet = ""
                    message.corps = ""
                }))
            })
        })
    }
}
</script>

<main>
<h4>Envoyer un message aux inscrits</h4>
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
        <Editeur bind:contenu={message.corps} couleur="bleu"/>
    </div>
    <div class="flex flex-row justify-end items-center mt-4">
        <Bouton largeur="w-10" couleur="text-bleuLBF border-bleuLBF" on:actionBouton={()=>{dispatch('close')}}>
            <Fa icon={faArrowLeft} size="lg"  class="mx-auto" />
        </Bouton>
        <Bouton disabled={message.sujet==="" || message.corps==="" || message.corps ==="<p><br></p>"} largeur="w-12" couleur="text-vertLBF border-vertLBF" on:actionBouton={() => {if (!flagEnvoieMailOK) {envoyerEmail()}}} occupe={flagEnvoiMail} succes={flagEnvoieMailOK}>
            <Fa icon={faEnvelope} size="lg" class="mx-auto" />
        </Bouton>
    </div>
</main>