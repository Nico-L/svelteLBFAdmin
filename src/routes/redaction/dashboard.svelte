<script>
import {onMount} from 'svelte';

import {user} from '../../stores/user.js'

import ListeArticles from '../../components/listeArticles.svelte'

const limiteNbArticles = 5

</script>

<main class="w-720px">
    <h4 class="ml-4 mb-4 mt-0 pt-4">Liste des {limiteNbArticles} derniers brouillons</h4>
    <ListeArticles estPublie = {false} limiteNbArticles={limiteNbArticles} />
    <h4 class="ml-4 mb-4 mt-4 pt-4">Liste des {limiteNbArticles} derniers articles publiés</h4>
    <ListeArticles estPublie = {true} limiteNbArticles={limiteNbArticles} couleur="vert" />
</main>