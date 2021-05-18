<script>
    import {onMount, tick} from 'svelte';
    import Fa from 'svelte-fa';
    import { faSave } from '@fortawesome/free-regular-svg-icons';
    import { faTimes } from '@fortawesome/free-solid-svg-icons'

    import Bouton from '../../components/Button/Button.svelte'
    import Chargement from '../../components/chargement.svelte'
    import {tagsArticlesStore, categoriesTagsStore} from "../../stores/tagsArticles.js"

    import {addTagArticle, getTagsArticles, deleteTagArticle, listeCategoriesTags} from '../../strapi/tagsArticles.js'

    import {tableCouleursLBFNum} from '../../utils/couleursLBF.js'
import Busy from '../../components/busy.svelte';

    var lesTags = []
    let newTag = []
    var flagSauvegardeEnCours = false
    var flagSauvegardeSucces = false
    var tagsToBeReloaded = true
    var tagsLoading = false
    var tagsToTheStore = false
    var flagBusyBoutonsSet = false
    var mngtBoutons = []


$: {
    if ($categoriesTagsStore && ! flagBusyBoutonsSet) {
        flagBusyBoutonsSet = true
        $categoriesTagsStore.forEach((categorie) => {mngtBoutons[categorie.id] = {busy: false, succes: false}})
    }
}

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


    function handleKeydown(event, id) {
        if (event.key === "Enter") ajouterTag(id)
    }

    function ajouterTag(id) {
        if (newTag[id] === "" || ! newTag[id]) {
            return
        }
        mngtBoutons[id].busy = true
        mngtBoutons[id].succes = false
        const variables = {
            tag: newTag[id].toLowerCase(),
            categorie: id
        }
        addTagArticle(variables).then((retour)=> {
            mngtBoutons[id].busy = false
            mngtBoutons[id].succes = true
            newTag[id] = ""
            setTimeout(function(){  mngtBoutons[id].succes = false; }, 2*1000);
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
    {#if !tagsLoading}
        <h3 class="ml-1 mb-2 mt-4 text-lbfvert-800">Liste des tags</h3>
        <div class="mb-4">Les tags sont des mots permettant de classer les articles et de faire des recherches dans la liste des articles.</div>
        {#each $categoriesTagsStore as categorie, index}
            <div class="mb-4">
                <div class="flex flex-row items-end ">
                    <div class="mr-4 p-1">
                        <label for="tag">
                            <div class={"text-lg font-medium capitalize " + tableCouleursLBFNum[index + 1].classText}>{categorie.nom}</div>
                            <input 
                                bind:value= {newTag[categorie.id]}
                                class={"bg-gray-900 text-gray-200 focus:outline-none border rounded py-2 px-4 block w-full appearance-none leading-normal " + tableCouleursLBFNum[index + 1].border}
                                type="text"
                                on:keydown={(event) => handleKeydown(event, categorie.id)}
                                />
                        </label>
                    </div>
                    {#if flagBusyBoutonsSet && mngtBoutons[categorie.id]}
                        <div>
                            <Bouton bind:occupe={mngtBoutons[categorie.id].busy} bind:succes={mngtBoutons[categorie.id].succes} on:actionBouton={() => ajouterTag(categorie.id)} largeur="w-12" couleur={tableCouleursLBFNum[index + 1].classText + " " + tableCouleursLBFNum[index + 1].border}>
                                <Fa icon={faSave} size="lg" class="mx-auto" />
                            </Bouton>
                        </div>
                    {/if}
                </div>
                <div class="min-h-16 p-2 flex flex-wrap justify-start gap-1">
                    {#each lesTags as tag}
                        {#if tag.categorie.id == categorie.id}
                            <div on:click={() => {effacerTag(tag.id)}} class={"cursor-pointer h-8 mx-auto p-2 rounded-full border flex flex-row items-center " + tableCouleursLBFNum[index + 1].classText + " " + tableCouleursLBFNum[index + 1].border}>
                                <div><Fa icon={faTimes} /></div>
                                <div class="ml-2 text-sm font-semibold">{tag.tag}</div>
                            </div>
                        {/if}
                    {/each} 
                </div>
            </div>
        {/each}
    {:else}
        <Chargement>
            <h3 class="text-center w-full" id="chargement">Chargement des tags</h3>
        </Chargement>
    {/if}
</main>