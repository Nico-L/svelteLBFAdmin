<script>
    import { onMount } from 'svelte';
    import { listeAbonnements, sauveAbonnements } from "../../graphQL/machines";
    import { auth } from "./../../stores/auth.js"
    import { user } from "./../../stores/user.js"
    import Bouton from './../../components/Button/Button.svelte';
    import Fa from 'svelte-fa'
    import { faEuroSign, faTrashAlt } from '@fortawesome/free-solid-svg-icons'
    import { faSave } from '@fortawesome/free-regular-svg-icons'

    let lesAbonnements = []
    let nouvelAbonnement = {tarification:"", tarif: ""}
    let flagSauvegardeEncours = false;
    let flagSauvegardeOK = false;

    function recupAbonnements() {
        listeAbonnements($auth, $user.estAdmin, {typeTarif: 'abonnement'}).then((retour)=> {
            lesAbonnements = retour
        })
    }

$: if ($auth && $user) {
     recupAbonnements();
}

function ajouterAbonnement() {
    lesAbonnements.push(nouvelAbonnement)
    lesAbonnements = lesAbonnements
    nouvelAbonnement = {tarification:"", tarif: ""}
}

function enleverAbonnement(index) {
    lesAbonnements.splice(index, 1)
    lesAbonnements = lesAbonnements
}

function enregistrerAbonnements() {
    flagSauvegardeEncours = true
     let stringTarif = '{"abonnement": ['
     lesAbonnements.forEach((abonnement, index) => {
        if (index > 0) {
          stringTarif = stringTarif + ', '
        }
        stringTarif =
          stringTarif +
          '{"tarif": "' +
          abonnement.tarif +
          '", "tarification": "' +
          abonnement.tarification +
          '"}'
      })
      stringTarif = stringTarif + ']}'
      const variables = {
            lesTarifs: JSON.parse(stringTarif),
            typeTarif: 'abonnement'
          }
        if ($auth && $user) {
            sauveAbonnements($auth, $user.estAdmin, variables).then((retour) => {
                flagSauvegardeOK = true;
                flagSauvegardeEncours = false;
                recupAbonnements()
                })
        }
}

</script>

<main>
<h4>Les abonnements</h4>
<table class="table-auto border-collapse border-2 border-gray-300 mt-3">
  <thead>
    <tr>
      <th class="border border-gray-600 px-2 py-1 text-vertLBF">Période</th>
      <th class="border border-gray-600 px-2 py-1 text-vertLBF">Tarif</th>
      <th class="border border-gray-600 px-2 py-1 text-vertLBF">~</th>
    </tr>
  </thead>
    {#each lesAbonnements as abonnement, index}
        <tr>
            <td class="border border-gray-600 px-2 py-1">
                <input 
                bind:value={abonnement.tarification}
                class="w-32 p-1 text-sm bg-gray-800 text-gray-200 rounded focus:outline-none appearance-none leading-normal text-right"
                type="text"
                />
            </td>
            <td class="border border-gray-600 px-2 py-1">
            <div class=" flex flex-row items-center">
                <input 
                bind:value={abonnement.tarif}
                class="w-20 p-1 text-sm bg-gray-800 text-gray-200 rounded focus:outline-none appearance-none leading-normal text-right"
                type="text"
                />
                <Fa icon={faEuroSign} size="lg" class="mx-auto ml-2" />
            </div>    
            </td>
            <td class="border border-gray-600 px-2 py-1">
                <Bouton noBorder={true} largeur="w-8" couleur="text-orangeLBF border-orangeLBF" on:actionBouton={()=>{enleverAbonnement(index)}}>
                    <Fa icon={faTrashAlt} size="lg" class="mx-auto" />
                </Bouton>
            </td>
        </tr>
    {/each}
    <tr>
            <td class="border border-gray-600 px-2 py-1">
                <input 
                bind:value={nouvelAbonnement.tarification}
                class="w-32 p-1 text-sm bg-gray-800 text-gray-200 rounded focus:outline-none appearance-none leading-normal text-right"
                type="text"
                id="nouvelAbonnementPeriode"
                on:input={()=>{flagSauvegardeOK = false;}}
                />
            </td>
            <td class="border border-gray-600 px-2 py-1">
                <div class=" flex flex-row items-center">
                    <input 
                    bind:value={nouvelAbonnement.tarif}
                    class="w-20 p-1 text-sm bg-gray-800 text-gray-200 rounded focus:outline-none appearance-none leading-normal text-right"
                    type="text"
                    id="nouvelAbonnementTarif"
                    on:input={()=>{flagSauvegardeOK = false;}}
                    />
                    <Fa icon={faEuroSign} size="lg" class="mx-auto ml-2" />
                </div>  
            </td>
            <td class="border border-gray-600 px-2 py-1">
                {#if nouvelAbonnement.tarification!=="" && nouvelAbonnement.tarif!==""}
                    <Bouton noBorder={true} largeur="w-10" couleur="text-vertLBF border-vertLBF" on:actionBouton={ajouterAbonnement}>
                        <Fa icon={faSave} size="lg" class="mx-auto" />
                    </Bouton>
                {/if}
            </td>
        </tr>
  </table>
  <div class="mt-3">
    <Bouton largeur="w-32" couleur="text-bleuLBF border-bleuLBF" on:actionBouton={enregistrerAbonnements} occupe={flagSauvegardeEncours} succes={flagSauvegardeOK}>
        Enregistrer
    </Bouton>
  </div>  
</main>