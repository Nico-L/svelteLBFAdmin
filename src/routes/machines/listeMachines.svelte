<script>
import {listeMachinesComplete, effacerMachine} from '../../graphQL/machines.js'
import { auth } from "../../stores/auth.js"
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

$: if($auth && $user && majListeMachine) {
    console.log('majMachine')
    listeMachinesComplete($auth,$user.estAdmin).then((retour)=> {
        majListeMachine = false
        lesMachines = retour
    })
}

function supprimerMachine() {
    busyEffacerMachine = true;
    if($auth && $user && idMachine!=="") {
        effacerMachine($auth, $user.estAdmin, {idMachine: idMachine}).then((retour)=> {
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
            <div class="w-full flex-wrap mb-3 sm:w-5/12 mr-px p-1 flex sm:flex-col flex-row text-black items-end">
                <div class="w-1/2 sm:w-full flex">
                        <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 26.458 26.458" class="object-left w-1/3">
                            <path d="M11.291 6.558a.917.917 0 00.632.247c.22 0 .44-.083.633-.247a.88.88 0 000-1.264l-.935-.936h11.657l-.936.936a.88.88 0 000 1.264.917.917 0 00.633.247c.22 0 .44-.083.632-.247l2.447-2.447a.88.88 0 000-1.264L23.607.4a.88.88 0 00-1.265 0 .88.88 0 000 1.264l.936.935H11.62l.908-.908a.88.88 0 000-1.264.88.88 0 00-1.266 0L8.846 2.875a.88.88 0 000 1.264zm-5.993 5.966a.917.917 0 00.633.247c.22 0 .44-.083.632-.247a.88.88 0 000-1.264L4.116 8.84a.88.88 0 00-1.265 0L.405 11.287a.88.88 0 000 1.264.88.88 0 001.264 0l.935-.935v11.657l-.907-.907a.88.88 0 00-1.264 0 .88.88 0 000 1.264l2.447 2.447a.917.917 0 00.631.247c.22 0 .44-.083.633-.247l2.447-2.447a.88.88 0 000-1.264.88.88 0 00-1.266 0l-.935.935V11.616zm20.123-3.932H9.477a.869.869 0 00-.88.88v15.945c0 .495.385.88.88.88h15.944c.496 0 .88-.385.88-.88V9.473a.869.869 0 00-.88-.88zm-.879 15.945H10.356V10.352h14.158v14.186z" fill="#050505" stroke="#0a0a0a" stroke-width=".27534030000000004"/>
                        </svg>
                    <div class="text-sm mt-4 sm:w-2/3">{machine.longueur}x{machine.largeur} mm²</div>
                </div>
                <div class="flex flex-row sm:mt-4 w-1/2 sm:w-full">
                        <svg xmlns="http://www.w3.org/2000/svg" width="27" height="27" viewBox="0 0 17.198 17.198" class="object-left w-1/3 pl-2 align-bottom">
                            <g fill="#050505" stroke="#0a0a0a"><path d="M9.791 5.34a.606.606 0 00.418.164.641.641 0 00.418-.164.582.582 0 000-.837l-1.62-1.6a.582.582 0 00-.836 0L6.553 4.522a.582.582 0 000 .837.582.582 0 00.836 0l.62-.62v7.713l-.601-.6a.582.582 0 00-.837 0 .582.582 0 000 .837l1.619 1.618a.606.606 0 00.417.164.641.641 0 00.42-.164l1.619-1.618a.582.582 0 000-.837.582.582 0 00-.837 0l-.62.619V4.739z" stroke-width=".18187637999999998"/><path d="M16.224.132H.974a.83.83 0 00-.842.842v15.251c0 .473.367.841.842.841h15.25a.83.83 0 00.842-.84V.973a.83.83 0 00-.842-.842zm-.84 15.252H1.814V1.814h13.543v13.57z" stroke-width=".2633729"/></g>
                        </svg>
                    <div class="text-sm w-2/3 pt-1">{machine.hauteur} mm</div>
                </div>
                {#if (machine.decoupe.length>0) || (machine.gravure.length>0) }
                    <div class="flex mt-3 items-start w-full">
                        <img src="/img/svg/{machine.tagMachine}Cut.png" srcset="/img/svg/{machine.tagMachine}Cut.svg" alt="icone {machine.tagMachine}" width="50px">
                        <div class="text-sm w-2/3 flex flex-col ml-2">
                            <ul class="text-sm hidden sm:block">
                                {#each machine.decoupe as decoupe }
                                        <li>{decoupe}</li>
                                {/each}
                            </ul>
                            <div class="sm:hidden">
                                {machine.decoupe.join(', ')}
                            </div>
                        </div>
                    </div>
                    <div class="flex flex-row w-full items-start mt-3">
                        <img src="/img/svg/{machine.tagMachine}Etch.png" srcset="/img/svg/{machine.tagMachine}Etch.svg" alt="icone {machine.tagMachine}" width="50px">
                        <div class="text-sm w-2/3 flex flex-col ml-2">
                            <ul class="text-sm hidden sm:block">
                                {#each machine.gravure as gravure }
                                    <li>{gravure}</li>
                                {/each}
                            </ul>
                            <div class="sm:hidden">
                                {machine.gravure.join(', ')}
                            </div>
                        </div>
                    </div>
                {/if}

            </div>
            <div class="sm:w-7/12 flex flex-col bg-gray-900 text-gray-200 rounded-t sm:rounded-br sm:rounded-tl-none">
                <img src="https://res.cloudinary.com/la-bonne-fabrique/image/upload/ar_16:9,c_fill,g_face,q_auto:low,w_280,c_thumb/{machine.urlImage}" alt="illustration machine" class="rounded-t sm:rounded-tl-none"/>
                <div class="text-xl p-1 text-center font-bold capitalize mt-1 align-middle">{machine.titre}</div>
                <div class="h-full text-base text-justify p-1 align-top rounded-br">{@html machine.description}</div>
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
    <p>Confirmer la suppression de l'atelier</p>
    <div slot="actions" class="flex flex-row justify-end items-center">
        <Bouton on:actionBouton={() => flagConfirmationEffacerMachine = false}>Annuler</Bouton>
        <Bouton occupe={busyEffacerMachine} on:actionBouton = {supprimerMachine} couleur="text-orangeLBF border-orangeLBF">Confirmer</Bouton>
    </div>
</Dialog>

<!-- edit -->
<Dialog bind:visible={flagEditMachine} on:close={fermeDialog}>
    <FormMachine idMachine={idMachineEdit} on:close={fermeDialog} />
</Dialog>