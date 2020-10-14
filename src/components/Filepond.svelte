<script>
    import {onMount, onDestroy, createEventDispatcher} from 'svelte'
    const dispatch = createEventDispatcher();
    //import {createCloudinary} from './../utils/cloudinary.js'
    import {strapiUpload} from './../strapi/strapiImagesServer.js'
    import {verifJWT} from './../strapi/verifJWT.js'
    import FilePond from 'filepond'
    //console.log("fp", FilePond)

    let inputElement;
    var pond;
    export let data = ""

    function onProcessFile(error, file) {
        console.log('terminé !', pond)
        /*dispatch('uploadDone', {
                fileProps: {idImage: file.serverId, format: file.fileExtension}
            });*/
        dispatch('uploadDone');
        pond.removeFile();
    }

    onMount(async () => {
        verifJWT().then((token) => {
            pond = FilePond.create( inputElement, {
                server: strapiUpload(token, data),
                onprocessfile: onProcessFile,
                labelIdle: 'Déposez vos fichiers ou <span class="filepond--label-action"> cliquez </span>',
                labelFileProcessing: 'Téléversement en cours',
                labelTapToCancel: 'Cliquez sur le cercle pour annuler',
                labelFileProcessingComplete: 'Téléversement terminé',
                labelFileLoadError: 'Un problème est survenu',
                labelTapToRetry: 'Cliquez sur le cercle pour essayer à nouveau'
            } );
        })
    })

    onDestroy(() => {
        pond.destroy()
    })

</script>

<div>
    <input type="file" bind:this={inputElement}>
</div>
