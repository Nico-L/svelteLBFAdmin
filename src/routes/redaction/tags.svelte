<script>
    import {onMount} from 'svelte';
    import Fa from 'svelte-fa';
    import { faSave } from '@fortawesome/free-regular-svg-icons';
    import { faTimes } from '@fortawesome/free-solid-svg-icons'

    import Bouton from '../../components/Button/Button.svelte'
    import Chargement from '../../components/chargement.svelte'
    import {tagsArticlesStore} from "../../stores/tagsArticles.js"

    import {addTagArticle, getTagsArticles, deleteTagArticle} from '../../strapi/tagsArticles.js'

    var lesTags = []
    let newTag = ""
    var flagSauvegardeEnCours = false
    var flagSauvegardeSucces = false
    var tagsToBeReloaded = true
    var tagsLoading = false
    var tagsToTheStore = false

    $: if (tagsToBeReloaded) {
        tagsLoading = true
        getTagsArticles().then((retourLesTags) => {
            tagsLoading = false
            lesTags = retourLesTags
            tagsToBeReloaded = false
            if (tagsToTheStore) {
                tagsArticlesStore.set(retourLesTags)
                tagsToTheStore = false
            }
        })
    }

    onMount(() => {
        document.getElementById("tag").addEventListener("keyup", ({key}) => {
            console.log('key', key)
            if (key === "Enter") ajouterTag()
        })
    })

    function ajouterTag() {
        if (newTag === "") {
            return
        }
        flagSauvegardeEnCours = true
        const variables = {
            tag: newTag.toLowerCase()
        }
        addTagArticle(variables).then((retour)=> {
            flagSauvegardeEnCours = false
            flagSauvegardeSucces = true
            newTag = ""
            setTimeout(function(){ flagSauvegardeSucces = false; }, 2*1000);
            tagsToBeReloaded = true
            tagsToTheStore = true
        })
    }

    function effacerTag(id) {
        deleteTagArticle(id).then((retourDelete) => {
            tagsToBeReloaded = true
        })
    }
</script>

<main class="max-w-720px ml-4">
    <h3 class="ml-1 mb-2 mt-4 text-lbfvert-800">Liste des tags</h3>
    <div class="mb-4">Les tags sont des mots permettant de classer les articles et de faire des recherches dans la liste des articles.</div>
    <div class="flex flex-row items-end mb-4">
        <div class="mr-4 p-1">
            <label for="tag">
                <div class="text-vertLBF text-lg font-medium">Ajouter un tag</div>
                <input 
                    bind:value= {newTag}
                    class="bg-gray-900 text-gray-200 focus:outline-none border border-vertLBF rounded py-2 px-4 block w-full appearance-none leading-normal"
                    type="text"
                    id="tag"
                    />
            </label>
        </div>
        <div>
            <Bouton bind:occupe={flagSauvegardeEnCours} bind:succes={flagSauvegardeSucces} on:actionBouton={ajouterTag} largeur="w-12" couleur="text-vertLBF border-vertLBF">
                <Fa icon={faSave} size="lg" class="mx-auto" />
            </Bouton>
        </div>
    </div>
    <div class="min-h-52 p-2 border-2 rounded border-vertLBFT">
        {#if !tagsLoading}
        <div class="flex flex-wrap justify-start gap-1">
            {#each lesTags as tag}
                <div class="h-8 mx-auto p-2 rounded-full text-vertLBF border border-vertLBF flex flex-row items-center">
                    <div class="cursor-pointer" on:click={() => {effacerTag(tag.id)}}><Fa icon={faTimes} /></div>
                    <div class="ml-2 text-sm font-semibold">{tag.tag}</div>
                </div>
            {/each}
        </div>
            
        {:else}
            <Chargement />
        {/if}
    </div>
</main>