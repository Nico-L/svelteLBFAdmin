<script>
    import {onMount, onDestroy} from 'svelte';
    import Dropzone from '../../utils/dropzone.js'
    import { v4 as uuidv4 } from 'uuid';
    import Fa from 'svelte-fa'
    import { faTrashAlt, faSave } from '@fortawesome/free-regular-svg-icons'
    import { faTimes } from '@fortawesome/free-solid-svg-icons'

    import {tagsArticlesStore} from "../../stores/tagsArticles.js"
    import { buildNeeded } from "../../stores/build.js"

    import Dialog from '../../components/Dialog.svelte';
    import Bouton from '../../components/Button/Button.svelte'
    import Editeur from '../../components/editeur.svelte';
    import FilePond from "../../components/Filepond.svelte"
    import AutoComplete from '../../components/simpleAutoComplete.svelte'
    import { user } from "../../stores/user.js"
    import {espacesBF} from '../../stores/espacesBF.js'
    import { tags } from "../../stores/tags.js"
    import {imgProxyUrl} from "../../strapi/imgProxy.js"

    import { listeImgByUuid, effaceIllustration } from "../../strapi/illustrations.js"
    import { saveGalerie, updateGalerie, deleteGalerie, getGalerieById } from "../../strapi/galeries.js"

    export let type = null
    export let id = null

    let typeToString=[]
    let dropzoneEl
    typeToString["evenement"] = "&Eacute;vènement"
    typeToString["realisation"] = "Réalisation"
    var couleurTexte = ""
    var couleurBordure = ""
    var couleurFond = ""
    var couleurTitre = ""
    var couleurEditeur = ""
    var dataGalerie = {
        type: type,
        description: "",
        titre: "",
        auteur: "",
        illustrations: [],
        tags: []
    }
    var currentIllustrations = []
    var listeIllustrations = []
    var indexToDelete = 0
    var isCurrent = false
    var newTag = null
    var flagUploadDone = true
    var flagConfirmationEffacer = false
    var flagSuppressionImage = false
    var flagSauvegardeEnCours = false
    var flagSauvegardeSucces = false
    var busyEffacerGalerie = false
    var flagConfirmationEffacerGalerie = false
    var flagEdition = false
    let tagId;
    let espaceId;
    var uuid = uuidv4()
    const optionsULRThumbs =  {
        'resizing_type': 'fill',
        'width': 120,
        'height': 120,
        'gravity': 'ce'
    }
    let illustrationAEffacer = {'illustrationId': '', 'imageId': ''}

    var uploadProgress = 0
    const texteDropzone = "Déposer des images sur ce cadre ou cliquer"
    var uploadInProgress = false
    var uploadsEnCours = []
    var textUploadError = ""

    $tags.forEach((tag) => {
        if (tag.tag==="galerie") tagId=tag.id
    })
    $espacesBF.forEach((espace)=> {
        if (espace.value==="l'atelier") espaceId = espace.id
    })
    var dataImg = {
        user: $user.id,
        espace: espaceId,
        tag: tagId,
    }

onMount(() => {
    if (id !== null) {
        getGalerieById(id).then((leGalerie) => {
            dataGalerie = leGalerie[0]
            listeIllustrations = dataGalerie.illustrations
        })
    }
    var dropzone = new Dropzone(dropzoneEl, {
            url: "https://cms.labonnefabrique.fr/illustrations",
            withCredentials: false,
            paramName: 'files.media',
            uploadMultiple: false,
            parallelUploads: 5,
            timeout: 120000,
            headers: {
                'Cache-Control': null, //required for cors
                'X-Requested-With': null, //required for cors
                'Authorization': 'Bearer ' + $user.jwt,
            },
            createImageThumbnails: false,
            acceptedFiles: "image/*",
            resizeWidth: 2048,
            resizeHeight: 2048,
            resizeMethod: 'contain',
            resizeQuality: 1.0,
            chunking: false
        })
        dropzone.on('sending', (file, xhr, formData) => {
            textUploadError = ""
            formData.append('data', JSON.stringify(dataImg))
            uploadsEnCours.push({name: file.name, progress: 0})
            uploadsEnCours = uploadsEnCours
        });
        dropzone.on('success', (file, response) => {
            uploadInProgress = false
            uploadProgress = 0
            currentIllustrations.push(response)
            currentIllustrations = currentIllustrations
            uploadsEnCours = uploadsEnCours.filter((upload) => upload.name !== file.name)
        })
        dropzone.on('error', (file, errorMessage) => {
            uploadsEnCours = uploadsEnCours.filter((upload) => upload.name !== file.name)
            uploadInProgress = false
            if (errorMessage.includes("Request timedout")) {
                textUploadError = "Le téléchargement prend trop de temps. Réduisez le nombre d'images simultané ou réduisez la taille des images."
            }
        })
        dropzone.on('uploadprogress', (file, progress) => {
            uploadInProgress = true
            uploadsEnCours.forEach((upload) => {
                if (upload.name == file.name) upload.progress = Math.round(progress)
            })
            uploadsEnCours = uploadsEnCours
            //uploadProgress = Math.round(progress)
        })
})

$: {
    dataGalerie.type = type
    if (type == "realisation") {
        couleurTexte = "text-bleuLBF"
        couleurFond = "bg-bleuLBF"
        couleurBordure = "border-bleuLBF"
        couleurTitre = "text-lbfbleu-700"
        couleurEditeur = "bleu"
    } else {
        couleurTexte = "text-jauneLBF"
        couleurFond = "bg-jauneLBF"
        couleurBordure = "border-jauneLBF"
        couleurTitre = "text-lbfjaune-700"
        couleurEditeur = "jaune"
    }
}

$: {
    dataImg = {
        user: $user.id,
        espace: espaceId,
        tag: tagId
    }
}

$: {
    if (dataGalerie !== undefined && newTag !== null) {
        dataGalerie.tags.push(newTag)
    }
    newTag = null
    }

function effaceImage() {
    flagSuppressionImage = true
    effaceIllustration(illustrationAEffacer)
        .then((retour)=>{
            flagSuppressionImage = false;
            if (isCurrent) {
                currentIllustrations.splice(indexToDelete, 1)
            } else {
                dataGalerie.illustrations.splice(indexToDelete, 1)
            }
            flagConfirmationEffacer = false
        })
}

function validationSauvegarde() {
    if (dataGalerie.id) {
        majGalerie()
    } else {
        sauveGalerie()
    }
}

function effacerTag(index) {
        dataGalerie.tags.splice(index, 1)
        dataGalerie = dataGalerie
    }

function sauveGalerie() {
    if (dataGalerie.titre !== "") {
        flagSauvegardeEnCours = true
        if (currentIllustrations.length > 0) {
            dataGalerie.illustrations = dataGalerie.illustrations.concat(currentIllustrations)
            currentIllustrations = []
        }
        saveGalerie(dataGalerie).then((retour) => {
            buildNeeded.set(true)
            window.location.assign(window.location.origin + "/galeries/edit/" + retour.id)
        })
    }
}

function majGalerie() {
    flagSauvegardeEnCours = true
    if (currentIllustrations.length > 0) {
            dataGalerie.illustrations = dataGalerie.illustrations.concat(currentIllustrations)
            listeIllustrations = dataGalerie.illustrations
            currentIllustrations = []
        }
    updateGalerie(dataGalerie).then((retour) => {
        buildNeeded.set(true)
        flagSauvegardeEnCours = false
    })
}

function suppressionGalerie() {
    if (dataGalerie.id)
    {
        busyEffacerGalerie = true
        deleteGalerie(dataGalerie.id).then((retour) => {
            let promises = []
            dataGalerie.illustrations.forEach((illustration) => {
                illustrationAEffacer= {'illustrationId': illustration.id, 'imageId': illustration.media.id}
                promises.push(effaceIllustration(illustrationAEffacer))
            })
            Promise.all(promises).then((retour) => {
                window.location.assign(window.location.origin)   
            })
        })
    }
}

onDestroy(()=> {
    if (currentIllustrations.length > 0)
    {
        currentIllustrations.forEach((illustration) => {
            illustrationAEffacer= {'illustrationId': illustration.id, 'imageId': illustration.media.id}
            effaceImage()
        })
    }
})

</script>

<main class="max-w-720px">
    <h3 class={"mt-4 mb-2 " + couleurTitre}>{@html typeToString[dataGalerie.type]} de l'atelier</h3>
    <div class="mt-4 ">
        <label for="titre" class={"h5 font-medium " + couleurTexte}>
            Titre
        </label>
        <input 
            bind:value= {dataGalerie.titre}
            class={"bg-gray-900 text-gray-200 focus:outline-none border rounded py-2 px-4 block w-full appearance-none leading-normal " + couleurBordure}
            type="text"
            id="titre"
            />
    </div>
    <div class="mt-4 ">
        <label for="auteur" class={"h5 font-medium " + couleurTexte}>
            Auteur
        </label>
        <input 
            bind:value= {dataGalerie.auteur}
            class={"bg-gray-900 text-gray-200 focus:outline-none border rounded py-2 px-4 block w-full appearance-none leading-normal " + couleurBordure}
            type="text"
            id="auteur"
            />
    </div>
    <div class="mt-4 ">
        <div class={"h5 font-medium " + couleurTexte}>Description</div>
        <Editeur bind:contenu={dataGalerie.description} couleur={couleurEditeur}/>
    </div>
    <div class="mt-4">
        <h5 class={couleurTexte}>Tags</h5>
        <div class="ml-1">Les tags sont des mots permettant de classer les articles et de faire des recherches dans la liste des articles</div>
        <AutoComplete
            items={$tagsArticlesStore}
            bind:selectedItem={newTag}
            labelFieldName="tag" 
            inputClassName="bg-gray-900 text-gray-200 focus:outline-none border rounded py-1 px-4 block w-full appearance-none leading-normal "
            hideArrow="true"
            className="w-full"
            dropdownClassName = "bg-gray-800 text-gray-500"
            noResultsText = "Aucun résultat"
            />
        <div class="mx-2 mt-2 flex flew-row flex-wrap justify-start">
            {#each dataGalerie.tags as tag, index}
                <div class={"h-6 mx-1 my-1 p-2 rounded-full border flex flex-row items-center text-sm " + couleurTexte + " " + couleurBordure}>
                    <div class="cursor-pointer"  on:click={() => {effacerTag(index)}}><Fa icon={faTimes} /></div>
                    <span class="ml-2 font-semibold">{tag.tag}</span>
                </div>
            {/each}
        </div>
    </div>
    <div class="mt-4 ">
        <div class={"h5 font-medium " + couleurTexte}>Illustrations</div>
        <div class="mb-2">
            Vous pouvez ajouter jusque 6 images. Vous pouvez sélectionner plusieurs images à la fois.
            La dimension la plus grande des images est réduite à 2048 pixels si l'image est trop grande. 
            Le temps alloué pour le téléversement est de 2 minutes. Au-delà, une erreur se produira.
            La première image servira de bannière.</div>
        <div class="flex flex-wrap gap-2">
            {#each listeIllustrations as illustration, index}
                <div class="p-1">
                    {#await imgProxyUrl('https://cms.labonnefabrique.fr'+illustration.media.url, optionsULRThumbs)} 
                        <img
                            src="/img/svg/clock-regular.svg"
                            alt="logo"
                            width={optionsULRThumbs.width}
                            height={optionsULRThumbs.height}
                            />
                    {:then value}
                        <img 
                            class="rounded" 
                            src={value.imgProxyUrl} 
                            width={optionsULRThumbs.width}
                            height={optionsULRThumbs.height}
                            alt={illustration.name}
                            />
                    {/await} 
                    <div class="flex flex-column">
                        <div class="text-orangeLBF ml-1 my-1 cursor-pointer" on:click={() => {indexToDelete = index; isCurrent = false; illustrationAEffacer= {'illustrationId': illustration.id, 'imageId': illustration.media.id}; flagConfirmationEffacer = true}}>
                            <Fa icon={faTrashAlt} />
                        </div>
                    </div>
                </div>
            {/each}
            {#each currentIllustrations as illustration, index}
                <div class="p-1">
                    {#await imgProxyUrl('https://cms.labonnefabrique.fr'+illustration.media.url, optionsULRThumbs)} 
                        <img
                            src="/img/svg/clock-regular.svg"
                            alt="logo"
                            width={optionsULRThumbs.width}
                            height={optionsULRThumbs.height}
                            />
                    {:then value}
                        <img 
                            class="rounded cursor-pointer" 
                            src={value.imgProxyUrl} 
                            width={optionsULRThumbs.width}
                            height={optionsULRThumbs.height}
                            alt={illustration.name}
                            />
                    {/await} 
                    <div class="flex flex-column">
                        <div class="text-orangeLBF ml-1 my-1 cursor-pointer" on:click={() => {indexToDelete = index; isCurrent = true; illustrationAEffacer= {'illustrationId': illustration.id, 'imageId': illustration.media.id}; flagConfirmationEffacer = true}}>
                            <Fa icon={faTrashAlt} />
                        </div>
                    </div>
                </div>
            {/each}
                {#each uploadsEnCours as upload} 
                    <div class={"w-120px h-120px p-2 text-center flex flex-col justify-center items-center rounded border " + couleurBordure + " " + couleurTexte}>
                        <div>Téléversement en cours </div>
                        <div>{upload.progress} %</div>
                    </div>
                {/each}
            {#if dataGalerie.illustrations.length + currentIllustrations.length < 6}
                <div  class={"w-120px h-120px p-2 text-center rounded border " + couleurBordure + " " + couleurTexte}>
                    <div bind:this={dropzoneEl} class="w-full h-full flex justify-center items-center cursor-pointer">{texteDropzone}</div>
                </div>
            {/if}
        </div>
        <div class="text-rougeLBF ml-4">
            {textUploadError}
        </div>
    </div>
    <div class="flex flex-row justify-end">
        {#if dataGalerie.id}
            <Bouton occupe={busyEffacerGalerie} on:actionBouton={() => flagConfirmationEffacerGalerie = true} largeur="w-10" couleur="text-rougeLBF border-rougeLBF">
                <Fa icon={faTrashAlt} size="lg"  class="mx-auto" />
            </Bouton>
        {/if}
        <Bouton bind:occupe={flagSauvegardeEnCours} bind:succes={flagSauvegardeSucces} on:actionBouton={validationSauvegarde} largeur="w-12" couleur="text-vertLBF border-vertLBF">
            <Fa icon={faSave} size="lg" class="mx-auto" />
        </Bouton>
    </div>
</main>
<!-- confirmation effacer image-->
<Dialog bind:visible={flagConfirmationEffacer} >
    <h4 slot="title">Confirmation</h4>
    <p>Confirmer la suppression de l'image</p>
      <div slot="actions" class="flex flex-column">
        <Bouton on:actionBouton={() => flagConfirmationEffacer = false}>Annuler</Bouton>
        <Bouton occupe={flagSuppressionImage} on:actionBouton={effaceImage} couleur="text-orangeLBF border-orangeLBF">Confirmer</Bouton>
      </div>
</Dialog>
<!-- confirme efface Galerie  -->
<Dialog bind:visible={flagConfirmationEffacerGalerie} on:close={() => {flagConfirmationEffacerGalerie=false}}>
    <h4 slot="title">Confirmation</h4>
    <p>Confirmer la suppression de <em>{dataGalerie.titre}</em></p>
    <div slot="actions" class="flex flex-row justify-end items-center">
        <Bouton on:actionBouton={() => flagConfirmationEffacerGalerie = false}>Annuler</Bouton>
        <Bouton occupe={busyEffacerGalerie} on:actionBouton = {suppressionGalerie} couleur="text-orangeLBF border-orangeLBF">Confirmer</Bouton>
    </div>
</Dialog>
