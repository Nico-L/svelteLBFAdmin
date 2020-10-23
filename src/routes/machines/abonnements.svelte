<script>
    import { onMount } from 'svelte';
    import { listeAbonnements, majAbonnements } from "../../strapi/machines.js"
    //import { auth } from "./../../stores/auth.js"
    import { user } from "./../../stores/user.js"
    import Bouton from './../../components/Button/Button.svelte';
    import Fa from 'svelte-fa'
    import { faEuroSign, faTrashAlt } from '@fortawesome/free-solid-svg-icons'
    import { faSave } from '@fortawesome/free-regular-svg-icons'

    let lesAbonnements = []
    let nouvelAbonnement = [{duree:"", tarif: ""}]
    let flagSauvegardeEncours = false;
    let flagSauvegardeOK = false;

    function recupAbonnements() {
        listeAbonnements().then((retour)=> {
            lesAbonnements = retour.Tarifs
        })
    }

$: {if (lesAbonnements.length > 0)
    {
        let derniereEntree = lesAbonnements[lesAbonnements.length-1]
        if (derniereEntree.duree !== "" || derniereEntree.tarif !== "") {
            lesAbonnements.push({duree:"", tarif: ""})
        }
    }
}

$: {
    if (flagSauvegardeOK)  {setTimeout(() => {recupAbonnements(); flagSauvegardeOK = false}, 1500)}
    }

onMount(() => {
    recupAbonnements();
})

function ajouterAbonnement() {
    lesAbonnements.push(nouvelAbonnement)
    lesAbonnements = lesAbonnements
    nouvelAbonnement = {duree:"", tarif: ""}
}

function enleverAbonnement(index) {
    lesAbonnements.splice(index, 1)
    lesAbonnements = lesAbonnements
}

function enregistrerAbonnements() {
    flagSauvegardeEncours = true
      nouvelAbonnement.forEach((abonnement) => {
          if (abonnement.duree !== "" && abonnement.tarif !== "") {
              lesAbonnements.push(abonnement)
          }
      })
      const variables = {
            Tarifs: lesAbonnements
          }
    majAbonnements(variables).then((retour) => {
        flagSauvegardeOK = true;
        flagSauvegardeEncours = false;
        recupAbonnements()
        })
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
                bind:value={abonnement.duree}
                class="w-32 p-1 text-sm bg-gray-800 text-gray-200 rounded focus:outline-none appearance-none leading-normal text-left"
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
                {#if abonnement.duree !== "" && abonnement.tarif !== ""}
                    <Bouton noBorder={true} largeur="w-8" couleur="text-orangeLBF border-orangeLBF" on:actionBouton={()=>{enleverAbonnement(index)}}>
                        <Fa icon={faTrashAlt} size="lg" class="mx-auto" />
                    </Bouton>
                {/if}
            </td>
        </tr>
    {/each}
  </table>
  <div class="mt-3">
    <Bouton largeur="w-32" couleur="text-bleuLBF border-bleuLBF" on:actionBouton={enregistrerAbonnements} occupe={flagSauvegardeEncours} succes={flagSauvegardeOK}>
        Enregistrer
    </Bouton>
  </div>  
</main>