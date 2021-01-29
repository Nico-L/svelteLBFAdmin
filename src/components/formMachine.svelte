<script>
import { createEventDispatcher} from 'svelte';
const dispatch = createEventDispatcher();
import { navigate } from "svelte-routing";
//import { auth } from "./../stores/auth.js"
import { user } from "./../stores/user.js"
import {espacesBF} from './../stores/espacesBF.js'
import { tags } from "./../stores/tags.js"
import {listeAbonnements, getMachineById, majMachine, creerMachine} from './../strapi/machines.js'
import ImageUpload from './imageUpload.svelte';
import Editeur from './editeur.svelte';
import Bouton from './Button/Button.svelte';
import RadioBouton from './radioButton.svelte'
import CheckBox from './CheckBox.svelte'
import Busy from './busy.svelte'
import Fa from 'svelte-fa'
import { faEuroSign, faTrashAlt, faPlus, faArrowLeft } from '@fortawesome/free-solid-svg-icons'
import { faSave } from '@fortawesome/free-regular-svg-icons'
import { tableCouleursLBFNum } from './../utils/couleursLBF.js'

export let flagEdition = false;
export let idMachine = "";

// variables passée à l'upload pour tag = Atelier et espaceBF = L'atelier
let tagId;
let espaceId;
$tags.forEach((tag) => {
    if (tag.tag==="Machine") tagId=tag.id
})
$espacesBF.forEach((espace)=> {
    if (espace.value==="L'atelier") espaceId = espace.id
})
const dataImg = {
    user: $user.id,
    espaces: espaceId,
    tags: tagId
}
const optionsURL= {
    'resizing_type': 'fill',
    'width': 400,
    'height': 180,
    'gravity': 'ce'
}

let lesTarifs = []
let typeTarif = "abonnement"
let newTarifHoraire = {tarification: "", tarif: ""}
let specificationMateriaux = false
let laMachine= {
                titre: "",
                tag: "",
                urlImage: "https://cms.labonnefabrique.fr/uploads/logo_LBF_bb0853ef96.png",
                description: "",
                lesTarifs: "",
                largeur: "",
                longueur: "",
                hauteur: "",
                tagMachine: "",
                decoupe: "",
                gravure: "",
                couleur: "rouge"
}
let laDecoupe = ""
let laGravure = ""
/*const optionsURL= [
        {
          ar: '2:1',
          cropType: 'fill'
        },
        {
          width: 'auto',
          qualite: 'auto',
          cropType: 'scale'
        }
      ]*/
let flagSauvegardeEnCours = false;
let flagSauvegardeSucces = false;
let flagGetMachine = false;

$: listeAbonnements().then((retour)=> {
        lesTarifs = retour.Tarifs
    })

$: {
    if(idMachine !== "" && !flagEdition) {
        flagGetMachine = true
        getMachineById(idMachine).then((retour)=> {
            flagGetMachine = false
            flagEdition = true
            /*specificationMateriaux = retour.decoupe.length>0 || retour.gravure.length>0
            laDecoupe = retour.decoupe.join(', ')
            laGravure = retour.gravure.join(', ') */
            laMachine = retour
            if (!laMachine.Abonnement) {
                typeTarif = "horaire"
            }
            console.log('laMachine', laMachine)
        })
    }
}

$: laMachine.Abonnement = typeTarif==="abonnement"

function ajouterTarifHoraire() {
    tarifsHoraire.push(newTarifHoraire)
    newTarifHoraire = {tarification: "", tarif: ""}
    tarifsHoraire = tarifsHoraire
}

function retirerTarifHoraire(index) {
        tarifsHoraire.splice(index, 1)
    tarifsHoraire = tarifsHoraire
}

function validationSauvegarde() {
    flagSauvegardeEnCours = true
    flagGetMachine = true
    if (idMachine==="") {
        creerMachine(laMachine).then((retour)=>{
            flagSauvegardeEnCours=false
            flagGetMachine = false
            navigate("/machines/listeMachines", { replace: true });
        })
    } else {
        majMachine(idMachine, laMachine).then((retour)=>{
            flagSauvegardeEnCours= false
            flagGetMachine = false
            dispatch('close')
        })
    }
}

function fini() {
    dispatch('close')
}
</script>

{#if !flagGetMachine}
    <div class="w-480px p-1 bg-gray-900 flex flex-col border-gray-200">
        <label for="titre" class="text-sm">
            Nom de la machine
            <div class="border border-bleuLBFT rounded p-1">
                <input 
                bind:value= {laMachine.nom}
                class="bg-gray-800 text-base text-gray-200 focus:outline-none rounded py-1 px-1 block w-full appearance-none leading-normal"
                type="text"
                id="titre"
                />
            </div>
        </label>
        <label for="tag" class="text-sm">
            raccourci
            <div class="border border-bleuLBFT rounded p-1">
                <input 
                bind:value= {laMachine.tag}
                class="bg-gray-800 text-base text-gray-200 focus:outline-none rounded py-1 px-1 block w-full appearance-none leading-normal"
                type="text"
                id="tag"
                />
            </div>
        </label>
            <div class="mt-2 mb-4">
            <div class="h4 font-medium text-gray-400">Couleur associée (rendu calendriers)</div>
            <div class="flex flex-row items-center justify-between mt-2">
                {#each tableCouleursLBFNum as couleur}
                    <div class="mr-2 flex flex-row items-center">
                    <RadioBouton cbClasses={couleur.classText} name="typeSelection" value={couleur.variante} bind:selected={laMachine.couleur} />
                        <div class={"w-6 h-6 " + couleur.classBG}></div>
                    </div>
                {/each}
            </div>
        </div>
        <div class="w-5/6 mx-auto">
            <!--<ImageUpload bind:nomImage={laMachine.urlImage} options = {optionsURL} typeIllustration="Machine" altImage="Illustration de la machine" classImage="rounded border-2 border-bleuLBF" />-->
            <ImageUpload dataImg={dataImg} bind:urlImage={laMachine.urlImage} options = {optionsURL} altImage="Illustration de l'atelier" classImage="rounded border-2 border-bleuLBF" />
        </div>
        <div class="mt-4 ">
            <div class="h4 font-medium text-vertLBF">Résumé</div>
            <Editeur bind:contenu={laMachine.resume} couleur="vert"/>
        </div>
        <div class="mt-4 ">
            <div class="h4 font-medium text-vertLBF">Description</div>
            <Editeur bind:contenu={laMachine.description} couleur="vert"/>
        </div>
        <div class="mt-4">
            <div class="h4 font-medium text-orangeLBF">Tarifs</div>
            <div class="flex flex-row items-center mt-1">
                <RadioBouton mettreApres={true} cbClasses="text-gray-400" name="typeTarif" value="abonnement" bind:selected={typeTarif} label="abonnement"/>
                <RadioBouton mettreApres={true} cbClasses="text-gray-400" name="typeTarif" value="horaire" bind:selected={typeTarif} label="tarif horaire"/>
            </div>
            {#if laMachine.Abonnement}
                <table class="mx-auto table-auto border-collapse border-2 border-gray-300 mt-3">
                    <thead>
                        <tr>
                        <th class="border border-gray-600 px-2 py-1 text-orangeLBF">Durée</th>
                        <th class="border border-gray-600 px-2 py-1 text-orangeLBF">Tarif (€)</th>
                        </tr>
                    </thead>
                    {#each lesTarifs as abonnement, index}
                        <tr>
                            <td class="border border-gray-600 px-2 py-1">
                                {abonnement.duree}
                            </td>
                            <td class="border border-gray-600 px-2 py-1">
                            {abonnement.tarif} 
                            </td>
                        </tr>
                    {/each}
                </table>
            {:else}
                <div class=" flex flex-row items-center mt-3">
                    <div class="font-medium mx-2">Tarif : </div>
                    <input 
                    bind:value={laMachine.tarifHoraire}
                    class="w-12 p-1 bg-gray-800 text-gray-200 rounded focus:outline-none appearance-none leading-normal text-right"
                    type="text"
                    id="nouveauTarif"
                    />
                    <Fa icon={faEuroSign} size="lg" class="mx-auto ml-2" />
                </div>  
                <!--<table class="mx-auto table-auto border-collapse border-2 border-gray-300 mt-3">
                    <thead>
                        <tr>
                        <td class="border border-gray-600 px-2 py-1 text-orangeLBF">Tarif Horaire</td>
                        <td class="border border-gray-600 px-2 py-1 text-orangeLBF">{laMachine.tarifHoraire}</td>
                        <td class="border border-gray-600 px-2 py-1 text-orangeLBF">~</td>
                        </tr>
                    </thead>
                    {#each lesTarifs as tarifHoraire, index}
                        <tr>
                            <td class="border border-gray-600 px-2 py-1">
                                <input 
                                bind:value={tarifHoraire.tarification}
                                class="w-32 p-1 text-sm bg-gray-800 text-gray-200 rounded focus:outline-none appearance-none leading-normal text-left"
                                type="text"
                                />
                            </td>
                            <td class="border border-gray-600 px-2 py-1">
                            <div class=" flex flex-row items-center">
                                <input 
                                bind:value={tarifHoraire.tarif}
                                class="w-20 p-1 text-sm bg-gray-800 text-gray-200 rounded focus:outline-none appearance-none leading-normal text-right"
                                type="text"
                                />
                                <Fa icon={faEuroSign} size="lg" class="mx-auto ml-2" />
                            </div>    
                            </td>
                            <td class="border border-gray-600 px-2 py-1">
                                <Bouton noBorder={true} largeur="w-8" couleur="text-orangeLBF border-orangeLBF" on:actionBouton={() => {retirerTarifHoraire(index)}}>
                                    <Fa icon={faTrashAlt} size="lg" class="mx-auto" />
                                </Bouton>
                            </td>
                        </tr>
                    {/each}
                    <tr>
                            <td class="border border-gray-600 px-2 py-1">
                                <input 
                                bind:value={newTarifHoraire.tarification}
                                class="w-32 p-1 bg-gray-800 text-gray-200 rounded focus:outline-none appearance-none leading-normal text-left"
                                type="text"
                                id="nouvelAbonnementPeriode"
                                />
                            </td>
                            <td class="border border-gray-600 px-2 py-1">
                                <div class=" flex flex-row items-center">
                                    <input 
                                    bind:value={newTarifHoraire.tarif}
                                    class="w-20 p-1 bg-gray-800 text-gray-200 rounded focus:outline-none appearance-none leading-normal text-right"
                                    type="text"
                                    id="nouvelAbonnementTarif"
                                    />
                                    <Fa icon={faEuroSign} size="lg" class="mx-auto ml-2" />
                                </div>  
                            </td>
                            <td class="border border-gray-600 px-2 py-1">
                                <Bouton noBorder={true} largeur="w-10" couleur="text-vertLBF border-vertLBF" on:actionBouton={ajouterTarifHoraire}>
                                    <Fa icon={faPlus} size="lg" class="mx-auto" />
                                </Bouton>
                            </td>
                        </tr>
                </table>-->
            {/if}
        </div>
        <!--<div class="mt-4">
            <div class="h4 font-medium text-rougeLBF">Caractéristiques</div>
            <div class="flex flex-row justify-around">
                <div class="flex flex-row justify-start items-end">
                    <label for="titre" class="text-sm">
                        longueur (mm)
                        <div class="border border-rougeLBFT rounded p-1">
                            <input 
                                bind:value= {laMachine.longueur}
                                class="w-24 bg-gray-800 text-base text-gray-200 focus:outline-none rounded py-1 px-1 block appearance-none leading-normal text-right"
                                type="text"
                                id="longueur"
                            />
                        </div>
                    </label>
                    <div class="mx-2 text-2xl">
                        x
                    </div>
                    <label for="largeur" class="text-sm">
                        largeur (mm)
                        <div class="border border-rougeLBFT rounded p-1">
                            <input 
                                bind:value= {laMachine.largeur}
                                class="w-24 bg-gray-800 text-base text-gray-200 focus:outline-none rounded py-1 px-1 block appearance-none leading-normal text-right"
                                type="text"
                                id="largeur"
                            />
                        </div>
                    </label>
                </div>
                <label for="hauteur" class="text-sm">
                        hauteur (mm)
                        <div class="border border-rougeLBFT rounded p-1">
                            <input 
                                bind:value= {laMachine.hauteur}
                                class="w-24 bg-gray-800 text-base text-gray-200 focus:outline-none rounded py-1 px-1 block appearance-none leading-normal text-right"
                                type="text"
                                id="hauteur"
                            />
                        </div>
                    </label>
            </div>
            <div class="mt-4">
                <CheckBox label="Spécification matériaux" cbClasses="text-grey-600" bind:checked={specificationMateriaux}/>
            </div>
            {#if specificationMateriaux}
                <div class="mt-1">
                    <div class="h5 text-rougeLBF">Matériaux adaptés</div>
                    <div>Entrer les matériaux séparés d'une virgule</div>
                    <label for="decoupe" class="mt-3 text-sm">
                            Découpe
                            <div class="border border-rougeLBFT rounded p-1">
                                <input 
                                    bind:value= {laDecoupe}
                                    class="w-full bg-gray-800 text-gray-200 rounded focus:outline-none py-1 px-1 block appearance-none leading-normal"
                                    type="text"
                                    id="decoupe"
                                />
                            </div>
                        </label>
                        <label for="gravure" class="mt-3 text-sm">
                            Gravure
                            <div class="border border-rougeLBFT rounded p-1">
                                <input 
                                bind:value= {laGravure}
                                class="w-full bg-gray-800 text-gray-200 rounded focus:outline-none py-1 px-1 block appearance-none leading-normal"
                                type="text"
                                id="gravure"
                            />
                            </div>
                        </label>
                </div>
            {/if}
        </div> -->
        <div class="mt-4 flex flex-row items-center justify-end">
            {#if idMachine!==""}
            <Bouton on:actionBouton={fini} largeur="w-10" couleur="text-bleuLBF border-bleuLBF">
                <Fa icon={faArrowLeft} size="lg"  class="mx-auto" />
            </Bouton>
            {/if}
            <Bouton bind:occupe={flagSauvegardeEnCours} bind:succes={flagSauvegardeSucces} on:actionBouton={validationSauvegarde} largeur="w-12" couleur="text-vertLBF border-vertLBF">
                <Fa icon={faSave} size="lg" class="mx-auto" />
            </Bouton>
        </div>
    </div>
{:else}
    <Busy visible={flagGetMachine} >Récupération des données, merci de patienter...</Busy>
{/if}