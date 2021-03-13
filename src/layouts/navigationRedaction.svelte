<script>
    import { Link } from "svelte-routing";

    import Dialog from '../components/Dialog.svelte';
    import Bouton from '../components/Button/Button.svelte';

    import Fa from 'svelte-fa'
    import { faSave } from '@fortawesome/free-regular-svg-icons'
    import { faArrowLeft } from '@fortawesome/free-solid-svg-icons'

    import {espacesBF} from '../stores/espacesBF.js'
    import {user} from '../stores/user.js'

    import {saveArticle} from '../strapi/articles.js'

    var showNouvelArticle = false
    var flagSauvegardeEnCours = false
    var flagSauvegardeSucces = false

    var dataArticle = {
        titre: "",
        espace: 2,
    }
    const optionsURL= {
        'resizing_type': 'fill',
        'width': 400,
        'height': 180,
        'gravity': 'ce'
    }

    function enregistreArticle() {
        flagSauvegardeEnCours = true
        flagSauvegardeSucces = false
        let variables = {
            titre: dataArticle.titre,
            user: $user.id,
            espace: dataArticle.espace,
            banniere: 33,
            published_at: null
        }
        saveArticle(variables).then((retour) => {
            flagSauvegardeEnCours = false
            flagSauvegardeSucces = true
            showNouvelArticle = false
            window.location.assign(window.location.origin + '/redaction/editeur?id=' + retour.id)
        })
    }
</script>

<div class="text-gray-400">
    <img src="/img/logos/logoHBlanc.svg" class="h-16 my-auto mt-4" alt="logo Bonne Fabrique">
    <h4 class="text-orangeLBF text-center mb-2 mt-4">Espace articles</h4>
    <div class="my-4 pl-2 cursor-pointer hover:bg-vertLBFT hover:text-gray-200 text-vertLBF"><Link to="/">Retour à l'accueil</Link></div>
    <hr class="ml-2 my-3 w-5/6 border-vertLBFT"/>
    <h5 class="ml-2">Mes articles</h5>
    <ul class="ml-2">
        <li on:click={() => {showNouvelArticle = true}} class="pl-2 cursor-pointer hover:bg-orangeLBFT">Nouvel article</li>
        <Link to="/redaction/brouillons"><li class="pl-2 cursor-pointer hover:bg-orangeLBFT">Brouillons</li></Link>
        <Link to="/redaction/articles"><li class="pl-2 cursor-pointer hover:bg-orangeLBFT">Articles publiés</li></Link>
    </ul>
    <hr class="ml-2 my-3 w-5/6 border-orangeLBFT"/>
    <h5 class="ml-2">Mes médias</h5>
    <ul class="ml-2">
        <Link to="/redaction/images"><li class="pl-2 cursor-pointer hover:bg-orangeLBFT">Mes images</li></Link>
        <Link to="/redaction/fichier"><li class="pl-2 cursor-pointer hover:bg-orangeLBFT">Mes fichiers</li></Link>
    </ul>
    {#if $user.role.admin}
        <hr class="ml-2 my-3 w-5/6 border-jauneLBFT"/>
        <h5 class="ml-2 w-5/6">Gestion tags</h5>
        <ul class="ml-2 mb-2 navi">
            <Link to="/redaction/tags"><li class="pl-2 cursor-pointer hover:bg-orangeLBFT">liste tags</li></Link>
        </ul>
    {/if}
</div>

<Dialog bind:visible={showNouvelArticle} on:close={() => showNouvelArticle = false}>
    <h4 class="mx-auto">Création d'un nouvel article</h4>
    <hr class="ml-2 my-3 border-vertLBFT"/>
    <div class="mb-6">
        <label for="titre">
            <h5 class="text-bleuLBF">Titre</h5>
            <input 
                bind:value= {dataArticle.titre}
                class="bg-gray-900 text-gray-200 focus:outline-none border border-bleuLBF rounded py-2 px-4 block w-full appearance-none leading-normal"
                type="text"
                id="titre"
                />
        </label>
        <div class="ml-3">Quelques mots accrocheurs pour attirer le lecteur.</div>
    </div>
    <label for="selectEspaces" class="mb-6 flex flex-row">
        <div class="mr-2 text-base font-medium  text-bleuLBF">Espace concerné</div>
        <select bind:value={dataArticle.espace} id="selectEspaces" class="bg-gray-900 border border-bleuLBF rounded" >
		{#each $espacesBF as espace}
			<option value={espace.id}>
				{espace.label}
			</option>
		{/each}
	    </select>
    </label>

    <div slot="actions">
        <Bouton on:actionBouton={() => showNouvelArticle = false} largeur="w-12" couleur="text-bleuLBF border-bleuLBF">
            <Fa icon={faArrowLeft} size="lg"  class="mx-auto" />
        </Bouton>
        <Bouton bind:occupe={flagSauvegardeEnCours} bind:succes={flagSauvegardeSucces} on:actionBouton={enregistreArticle} largeur="w-12" couleur="text-vertLBF border-vertLBF">
            <Fa icon={faSave} size="lg" class="mx-auto" />
        </Bouton>
  </div>
</Dialog>
