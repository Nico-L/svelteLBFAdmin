<script>
    import {onMount} from 'svelte';
    import Editeur from '../../components/editeur.svelte';
    import Bouton from '../../components/Button/Button.svelte';
    import {saveTexte, loadTexte} from '../../strapi/textAccueil'
    import Fa from 'svelte-fa'
    import { faSave } from '@fortawesome/free-regular-svg-icons'

    var data = {}
    const couleurEditeur = "orange"
    var flagSauvegardeEnCours = false
    var flagSauvegardeSucces = false
    var isLoading = true

    onMount(async() => {
        data = await loadTexte()
        isLoading = false
    })    

    async function sauvegarde() {
        flagSauvegardeEnCours = true
        await saveTexte(data)
        flagSauvegardeEnCours = false
        flagSauvegardeSucces = true
        setTimeout(function() {
            flagSauvegardeSucces = false
            }, 2000);
    }

</script>

<main class="max-w-720px">
    {#if isLoading}
            <h5 class="text-center text-orangeLBF">Récupération des données...</h5>
            <div class="text-orangeLBF">
                <svg xmlns="http://www.w3.org/2000/svg" class="fill-current stroke-current h-20 w-20 mx-auto mt-2" viewBox="0 0 50 50">
                    <g fill="none" fill-rule="evenodd" stroke="currentColor" stroke-width="2">
                        <circle cx="22" cy="22" r="1">
                            <animate attributeName="r" begin="0s" dur="1.8s" values="1; 20" calcMode="spline" keyTimes="0; 1" keySplines="0.165, 0.84, 0.44, 1" repeatCount="indefinite"/>
                            <animate attributeName="stroke-opacity" begin="0s" dur="1.8s" values="1; 0" calcMode="spline" keyTimes="0; 1" keySplines="0.3, 0.61, 0.355, 1" repeatCount="indefinite"/>
                        </circle>
                        <circle cx="22" cy="22" r="1">
                            <animate attributeName="r" begin="-0.9s" dur="1.8s" values="1; 20" calcMode="spline" keyTimes="0; 1" keySplines="0.165, 0.84, 0.44, 1" repeatCount="indefinite"/>
                            <animate attributeName="stroke-opacity" begin="-0.9s" dur="1.8s" values="1; 0" calcMode="spline" keyTimes="0; 1" keySplines="0.3, 0.61, 0.355, 1" repeatCount="indefinite"/>
                        </circle>
                    </g>
                </svg>
            </div>
    {:else}
        <div class={"h5 font-medium text-orangeLBF"}>Accueil</div>
        <p>Vous pouvez ici personnaliser le texte qui apparaît sur la page d'accueil lorsqu'il n'y a pas d'atelier prévu.</p>
        <Editeur bind:contenu={data.texte} couleur={couleurEditeur}/>
        <div class="flex flex-row justify-end mt-2">
            <Bouton bind:occupe={flagSauvegardeEnCours} bind:succes={flagSauvegardeSucces} on:actionBouton={sauvegarde} largeur="w-20" couleur="text-vertLBF border-vertLBF hover:bg-vertLBF hover:text-gray-900">
                <Fa icon={faSave} size="lg" class="mx-auto" />
            </Bouton>
        </div>
    {/if}
</main>