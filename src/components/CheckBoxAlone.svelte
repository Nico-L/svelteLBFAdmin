<script>
import { createEventDispatcher } from "svelte";
const dispatch = createEventDispatcher();
import Fa from 'svelte-fa'
import { faSquare, faCheckSquare } from '@fortawesome/free-regular-svg-icons'

export let checked=false;
export let cbClasses="";
export let label=""
function check() {
    checked != checked
    dispatch('change', !checked);
}
</script>

<div on:click={check} class={cbClasses + " w-8 flex justify-center"}>
    <label for={label}>
            <input bind:checked class="hidden" type="checkbox" id={label}/>
            <div class="mx-auto">
                {#if checked}
                    <Fa icon={faCheckSquare} size="lg" />
                {:else}
                    <Fa icon={faSquare} size="lg" />
                {/if}
            </div>
    </label>
</div>