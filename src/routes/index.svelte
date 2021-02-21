<script>
import ListeAteliers from '../components/listeAteliersFuturs.svelte'
import ListeReservationsMachines from '../components/listeReservationsMachines.svelte'
</script>

<main>
	<h3>5 prochains ateliers</h3>
    <ListeAteliers limiteNbAteliers="5"/>
    <h3 class="mt-10">5 prochaines réservations</h3>
    <ListeReservationsMachines limiteNbReservations="5"/>
</main>

