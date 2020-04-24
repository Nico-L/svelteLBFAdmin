
<script>
    import { buildNeeded } from "./../stores/build.js"
    import {buildSiteAtelier} from './../utils/updateNetlify.js'

    function lanceConstruction() {
        console.log('bob ?')
        buildSiteAtelier()
        buildNeeded.set(false)
    }

    $: console.log('buildNeeded', $buildNeeded)
</script>

<div class="p-2 flex flex-row">
<img src="/img/logos/logoHBlanc.svg" class="h-16 my-auto mr-12" alt="logo Bonne Fabrique">
<img src="/img/logos/logoRencontre.svg" class="h-16 my-auto mr-6" alt="logo espace atelier">
<img src="/img/logos/logoCowork.svg" class="h-16 my-auto mr-6" alt="logo espace atelier">
<img src="/img/logos/logoBrasserie.svg" class="h-16 my-auto mr-6" alt="logo espace atelier">
<img src="/img/logos/logoAtelier.svg" class="h-16 my-auto mr-6" alt="logo espace atelier">
<img src="/img/logos/logoJardin.svg" class="h-16 my-auto mr-6" alt="logo espace atelier">
<div class="h-12 my-2">
        {#if $buildNeeded} 
            <div class="border-2 rounded border-rougeLBF hover:bg-rougeLBF w-16 h-12 cursor-pointer cadreSpinner" on:click={lanceConstruction}>
                <div class="spinner">
                    <div class="dot1"></div>
                    <div class="dot2"></div>
                </div>
            </div>
        {/if}
    </div>
</div>