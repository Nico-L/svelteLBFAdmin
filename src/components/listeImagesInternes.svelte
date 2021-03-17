<script>
import {onMount } from 'svelte'
import {listeImages, getLogo, effaceIllustration} from "./../strapi/illustrations.js"
import {imgProxyUrl} from "../strapi/imgProxy.js"
import FilePond from "./../components/Filepond.svelte"

import Fa from 'svelte-fa'
import { faCircle, faDotCircle, faTrashAlt } from '@fortawesome/free-regular-svg-icons'

export let espaceId = null
export let tagId = null
export let userId = null
export let blobImage = null
export let idIllustration = null

var dataImg = {
    espace: espaceId,
    tag: tagId
}

var urlImage = ""
var listeIllustrations = []
var logo = null
var flagUploadDone = true
const optionsULRThumbs =  {
    'resizing_type': 'fill',
    'width': 80,
    'height': 80,
    'gravity': 'ce'
}
var illustrationAEffacer = {'illustrationId': '', 'imageId': ''}
var flagConfirmationEffacer = false

$: {
    dataImg = {
        user: userId,
        espace: espaceId,
        tag: tagId
    }
}

$: {espaceId, getListeIllustrations()}

$: if (flagUploadDone && logo !== null) getListeIllustrations()

onMount(() => {
    getLogo().then((retour) => {
        logo = retour[0];
        if ((!idIllustration) && logo !== null) {urlImage = 'https://cms.labonnefabrique.fr' + logo.media.url; idIllustration = logo.id}
        })
})

function setImgData(url, fullDataImg) {
    urlImage = 'https://cms.labonnefabrique.fr' + url
    idIllustration = fullDataImg.id
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
            urlImage = 'https://cms.labonnefabrique.fr' + listeIllustrations.filter((image) => image.id === idIllustration)[0].media.url
        }) 
    }
}

function effaceImage() {
    flagSuppressionImage = true
    effaceIllustration(illustrationAEffacer)
        .then((retour)=>{
            flagSuppressionImage = false;
            flagUploadDone = true;
            flagConfirmationEffacer = false
            })
    
}
</script>


<div>
    <div class="flex flex-column flex-wrap justify-start mt-2 mb-2 w-full min-w-full">
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
    <FilePond blobImage={blobImage} data={dataImg} on:uploadDone={() => {flagUploadDone = true;}}/>
</div>