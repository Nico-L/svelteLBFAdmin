<script>
import {onMount, onDestroy, tick} from 'svelte';
import AutoComplete from '../../components/simpleAutoComplete.svelte'

import {espacesBF} from '../../stores/espacesBF.js'
import {user} from "../../stores/user.js"
import {tagsArticlesStore} from "../../stores/tagsArticles.js"

import EditorJS from '@editorjs/editorjs';
import Header from '@editorjs/header';
import List from '@editorjs/list';
import Marker from '@editorjs/marker'
import Underline from '@editorjs/underline'
import InlineCode from '@editorjs/inline-code'
import Galerie from '../../editorjs/galerie/galerie.js'
import LinkTool from '../../editorjs/linkTool'
import CodeTool from '../../editorjs/CodeTool'

import {dateJourMoisHeure} from "../../utils/dateFr.js"

import ImageUpload from '../../components/imageUpload.svelte';
import Editeur from '../../components/editeur.svelte';
import Chargement from '../../components/chargement.svelte'
import Bouton from '../../components/Button/Button.svelte'
import Fa from 'svelte-fa'
import { faSave, faNewspaper } from '@fortawesome/free-regular-svg-icons'
import { faTimes } from '@fortawesome/free-solid-svg-icons'

import {getArticleById, updateArticle} from '../../strapi/articles.js'
import {listeImages, effaceIllustration} from '../../strapi/illustrations.js'

let editorjs;
let editor;

var firstSave = false
let dataArticle = undefined
var dataBanniere = {
    espaces: 4,
    tags: 4
}
const optionsURL= {
    'resizing_type': 'fill',
    'width': 300,
    'height': 140,
    'gravity': 'ce'
}

var flagArticleLoading = true
var newTag = null

const queryString = window.location.search;
const urlParams = new URLSearchParams(queryString);
const idArticle =urlParams.get('id')

var horaireDerniereSauvegarde = (new Date()).getTime()
var delta = 0
let intervalId
let intervalSauvegarde

var flagSauvegardeEnCours = false
var flagSauvegardeSucces = false
var flagPublicationEnCours = false
var flagPublicationSucces = false
var urlBanniere = ""
let autoCompleteTags

var estPublie = false

$: {
    if (dataArticle !== undefined && newTag !== null) {
        dataArticle.tags.push(newTag)
    }
    newTag = null
    }

onMount(()=> {
    getArticleById(idArticle).then(async (article) => {
        if (article.published_at === null) {
            estPublie = false
        } else {
            estPublie = true
        }
        dataArticle = {
            ...article
        }
        //urlBanniere = 'https://cms.labonnefabrique.fr' + article.banniere.media.url
        let dataTemp
        if (article.data !== null) {
            dataTemp = article.data
        } else {
            dataTemp = {
                blocks: [
                    {
                        type: "paragraph",
                        data: {text:""}
                    }
                ]
            }
        }
        flagArticleLoading = false
        await tick();
        editor = new EditorJS({
            /**
             * Id of Element that should contain Editor instance
             */
            holder: editorjs,
            tools: {
                codeTool: {
                    class: CodeTool,
                    shortcut: 'CMD+SHIFT+K',
                },
                linkTool: {
                    class: LinkTool,
                    shortcut: 'CMD+SHIFT+L',
                    config: {
                        endpoint: 'https://cms.labonnefabrique.fr/getmetadata', // Your backend endpoint for url data fetching
                    }
                },
                galerie: {
                    class: Galerie,
                    shortcut: 'CMD+SHIFT+G',
                    config: {
                        user: $user.id,
                        article: parseInt(idArticle),
                        espace: dataArticle.espace.id,
                        tag: 4,
                        token: $user.jwt
                    }
                },
                header: {
                    class: Header,
                    shortcut: 'CMD+SHIFT+E',
                    inlineToolbar : true,
                    config: {
                        placeholder: 'Un titre'
                    },
                    },
                list: {
                    class: List,
                    shortcut: 'CMD+SHIFT+L',
                    inlineToolbar: true
                },
                marker: {
                    class: Marker,
                    shortcut: 'CMD+SHIFT+M',
                    inlineToolbar: true
                },
                underline: {
                    class: Underline,
                    shortcut: 'CMD+SHIFT+S',
                    inlineToolbar: true
                },
                inlineCode: {
                    class: InlineCode,
                    shortcut: 'CMD+SHIFT+C',
                    inlineToolbar: true
                }

            },
              /**
             * Internationalzation config
             */
            i18n: {
                /**
                 * @type {I18nDictionary}
                 */
                messages: {
                /**
                 * Other below: translation of different UI components of the editor.js core
                 */
                ui: {
                    "blockTunes": {
                        "toggler": {
                            "Click to tune": "Cliquer pour les options",
                            "or drag to move": "ou faire glisser"
                        },
                    },
                    "inlineToolbar": {
                        "converter": {
                            "Convert to": "Conversion"
                        }
                    },
                    "toolbar": {
                        "toolbox": {
                            "Add": "Ajouter"
                        }
                    }
                },
            
                /**
                 * Section for translation Tool Names: both block and inline tools
                 */
                toolNames: {
                    "Text": "Texte",
                    "Heading": "En-tête",
                    "List": "Liste",
                    "Warning": "Avertissement",
                    "Checklist": "Checklist",
                    "Quote": "Citation",
                    "Code": "Code",
                    "Delimiter": "Séparateur",
                    "Raw HTML": "HTML brut",
                    "Table": "Table",
                    "Link": "Lien",
                    "Marker": "Surligneur",
                    "Bold": "Gras",
                    "Italic": "Italique",
                    "InlineCode": "Code en ligne",
                    "Underline": "Souligner"
                },
            
                /**
                 * Section for passing translations to the external tools classes
                 */
                tools: {
                    /**
                     * Each subsection is the i18n dictionary that will be passed to the corresponded plugin
                     * The name of a plugin should be equal the name you specify in the 'tool' section for that plugin
                     */
                    "warning": { // <-- 'Warning' tool will accept this dictionary section
                    "Title": "un warning",
                    "Message": "uh ?",
                    },
            
                    /**
                     * Link is the internal Inline Tool
                     */
                    "link": {
                    "Add a link": "Ajouter un lien"
                    },

                    /**
                     * The "stub" is an internal block tool, used to fit blocks that does not have the corresponded plugin
                     */
                    "stub": {
                        'The block can not be displayed correctly.': 'Le bloc n\'a pas pu s\'afficher correctement'
                    }
                },
            
                /**
                 * Section allows to translate Block Tunes
                 */
                blockTunes: {
                    /**
                     * Each subsection is the i18n dictionary that will be passed to the corresponded Block Tune plugin
                     * The name of a plugin should be equal the name you specify in the 'tunes' section for that plugin
                     *
                     * Also, there are few internal block tunes: "delete", "moveUp" and "moveDown"
                     */
                    "delete": {
                    "Delete": "Effacer"
                    },
                    "moveUp": {
                    "Move up": "Remonter"
                    },
                    "moveDown": {
                    "Move down": "Descendre"
                    }
                },
                }
            },
            onReady: () => {
                editor.focus(true)
                intervalId = setInterval(tempsDepuisDerniereSauvegarde, 60*1000);
                intervalSauvegarde = setInterval(enregistreArticle, 5*60*1000)
                console.log('Editor.js is ready to work!')
            },
            onChange: () => {
                editor.save().then((outputData) => {
                dataArticle.data = outputData
                console.log('Article data: ', outputData)
                }).catch((error) => {
                console.log('Saving failed: ', error)
                });
            },
            autofocus: true,
            data: dataTemp
        });
    })
})

onDestroy(() => {
    clearInterval(intervalId)
})

function tempsDepuisDerniereSauvegarde() {
    const temps = (new Date()).getTime()
    delta = Math.floor((temps - horaireDerniereSauvegarde)/1000/60)
}

function enregistreArticle(status=null) {
    console.log('sauvegarde !')
    if (status) {
        flagPublicationEnCours = true
        flagPublicationSucces = false
    } else {
        flagSauvegardeEnCours = true
        flagSauvegardeSucces = false
    }
    var variables = {...dataArticle}
    /*variables.illustrations = []
    dataArticle.data.blocks.forEach((block) => {
        if (block.type === 'galerie') {
            block.data.urls.forEach((url) => {
                if (url.idIllu !== 0 && url.idImage !== 0)
                {
                    variables.illustrations.push(url.idIllu)
                }
            })
        }
    })*/
    variables.banniere = dataArticle.banniere.id
    variables.user = $user.id
    variables.espace = dataArticle.espace.id
    if (status && status === "publier") {
        if (estPublie) {
            variables.published_at = null
        } else {
            variables.published_at = (new Date()).toISOString()
        }
        estPublie = !estPublie
    }
    console.log('variables article', variables)
    updateArticle(dataArticle.id, variables).then((retour)=>{
        horaireDerniereSauvegarde = (new Date()).getTime()
        listeImages($user.id, null, 4).then((listeIllustrations) => {
            if (status) {
                setTimeout(function(){ flagPublicationSucces = false; }, 5*1000);
                flagPublicationEnCours = false
                flagPublicationSucces = true
            } else {
                setTimeout(function(){ flagSauvegardeSucces = false; }, 5*1000);
                flagSauvegardeEnCours = false
                flagSauvegardeSucces = true
            }
            delta = 0
            listeIllustrations.forEach((illu) => {
                if (illu.article === null) {
                    effaceIllustration({illustrationId: illu.id, imageId: illu.media.id}).then((retourDelete) => {
                    })
                }
            })
        })
    })
}

function effacerTag(index) {
        dataArticle.tags_articles.splice(index, 1)
        dataArticle = dataArticle
    }

</script>

<svelte:body
  on:keydown={(event) => {
      if (event.ctrlKey || event.metaKey) {
        switch (String.fromCharCode(event.which).toLowerCase()) {
        case 's':
            event.preventDefault();
            enregistreArticle()
            break;
        }
    }
    }
  } />

<main class="grid grid-cols-2 text-gray-500">
{#if !flagArticleLoading}
    <div>
        <div
            class="bg-gray-900 text-gray-200 text-4xl w-720px appearance-none leading-normal px-4 pl-8 rounded-md focus:bg-gray-800 focus:outline-none"
            contenteditable="true"
            bind:innerHTML={dataArticle.titre}
        >
        </div>
        <div bind:this={editorjs} class="cadreEditeur"></div>
    </div>
    <div class="fixed w-340px ml-720px h-full p-2 border border-gray-800 rounded-md m-2 my-4 z-50 overflow-y-auto scrollbar scrollbar-thumb-bleuLBF scrollbar-track-bleuLBFTT">
        <div class="grid grid-cols-2 gap-x-1 my-3">
            <Bouton largeur="w-auto" occupe={flagSauvegardeEnCours} succes={flagSauvegardeSucces} on:actionBouton={() => enregistreArticle(null)} couleur="text-vertLBF border-vertLBF">
                <div class="flex flex-row justify-center mx-auto">
                    <Fa icon={faSave} size="lg" />
                    <div class="ml-2">Sauvegarder</div>
                </div>
            </Bouton>
            <Bouton largeur="w-auto" occupe={flagPublicationEnCours} succes={flagPublicationSucces} on:actionBouton={() => {enregistreArticle("publier")}} couleur="text-orangeLBF border-orangeLBF">
                <div class="flex flex-row justify-center">
                    <Fa icon={faNewspaper} size="lg" /> 
                    <div class="ml-2">
                        {#if estPublie}
                            Dépublier
                        {:else}
                            Publier
                        {/if}
                    </div>
                </div>
            </Bouton>
        </div>
        <hr class="ml-2 my-6 w-5/6 border-gray-700 mx-auto"/>
        <div class="mb-6">
            <div class="mb-1 text-base">
                <label for="selectEspaces" class="flex flex-row">
                    <div class="mr-2 font-medium  text-bleuLBF">Espace concerné</div>
                    <select bind:value={dataArticle.espace.id} id="selectEspaces" class="bg-gray-900 border border-bleuLBF rounded" >
                        {#each $espacesBF as espace}
                            <option value={espace.id}>
                                {espace.label}
                            </option>
                        {/each}
                    </select>
                </label>
            </div>
            <div class="mb-1 mr-2">
                <span class="font-medium text-bleuLBF">Statut :</span>
                <span>
                    {#if dataArticle.published_at === null}
                        brouillon
                    {:else}
                        publié le {dateJourMoisHeure(dataArticle.updated_at)}
                    {/if}
                </span>
            </div>
            <div class="mr-2">
                <div>
                    <span class="font-medium text-bleuLBF">Dernière sauvegarde :</span>
                    <span>il y a {delta} min.</span>
                </div>
                <div class="text-sm">(sauvegarde automatique toutes les 5 min.)</div>
            </div>
        </div>
        <div class="mb-6">
            <h5 class="text-vertLBF">Illustration de l'article</h5>
            <div class="ml-1">Utilisée en une du site</div>
            <ImageUpload
                userId = {dataArticle.user.id}
                espaceId = {dataArticle.espace.id}
                tagId = 3
                bind:idIllustration= {dataArticle.banniere.id}
                options = {optionsURL}
                altImage="bannière article"
                classImage="rounded border-2 border-vertLBF mx-auto w-300px h-150px" />
        </div>
        <div class="mb-6">
            <h5 class="text-jauneLBF">Chapeau</h5>
            <div class="ml-1">Quelques lignes décrivant le sujet de l'article. Utilisé en une du site.</div>
            <Editeur bind:contenu={dataArticle.chapeau} couleur="jaune"/>
        </div>
        <div class="mb-6">
            <h5 class="text-orangeLBF">Tags</h5>
            <div class="ml-1">Les tags sont des mots permettant de classer les articles et de faire des recherches dans la liste des articles</div>
            <AutoComplete
                items={$tagsArticlesStore}
                bind:selectedItem={newTag}
                labelFieldName="tag" 
                inputClassName="bg-gray-900 text-gray-200 focus:outline-none border border-orangeLBF rounded py-2 px-4 block w-full appearance-none leading-normal"
                hideArrow="true"
                className="my-4 w-full"
                dropdownClassName = "bg-gray-800 text-gray-500"
                />
            <div class="mx-2 flex flew-row flex-wrap justify-start">
                {#each dataArticle.tags as tag, index}
                    <div class="h-6 mx-1 my-1 p-2 rounded-full text-orangeLBF border border-orangeLBF flex flex-row items-center text-sm">
                        <div class="cursor-pointer"  on:click={() => {effacerTag(index)}}><Fa icon={faTimes} /></div>
                        <span class="ml-2 font-semibold">{tag.tag}</span>
                    </div>
                {/each}
            </div>
        </div>
        <hr class="border-gray-700 my-2 w-5/6">
    </div>
{:else}
    <Chargement><h3>Récupération de l'article, merci de patienter...</h3></Chargement>
{/if}
</main>
