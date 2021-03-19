<script>
import ListeAteliers from '../components/listeAteliersFuturs.svelte'
import ListeReservationsMachines from '../components/listeReservationsMachines.svelte'
import {user} from "../stores/user.js"

$: { if ($user && $user.role.redacteur) {
    window.location.replace(window.location.origin + "/redaction")
}

} 

</script>

<main>
	<h3>5 prochains ateliers</h3>
    <ListeAteliers limiteNbAteliers="5"/>
    <h3 class="mt-10">5 prochaines réservations</h3>
    <ListeReservationsMachines limiteNbReservations="5"/>
</main>

