<script>
    import { Link } from "svelte-routing";
    import Bouton from '../../components/Button/Button.svelte';
    import Fa from 'svelte-fa'
    import { faSignInAlt } from '@fortawesome/free-solid-svg-icons'
    import { user } from "../../stores/user.js"

    var email = ""
    var mdp = ""
    var occupe = false
    var succes = false
    var erreur = "text-gray-400"
    var message = "Merci de vous identifier."

    function login() {
        if (email==="" || mdp==="") {
            return
        }
        occupe = true
        succes = false
        var entetes = new Headers({"content-type": "application/json"});
        var options = { 
            method: 'POST',
            headers: entetes,
            mode: 'cors',
            cache: 'default',
            body: JSON.stringify({
                identifier: email,
                password: mdp
            })
        };
        fetch('https://cms.labonnefabrique.fr/auth/local', options)
            .then((retour)=>
                retour.json().then((retour2)=> {
                    occupe = false
                    if (retour2.jwt && retour2.user) {
                        succes = true
                        var userTemp = {}
                        userTemp.id = retour2.user.id
                        userTemp.username = retour2.user.username
                        userTemp.email = retour2.user.email
                        userTemp.role = {
                            admin: retour2.user.role.type==="admin",
                            atelier: retour2.user.role.type==="atelier",
                            aucun: retour2.user.role.type==="authenticated"
                        }
                        userTemp.jwt = retour2.jwt
                        localStorage.setItem('userInfo', JSON.stringify(userTemp))
                        window.location.replace(window.location.origin)
                    } else {
                        if (retour2.data[0].messages[0].id==="Auth.form.error.invalid") {
                            message = "Email ou mot de passe invalide. Veuillez vérifier."
                            erreur = "text-orangeLBF"
                        }
                    }
                })
            )
    }

    function handleKeydown(event) {
		if (event.keyCode === 13) {
            login()
        }
	}
</script>

<svelte:window on:keydown={handleKeydown}/>

<main>
    <div class="w-200px border border-bleuLBF rounded-md mx-auto mt-12 p-2">
        <img src="/img/logos/logoHexagoneSeul.svg" class="mx-auto my-2 h-32 w-32" alt="logo Bonne Fabrique">
        <div class={"mb-2 text-justify text-sm " + erreur}>{message}</div>
        <input 
            class="text-sm mb-2 bg-gray-900 text-gray-400 focus:outline-none border border-bleuLBFT rounded py-1 px-2 block w-full appearance-none leading-normal"
            type="text"
            id="identifiant"
            placeholder="email"
            bind:value={email}
            />
        <input 
            class="text-sm mb-1 bg-gray-900 text-gray-400 focus:outline-none border border-bleuLBFT rounded py-1 px-2 block w-full appearance-none leading-normal"
            type="password"
            id="motDePasse"
            placeholder="mot de passe"
            bind:value={mdp}
            />
        <div class="text-right mt-2">
            <Bouton
                occupe={occupe}
                succes = {succes}
                border="border-1"
                largeur="w-full"
                couleur="text-bleuLBF border-bleuLBF"
                on:actionBouton={() => {login()}}>
                <div class="mx-auto flex flex-row justify-center">
                    <div class="px-1 self-center">S'identifier</div>
                    <div class="px-1 self-center"><Fa icon={faSignInAlt} size="lg" class="mx-auto" /></div>
                </div>
            </Bouton>
            <div class="text-sm text-gray-400 mt-2">
                <Link to="/login/oubliMDP">Mot de passe oublié ?</Link>
            </div>
        </div>
    </div>
</main>