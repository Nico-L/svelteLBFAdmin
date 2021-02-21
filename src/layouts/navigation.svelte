<script>
    import { Link } from "svelte-routing";
    import {user} from "../stores/user.js"
</script>

<h4 class="text-orangeLBF text-center mb-2">L'atelier</h4>
<div class="my-2 pl-2 cursor-pointer hover:bg-vertLBFT hover:text-gray-200 text-vertLBF"><Link to="/">Retour à l'accueil</Link></div>
{#if $user.role.admin || $user.role.redacteur}
    <div class="my-2 pl-2 text-xl font-semibold cursor-pointer hover:bg-rougeLBFT hover:text-gray-200 text-rougeLBF"><Link to="/redaction">Mes articles</Link></div>
{/if}

{#if $user.role.admin || $user.role.atelier}
    <h5 class="ml-2">Les ateliers</h5>
    <ul class="ml-2">
        <Link to="/ateliers/agenda"><li class="pl-2 cursor-pointer hover:bg-orangeLBFT">Agenda des ateliers</li></Link>
        <Link to="/ateliers/archives"><li class="pl-2 cursor-pointer hover:bg-orangeLBFT">Archives</li></Link>
    </ul>
    <hr class="ml-2 my-3 w-5/6 border-orangeLBFT"/>
    <h5 class="ml-2 w-5/6 ">Les machines</h5>
    <ul class="ml-2 mb-2 navi">
        <Link to="/machines/agendaReservations"><li class="pl-2 cursor-pointer hover:bg-orangeLBFT">Agenda des réservations</li></Link>
        <Link to="/machines/plagesReservations"><li class="pl-2 cursor-pointer hover:bg-orangeLBFT">Horaires de réservation</li></Link>
        <Link to="/machines/listeMachines"><li class="pl-2 cursor-pointer hover:bg-orangeLBFT">Liste des machines</li></Link>
        <Link to="/machines/nouvelleMachine"><li class="pl-2 cursor-pointer hover:bg-orangeLBFT">Nouvelle fiche machine</li></Link>
        <Link to="/machines/abonnements"><li class="pl-2 cursor-pointer hover:bg-orangeLBFT">Abonnements</li></Link>   
    </ul>
{/if}
{#if $user.role.admin}
    <hr class="ml-2 my-3 w-5/6 border-orangeLBFT"/>
    <h5 class="ml-2 w-5/6">Les utilisateurs</h5>
    <ul class="ml-2 mb-2 navi">
        <Link to="/utilisateurs/fiche"><li class="pl-2 cursor-pointer hover:bg-orangeLBFT">Fiche utilisateur</li></Link>
        <Link to="/utilisateurs/ajout"><li class="pl-2 cursor-pointer hover:bg-orangeLBFT">Creation utilisateur</li></Link>
    </ul>
{/if}


