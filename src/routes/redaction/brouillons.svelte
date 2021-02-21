<script>
import {onMount} from 'svelte';

import {user} from '../../stores/user.js'

import ListeArticles from '../../components/listeArticles.svelte'
</script>

<main class="w-720px">
    <h4 class="ml-4 mb-4 mt-0 pt-4">Liste des brouillons</h4>
    <ListeArticles estPublie = {false} />
</main>

