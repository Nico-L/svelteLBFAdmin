<script>
import {onMount} from 'svelte';

import {user} from '../stores/user.js'
import {imgProxyUrl} from "../strapi/imgProxy.js"
import {dateJourMoisHeure} from "../utils/dateFr.js"
import Fa from 'svelte-fa'
import { faEdit, faTrashAlt } from '@fortawesome/free-regular-svg-icons'
import Bouton from './Button/Button.svelte';
import Dialog from './Dialog.svelte';
import CheckBoxAlone from './CheckBoxAlone.svelte';

import {getArticlesByUser, deleteArticle} from '../strapi/articles.js'
import {effaceIllustration} from '../strapi/illustrations.js'

export let estPublie = false
export let limiteNbArticles = null
export let couleur = "bleu"

var bgColoree = ""
var textColore = ""
var borderColore = ""

var articles = []
let optionsProxy = {
    'resizing_type': 'fill',
    'width': 60,
    'height': 60,
    'gravity': 'ce'
}
var flagConfirmationEffacer = false
var flagSuppressionarticle = false
var articleAEffacerId = ""
var garderBanniere = false

switch (couleur) {
    case "bleu":
        console.log("bleu !", couleur)
        bgColoree = "bg-bleuLBFTT"
        textColore = "text-bleuLBF"
        borderColore = "border-bleuLBF"
        break;
    case "vert":
        console.log('vert !', couleur)
        bgColoree = "bg-vertLBFTT"
        textColore = "text-vertLBF"
        borderColore = "border-vertLBF"
        break;
}

onMount(() => {
    getArticlesByUser($user.id, estPublie, limiteNbArticles).then((retour) => {
        articles = retour
    })
})

function fondListe (index) {
    var retour = " divide-gray-700"
    if (index % 2 == 0) {
        switch (couleur) {
            case "bleu":
                retour = " divide-gray-900 " + bgColoree
                break;
            case "vert":
                retour = " divide-gray-900 " + bgColoree 
                break;
        }
    }
    return retour
}

function effacerarticle() {
    flagSuppressionarticle = true
    const articleAEffacer = articles.filter(article => article.id === articleAEffacerId)[0]
    var promises = []
    if (articleAEffacer && articleAEffacer.illustrations && articleAEffacer.illustrations.length > 0) {
        if (articleAEffacer.banniere.id !== 51 && !garderBanniere) {
            promises.push(effaceIllustration({illustrationId: articleAEffacer.banniere.id, imageId: articleAEffacer.banniere.illustration[0].id}))
        }
        articleAEffacer.illustrations.forEach((illu) => {
            promises.push(effaceIllustration({illustrationId: illu.id, imageId: illu.illustration[0].id}))
        })
    }
    if (promises.length > 0) {
        Promise.all(promises).then((lesRetours) => {
            console.log('lesRetours', lesRetours)
        })
    }
    deleteArticle(articleAEffacerId).then((retour) => {
        getArticlesByUser($user.id, estPublie, limiteNbArticles).then((retour) => {
            articles = retour
        })
        flagConfirmationEffacer = false
        flagSuppressionarticle = false
    })
}

function sendToEditor(id) {
    window.location.assign(window.location.origin + '/redaction/editeur?id=' + id)
}

</script>

<div class="flex flex-col">
    {#each articles as article, index}
    <div class={"flex flex-row divide-x py-2 justify-between border border-gray-900" + fondListe(index)}>
        <div class="px-4 flex-shrink-0 text-gray-700">
            {#await imgProxyUrl("https://cms.labonnefabrique.fr" + article.banniere.illustration[0].url, optionsProxy)}
                <img
                    src="/img/svg/clock-regular.svg"
                    alt="logo"
                    class={"rounded border " + borderColore}
                    width="60"
                    height="60"
                    />
            {:then value}
                <img
                    src={value.imgProxyUrl}
                    alt={article.titre}
                    class={"rounded border cursor-pointer " + borderColore}
                    width="60"
                    height="60"
                    on:click={() => sendToEditor(article.id)}
                    />
            {/await}
        </div>
        <div class="px-2 flex-grow flex flex-col justify-start cursor-pointer" on:click={() => sendToEditor(article.id)}>
            <div class="body-2 mb-1"><span class={"font-medium " + textColore}>Dernière mise à jour :</span> {dateJourMoisHeure(article.updated_at)}</div>
            <h5 class="ml-2">{article.titre}</h5>
        </div>
        <div class="flex flex-row gap-1 px-2 flex-shrink-0">
            <Bouton on:actionBouton={() => sendToEditor(article.id)} largeur="w-10" couleur={textColore + " " + borderColore}>
                <Fa icon={faEdit} class="mx-auto" />
            </Bouton>
            <Bouton on:actionBouton={() => {articleAEffacerId = article.id; flagConfirmationEffacer = true}} largeur="w-10" couleur="text-rougeLBF border-rougeLBF">
                <Fa icon={faTrashAlt} class="mx-auto" />
            </Bouton>
        </div>
    </div>
    {:else}
    {#if estPublie}
        <div class="ml-6">Vous n'avez encore publié aucune article...</div>
    {:else}
        <div class="ml-6">Aucun brouillon n'est en cours...</div>
    {/if}
    {/each}
</div>

<Dialog bind:visible={flagConfirmationEffacer} >
    <h4 slot="title">Confirmation</h4>
    <p>Confirmer la suppression du document. Les images utilisées seront également supprimées.</p>
    <div class="flex flex-row gap-1 mt-2">
        <CheckBoxAlone label="banniere" cbClasses={textColore} bind:checked={garderBanniere} />
        <div>Je veux conserver l'image bannière pour une future utilisation</div>
    </div>
    <div slot="actions" class="flex flex-column ml-2">
        <Bouton on:actionBouton={() => flagConfirmationEffacer = false} size="lg">Annuler</Bouton>
        <Bouton occupe={flagSuppressionarticle} on:actionBouton={effacerarticle} size="lg" couleur="text-orangeLBF border-orangeLBF">Confirmer</Bouton>
    </div>
</Dialog>

