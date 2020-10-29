<script>
import Bouton from './../../components/Button/Button.svelte';
import CheckBoxAlone from './../../components/CheckBoxAlone.svelte';
import RadioBouton from './../../components/radioButton.svelte'
import {findUser, majUser} from '../../strapi/users.js'
import Datepicker from './../../components/SvelteCalendar/Datepicker.svelte'
import { dateFr } from './../../utils/dateFr.js'
import Chargement from './../../components/chargement.svelte'
import Fa from 'svelte-fa'
import { faSave } from '@fortawesome/free-regular-svg-icons'

var userEmail = ""
var utilisateur = {}
var message = "Entrer une adresse pour trouver un utilisateur"
var flagRechercheEnCours = false
var flagUserFound = false
var deuxJoursAvantAbonnement = new Date()
var deuxAnsApresAbonnement = new Date()
let  dateFormat = "#{l} #{j} #{F} #{Y}"
var flagMAJEnCours = false
var flagDateChoisie = false

$: {
    if(/([a-zA-Z0-9+._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9_-]+)/i.exec(userEmail) === null && flagUserFound) {
        flagUserFound = false
    }
}

$: {
    if (utilisateur.abonnementMachine)
    {
        deuxJoursAvantAbonnement = new Date(utilisateur.abonnementMachine)
        deuxJoursAvantAbonnement.setDate(deuxJoursAvantAbonnement.getDate()-2)
        deuxAnsApresAbonnement = new Date(utilisateur.abonnementMachine)
        deuxAnsApresAbonnement.setMonth(deuxAnsApresAbonnement.getMonth()+24)
    }
}

function chercherUtilisateur () {
    if(/([a-zA-Z0-9+._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9_-]+)/i.exec(userEmail) !== null) {
        flagRechercheEnCours = true
        findUser(userEmail.toLowerCase()).then((retour) => {
            if (retour.length === 0) {
                flagUserFound = false
                flagRechercheEnCours = false
                message = "Aucun résultat, cette adresse email n'est pas dans notre base."
            } else {
                utilisateur = retour[0]
                utilisateur.role = utilisateur.role.id
                console.log('utilisateur', utilisateur)
                if (utilisateur.abonnementMachine) {
                    utilisateur.abonnementMachine = new Date(utilisateur.abonnementMachine)
                } else {
                    utilisateur.abonnementMachine = new Date()
                }

                flagUserFound = true
                flagRechercheEnCours = false
            }
        })

    } else {
        flagUserFound = false
        message = "Adresse email mal formée."
    }
}

function majUtilisateur () {
    flagMAJEnCours = true
    majUser(utilisateur.id, utilisateur).then((retour) => {
        flagMAJEnCours = false
        flagDateChoisie = false
    })
}

</script>

<main class="mt-4 mb-3 max-w-620px">
        <div class="flex flex-row items-end">
            <label for="userEmail">
                Entrer une adresse email
                    <input 
                        bind:value= {userEmail}
                        class="bg-gray-900 text-gray-200 focus:outline-none border border-bleuLBF rounded py-2 px-4 block w-full appearance-none leading-normal"
                        type="text"
                        id="userEmail"

                        />
            </label>
            <div class="ml-1">
                <Bouton on:actionBouton={chercherUtilisateur} occupe={flagRechercheEnCours} succes={flagUserFound}>OK</Bouton>
            </div>
        </div>
        {#if !flagUserFound}
            <div class="mt-2">
                {message}
            </div>
        {:else}
            <div class="mt-2">
                &nbsp;
            </div>
        {/if}
        {#if utilisateur.id}
            <div class="mt-4">
                <div class="h4 mt-2">Abonnement Machine</div>
                <div class="ml-4 flex flex-row items-center">
                    <div class="mr-2">Valable jusque : </div>
                    <div>
                        <Datepicker
                            start={deuxJoursAvantAbonnement}
                            end={deuxAnsApresAbonnement}
                            bind:selected={utilisateur.abonnementMachine}
                            bind:dateChosen = {flagDateChoisie}
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
                </div>
                <div class="h4 mt-2">Autorisation machines</div>
                <table class="table-auto border-collapse border-2 border-gray-300 mt-1 ml-4">
                    <thead>
                        <tr>
                        <th class="border border-gray-600 px-2 py-1 text-bleuLBF">Scie/toupie</th>
                        <th class="border border-gray-600 px-2 py-1 text-bleuLBF">Rabot/dégau</th>
                        <th class="border border-gray-600 px-2 py-1 text-bleuLBF">CNC</th>
                        <th class="border border-gray-600 px-2 py-1 text-bleuLBF">laser</th>
                        </tr>
                    </thead>
                    <tr class="py-1">
                        <td class="border border-gray-600">
                            <div class="w-8 mx-auto">
                                <CheckBoxAlone label="scie" cbClasses="text-bleuLBF" bind:checked={utilisateur.scie_toupie} />
                            </div>
                        </td>
                                <td class="border border-gray-600">
                            <div class="w-8 mx-auto">
                                <CheckBoxAlone label="rabo" cbClasses="text-bleuLBF" bind:checked={utilisateur.rabo_degau} />
                            </div>
                        </td>
                        <td class="border border-gray-600">
                            <div class="w-8 mx-auto">
                                <CheckBoxAlone label="cnc" cbClasses="text-bleuLBF" bind:checked={utilisateur.cnc} />
                            </div>
                        </td>
                        <td class="border border-gray-600">
                            <div class="w-8 mx-auto">
                                <CheckBoxAlone label="laser" cbClasses="text-bleuLBF" bind:checked={utilisateur.laser} />
                            </div>
                        </td>
                    </tr>
                </table>
                <div class="h4 mt-2">Role</div>
                <div class="flex flex-row flex-wrap">
                    <RadioBouton cbClasses="text-bleuLBF" label="aucun" name="role" value={1} bind:selected={utilisateur.role} />
                    <RadioBouton cbClasses="text-vertLBF" label="atelier" name="role" value={6} bind:selected={utilisateur.role} />
                    <RadioBouton cbClasses="text-jauneLBF" label="admin" name="role" value={5} bind:selected={utilisateur.role} />
                </div>
            </div>
            <div class="ml-4 mt-4">
                <Bouton on:actionBouton={majUtilisateur} occupe={flagMAJEnCours} largeur="w-12" couleur="text-bleuLBF border-bleuLBF">
                    <Fa icon={faSave} size="lg" class="mx-auto" />
                </Bouton>
            </div>
        {/if}
</main>