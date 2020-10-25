<script>
import {onMount, tick } from 'svelte'
import Dialog from './Dialog.svelte';
import Bouton from './Button/Button.svelte';
import Fa from 'svelte-fa'
import { faCircle, faDotCircle, faTrashAlt } from '@fortawesome/free-regular-svg-icons'
import { faArrowLeft } from '@fortawesome/free-solid-svg-icons'
import {listeImgByEspaceEtTag, effaceIllustration} from "./../strapi/illustrations.js"
import {imgProxyUrl} from "../strapi/imgProxy.js"
import FilePond from "./../components/Filepond.svelte"

var showDialog = false;
var flagConfirmationEffacer = false;
var flagSuppressionImage = false;
var suppressionId = "";
var suppressionImageId="";

export let urlImage = "https://cms.labonnefabrique.fr/uploads/logo_LBF_bb0853ef96.png"
export let options = {
    'resizing_type': 'fill',
    'width': 80,
    'height': 80,
    'gravity': 'ce'
}
export let altImage = "Une illustration";
export let classImage = {};
export let dataImg

let flagUploadDone = true
let flagRecupIllu = false
const optionsULRThumbs =  {
    'resizing_type': 'fill',
    'width': 80,
    'height': 80,
    'gravity': 'ce'
}
let illustrationAEffacer = {'illustrationId': '', 'imageId': ''}

var listeIllustrations = []
$: {if (flagUploadDone && dataImg!== {})
        var dataForList = dataImg
        flagRecupIllu = true
        listeImgByEspaceEtTag(dataImg.espace, dataImg.tag).then((lesImages)=> {
            listeIllustrations = lesImages
            flagRecupIllu = false
        })
        flagUploadDone = false
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
{#await imgProxyUrl(urlImage, options)}
    ...
{:then value}
    <img
        src={value.imgProxyUrl}
        alt={altImage}
        on:click={() => showDialog = true}
        class={"cursor-pointer " + classImage}
        />
{/await}

<Dialog bind:visible={showDialog} on:close={() => showDialog = false}>
    <h4 slot="title">Choix Illustration</h4>
    <div class="flex flex-column flex-wrap justify-start mb-2">
        <div on:click={() => {urlImage = "https://cms.labonnefabrique.fr/uploads/logo_LBF_bb0853ef96.png"}} class="p-1">
            {#await imgProxyUrl('https://cms.labonnefabrique.fr/uploads/logo_LBF_bb0853ef96.png', optionsULRThumbs)} 
              ...
              {:then value}
            <img class="rounded cursor-pointer" 
                src={value.imgProxyUrl} 
                alt="logo LBF" />
                {/await}
            <div class="flex flex-column">
                <div class="relative my-1 text-vertLBF cursor-pointer">
                    {#if urlImage === "https://cms.labonnefabrique.fr/uploads/logo_LBF_bb0853ef96.png"}
                    <Fa icon={faDotCircle} />
                    {:else}
                    <Fa icon={faCircle} />
                    {/if}
                </div>
            </div>
        </div>
            {#each listeIllustrations as illu (illu.id)}
                <div class="p-1">
                    {#await imgProxyUrl('https://cms.labonnefabrique.fr'+illu.illustration[0].url, optionsULRThumbs)} 
                        ...
                    {:then value}
                        <img 
                            class="rounded cursor-pointer"
                            on:click={() => {urlImage = 'https://cms.labonnefabrique.fr' + illu.illustration[0].url}} 
                            src={value.imgProxyUrl} 
                            alt={illu.name}
                            />
                        {/await}
                        <div class="flex flex-column">
                            <div on:click={() => {urlImage = 'https://cms.labonnefabrique.fr' + illu.illustration[0].url}} class="relative my-1 text-vertLBF cursor-pointer">
                                {#if urlImage === 'https://cms.labonnefabrique.fr' + illu.illustration[0].url}
                                <Fa icon={faDotCircle} />
                                {:else}
                                <Fa icon={faCircle} />
                                {/if}
                            </div>
                            <div class="text-orangeLBF ml-1 my-1 cursor-pointer" on:click={() => {illustrationAEffacer= {'illustrationId': illu.id, 'imageId': illu.illustration[0].id}; flagConfirmationEffacer = true}}>
                                <Fa icon={faTrashAlt} />
                            </div>
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