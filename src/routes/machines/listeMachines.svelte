<script>
import {listeMachinesComplete, effacerMachine} from '../../strapi/machines.js'
import {imgProxyUrl} from '../../strapi/imgProxy.js'
//import { auth } from "../../stores/auth.js"
import { user } from "../../stores/user.js"
import Fa from 'svelte-fa'
import { faEdit, faTrashAlt } from '@fortawesome/free-regular-svg-icons'
import Dialog from '../../components/Dialog.svelte';
import Bouton from '../../components/Button/Button.svelte'
import FormMachine from '../../components/formMachine.svelte'

var lesMachines = []
var lesClasses = []
var idMachine = ""
var idMachineEdit = ""
var flagEditMachine = false
var flagConfirmationEffacerMachine = false;
var busyEffacerMachine = false;
var majListeMachine = true
 const optionsImg = {
        'resizing_type': 'fill',
        'width': 200,
        'height': 266,
        'gravity': 'ce'
    }

$: if(majListeMachine) {
    listeMachinesComplete().then((retour)=> {
        majListeMachine = false
        lesMachines = retour
    })
}

function supprimerMachine() {
    busyEffacerMachine = true;
    if(idMachine!=="") {
        effacerMachine(idMachine).then((retour)=> {
            busyEffacerMachine = false
            fermeDialog()
            idMachine = ""
        })
    }
}

function fermeDialog() {
    flagConfirmationEffacerMachine = false;
    flagEditMachine = false
    majListeMachine = true
}
</script>

<main class="flex flex-row flex-wrap justify-around">
    {#each lesMachines as machine, index}
        <div class={"w-320px sm:w-480px mx-4 mb-4 mx-0 flex flex-col sm:flex-row rounded " + machine.couleur}>
            <div class="w-5/12 rounded bg-gray-900">
                {#await imgProxyUrl("https://cms.labonnefabrique.fr" + machine.illustration.media.url, optionsImg)}
                    <img
                        src="/img/svg/clock-regular.svg"
                        alt="logo"
                        width={optionsImg.width}
                        height={optionsImg.height}
                        />
                {:then value}
                    <img src={value.imgProxyUrl} 
                        alt={machine.nom}
                        class="rounded-tl"
                        width={optionsImg.width}
                        height={optionsImg.height}/>
                {/await}
            </div>
            <div class="w-7/12 flex flex-col bg-gray-900 text-gray-200 rounded-t sm:rounded-br sm:rounded-tl-none">
                <div class="text-xl p-1 text-center font-bold capitalize mt-1 align-middle">{machine.nom}</div>
                <div class="h-full text-base text-justify p-1 align-top rounded-br">{@html machine.resume}</div>
                <div class={"my-2 flex flex-row justify-end txt-" + machine.couleur}>
                    <div class="mr-3 cursor-pointer" on:click={()=>{idMachine=machine.id; flagConfirmationEffacerMachine = true}}><Fa icon={faTrashAlt} size="1.5x"/></div>
                    <div class="mr-1 cursor-pointer" on:click={()=>{idMachineEdit=machine.id; flagEditMachine = true}}><Fa icon={faEdit} size="1.5x"/></div>
                </div>
            </div>
        </div>
    {/each}
</main>
<!-- confirme efface atelier -->
<Dialog bind:visible={flagConfirmationEffacerMachine} on:close={fermeDialog}>
    <h4 slot="title">Confirmation</h4>
    <p>Confirmer la suppression de la fiche machine</p>
    <div slot="actions" class="flex flex-row justify-end items-center">
        <Bouton on:actionBouton={() => flagConfirmationEffacerMachine = false}>Annuler</Bouton>
        <Bouton occupe={busyEffacerMachine} on:actionBouton = {supprimerMachine} couleur="text-orangeLBF border-orangeLBF">Confirmer</Bouton>
    </div>
</Dialog>

<!-- edit -->
<Dialog bind:visible={flagEditMachine} on:close={fermeDialog}>
    <FormMachine idMachine={idMachineEdit} on:close={fermeDialog} />
</Dialog>