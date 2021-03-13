<script>
import {onMount, tick } from 'svelte'
import Dialog from './Dialog.svelte';
import Bouton from './Button/Button.svelte';
import Fa from 'svelte-fa'
import { faCircle, faDotCircle, faTrashAlt } from '@fortawesome/free-regular-svg-icons'
import { faArrowLeft } from '@fortawesome/free-solid-svg-icons'
import {listeImages, getLogo, effaceIllustration} from "./../strapi/illustrations.js"
import {imgProxyUrl} from "../strapi/imgProxy.js"
import FilePond from "./../components/Filepond.svelte"

var showDialog = false;
var flagConfirmationEffacer = false;
var flagSuppressionImage = false;
var suppressionId = "";
var suppressionImageId="";

var urlImage = ""
export let idIllustration = null
export let dataImage
export let options = {
    'resizing_type': 'fill',
    'width': 80,
    'height': 80,
    'gravity': 'ce'
}
const classSizeImg = 'w-' + options.width + 'px ' + 'h-' + options.height + 'px '

export let altImage = "Une illustration";
export let classImage = {};
//export let userId = null
export let espaceId = null
export let tagId = null
export let userId = null

var dataImg = {
    espace: espaceId,
    tag: tagId
}
let flagUploadDone = true
let flagRecupIllu = false
const optionsULRThumbs =  {
    'resizing_type': 'fill',
    'width': 80,
    'height': 80,
    'gravity': 'ce'
}
const classSizeThumb = 'w-' + optionsULRThumbs.width + 'px ' + 'h-' + optionsULRThumbs.height + 'px '

let illustrationAEffacer = {'illustrationId': '', 'imageId': ''}

var listeIllustrations = []
let logo = null

onMount(() => {
    getLogo().then((retour) => {
        logo = retour[0];
        if ((!idIllustration) && logo !== null) {urlImage = 'https://cms.labonnefabrique.fr' + logo.media.url; idIllustration = logo.id}
        })
})

$: {
    dataImg = {
        user: userId,
        espace: espaceId,
        tag: tagId
    }
}

$: {espaceId, getListeIllustrations()}

$: if (flagUploadDone && logo !== null) getListeIllustrations()

function effaceImage() {
    flagSuppressionImage = true
    effaceIllustration(illustrationAEffacer)
        .then((retour)=>{
            flagSuppressionImage = false;
            flagUploadDone = true;
            flagConfirmationEffacer = false
            })
    
}

function setImgData(url, fullDataImg) {
    urlImage = 'https://cms.labonnefabrique.fr' + url
    idIllustration = fullDataImg.id
    dataImage = fullDataImg
}

function getListeIllustrations() {
    if (logo !== null) {
       listeImages(userId, espaceId, tagId)
        .then((lesImages)=> {
            flagUploadDone = false
            listeIllustrations = [
                logo,
                ...lesImages
            ]
            flagRecupIllu = false
            urlImage = 'https://cms.labonnefabrique.fr' + listeIllustrations.filter((image) => image.id === idIllustration)[0].media.url
        }) 
    }
    
}

</script>
{#if idIllustration!== null && urlImage!==""}
    {#await imgProxyUrl(urlImage, options)}
        <img
            src="/img/svg/clock-regular.svg"
            alt="logo"
            class={"cursor-pointer " + classImage}
            width={options.width}
            height={options.height}
            />
    {:then value}
        <img
            src={value.imgProxyUrl}
            alt={altImage}
            on:click={() => showDialog = true}
            class={"cursor-pointer " + classImage}
            width={options.width}
            height={options.height}
            />
    {/await}
{/if}
<Dialog bind:visible={showDialog} on:close={() => showDialog = false}>
    <h4 slot="title">Choix Illustration</h4>
    <div class="flex flex-column flex-wrap justify-start mb-2">
        {#each listeIllustrations as illu (illu.id)}
            <div class="p-1">
                {#await imgProxyUrl('https://cms.labonnefabrique.fr'+illu.media.url, optionsULRThumbs)} 
                    <img
                        src="/img/svg/clock-regular.svg"
                        alt="logo"
                        width={optionsULRThumbs.width}
                        height={optionsULRThumbs.height}
                        />
                {:then value}
                    <img 
                        class="rounded cursor-pointer"
                        on:click={() => {setImgData(illu.media.url, illu)}} 
                        src={value.imgProxyUrl} 
                        width={optionsULRThumbs.width}
                        height={optionsULRThumbs.height}
                        alt={illu.name}
                        />
                {/await} 
                <div class="flex flex-column">
                    <div on:click={() => {setImgData(illu.media.url, illu)}} class="relative my-1 text-vertLBF cursor-pointer">
                        {#if urlImage === 'https://cms.labonnefabrique.fr' + illu.media.url}
                        <Fa icon={faDotCircle} />
                        {:else}
                        <Fa icon={faCircle} />
                        {/if}
                    </div>
                    {#if illu.tag.tag !== "logo"}
                        <div class="text-orangeLBF ml-1 my-1 cursor-pointer" on:click={() => {illustrationAEffacer= {'illustrationId': illu.id, 'imageId': illu.media.id}; flagConfirmationEffacer = true}}>
                            <Fa icon={faTrashAlt} />
                        </div>
                    {/if}
                </div>
            </div>
        {/each}
  </div>
  <FilePond data={dataImg} on:uploadDone={() => {flagUploadDone = true;}}/>
  <div slot="actions">
    <Bouton on:actionBouton={() => showDialog = false} largeur="w-10" couleur="text-bleuLBF border-bleuLBF">
        <Fa icon={faArrowLeft} size="lg"  class="mx-auto" />
    </Bouton>
  </div>
</Dialog>
<!-- confirmation effacer-->
<Dialog bind:visible={flagConfirmationEffacer} >
<h4 slot="title">Confirmation</h4>
<p>Confirmer la suppression de l'image</p>
  <div slot="actions" class="flex flex-column">
    <Bouton on:actionBouton={() => flagConfirmationEffacer = false}>Annuler</Bouton>
    <Bouton occupe={flagSuppressionImage} on:actionBouton={effaceImage} couleur="text-orangeLBF border-orangeLBF">Confirmer</Bouton>
  </div>
</Dialog>