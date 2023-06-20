<script>
import Fa from 'svelte-fa'
import { faSearch } from '@fortawesome/free-solid-svg-icons'
import { faCheckSquare, faSquare, faSave } from '@fortawesome/free-regular-svg-icons'
import Bouton from './Button/Button.svelte'

import {pixabayListe, savePixabayImage} from '../strapi/pixabay.js'

var idIllustration = ""
export let blobImage = null
export let pixabayUser = ""

var motsClefs = ""
var listeImages = []
var urlImage = ""
var occupeRecupImages = false
var flagDownloadImage = false
var page = 1

function fetchImages() {
    if (motsClefs !== "") {
        occupeRecupImages = true
        const variables = {
            q: motsClefs,
            lang:"fr",
            safesearch: true,
            orientation: "horizontal",
            per_page: 20,
            page: page

        }
        pixabayListe(variables).then((retour) =>{
            if (retour.data.totalHits > 0) {
                listeImages = retour.data.hits
                }
            occupeRecupImages = false
            })
    }
}

function downloadImage(id, url, user, user_id) {
    idIllustration = id
    urlImage = url
    pixabayUser = user + "_" + user_id
    flagDownloadImage = true
    savePixabayImage(urlImage).then((blob) => {
        flagDownloadImage = false
        blobImage = blob
    })
}

</script>

<svelte:body
  on:keydown={(event) => {
      if (event.keyCode === 13) {
          fetchImages()
        }
    }
  } />

<div>
    <label for="motsClefs" class="text-sm">Entrer un ou plusieurs mots clef(s) pour rechercher des images (en français ou en anglais, sans accentuation).</label>
    <div class="flex gap-4">
        <input 
            bind:value= {motsClefs}
            class="bg-gray-900 text-gray-200 focus:outline-none border border-vertLBFT rounded py-1 px-4 block w-300px max-w-5/6 appearance-none leading-normal"
            type="text"
            id="motsClefs"
            />
        <Bouton occupe= { occupeRecupImages } on:actionBouton={fetchImages} largeur="w-10" couleur="text-vertLBF" noBorder={true}>
                <Fa icon={faSearch} size="2x"  class="mx-auto" />
        </Bouton>
    </div>
    <div class="my-4 min-h-180px flex flex-row flex-wrap gap-1 justify-center items-center rounded overflow-hidden">
        {#each listeImages as image}
        <div class="flex flex-col items-end cursor-pointer relative overflow-hidden imagePixabay">
            <img 
                src="{image.webformatURL.replace("_640", "_180")}"
                alt="illustration Pixabay"
                width="180"
                height="135"
                class="object-cover w-180px h-120px rounded"/>
            {#if flagDownloadImage && idIllustration === image.id}
                <div class="bg-vertLBFT h-full w-full absolute inset-0 flex justify-center items-center">
                    <div class="w-full h-full flex justify-center items-center text-gray-900">
                        <svg xmlns="http://www.w3.org/2000/svg" class="fill-current stroke-current h-20 w-20 mx-auto" viewBox="0 0 50 50">
                            <g fill="none" fill-rule="evenodd" stroke-width="2">
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
                </div>
            {:else}
                <div class="rounded bg-vertLBFT h-full w-full absolute inset-0 flex justify-center items-center save" 
                on:click={() => downloadImage(image.id, image.largeImageURL, image.user, image.user_id)}
                on:keypress={() => downloadImage(image.id, image.largeImageURL, image.user, image.user_id)}
                    >
                    <div class="w-full h-full flex justify-center items-center text-gray-900">
                        <Fa icon={faSave} size="4x"  class="mx-auto" />
                    </div>
                </div>
            {/if}
            <!-- <div class="relative my-1 text-vertLBF mr-2">
                {#if idIllustration === image.id}
                <Fa icon={faCheckSquare} />
                {:else}
                <Fa icon={faSquare} />
                {/if}
            </div> -->
        </div>
        {:else}
            <div class="h-120px w-full bg-vertLBFTT rounded flex justify-center items-center text-gray-500">
            aucun résultat
            </div>
        {/each}
    </div>
        <div>
            <div class="w-full flex flex-row justify-between border-t border-vertLBFT items-center">
                <div class="w-300px flex items-center"><span>Propulsé par </span><a href="https://www.pixabay.com" target="_blank"><img src="/img/logos/logoPixabay.svg" alt="logo Pixabay" height="30" class="ml-2 my-1 bg-white h-30px p-1 rounded "/></a> </div>
                {#if listeImages.length >0}
                    <ul class="flex flex-row gap-2 text-lg font-medium">
                        <li class="cursor-pointer" on:click={() => {page = page - 1; if (page <1) {page = 5}; fetchImages()}} on:keypress={() => {page = page - 1; if (page <1) {page = 5}; fetchImages()}}> &#60; </li>
                        {#each Array(5) as _, index}
                            <li class="cursor-pointer" on:click={() => {page = index + 1; fetchImages()}} on:keypress={() => {page = index + 1; fetchImages()}}>{index + 1}</li>
                        {/each}
                        <li class="cursor-pointer" on:click={() => {page = page + 1; if (page > 5) {page = 1}; fetchImages()}} on:keypress={() => {page = page + 1; if (page > 5) {page = 1}; fetchImages()}}> &#62; </li>
                    </ul>
                {/if}
            </div>
    </div>
</div>