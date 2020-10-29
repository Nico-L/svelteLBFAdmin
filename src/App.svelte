<script context="module">
  import { register } from 'svelte-loadable'
    // not found

    const notFound = register ({
        loader: () => import('./routes/notFound.svelte'),
        resolve: () => './ficheUtilisateur'
    })
  // user
  const ficheUtilisateur = register ({
    loader: () => import('./routes/utilisateurs/ficheUtilisateur.svelte'),
    resolve: () => './ficheUtilisateur'
  })

  const ajoutUtilisateur = register ({
      loader: () => import('./routes/utilisateurs/ajoutUtilisateur.svelte'),
      resolve: () => './ajoutUtilisateur'
  })
  // Loaders must be registered outside of the render tree.
    const oubliMDP = register({
        loader: () => import('./routes/login/oubliMDP.svelte'),
        resolve: () => './oubliMDP'
    })

  const resetMDP = register({
    loader: () => import('./routes/login/resetMDP.svelte'),
    resolve: () => './resetMDP'
  })
  const login = register({
    loader: () => import('./routes/login/index.svelte'),
    resolve: () => './login'
  })
  const agendaAteliers = register({
    loader: () => import('./routes/ateliers/agenda.svelte'),
    resolve: () => './agendaAteliers'
  })
  const archivesAteliers = register({
    loader: () => import('./routes/ateliers/archives.svelte'),
    resolve: () => './archivesAteliers'
  })
  const abonnementsMachines = register({
      loader: () => import('./routes/machines/abonnements.svelte'),
      resolve: ()=> './machines/abonnements'
  })
  const plagesReservations = register({
      loader: () => import('./routes/machines/plagesHoraires.svelte'),
      resolve:()=> './machines/plagesHoraires'
  })
  const agendaReservations = register({
      loader: () => import('./routes/machines/agendaReservations.svelte'),
      resolve: ()=> './machines/agendaReservations'
  })

  const nouvelleMachine = register({
      loader: () => import('./routes/machines/nouvelleMachine.svelte'),
      resolve: () => './machines/nouvelleMachine'
  })
  
const listeMachines = register({
    loader: () => import('./routes/machines/listeMachines.svelte'),
    resolve: () => './machines/listeMachines'
})

  const HomeLoader = register({
    loader: () => import('./routes/index.svelte'),
    resolve: () => './'
  })

</script>

<script>
    import { Router, Link, Route, navigate } from "svelte-routing";
    import Loadable from 'svelte-loadable'
    import Chargement from './components/chargement.svelte'

    //import { listeEspacesBF } from './graphQL/espacesBF.js'
    import {listeEspacesBF, listeTags} from './strapi/espacesEtTags.js'
    //import { getBuildNeeded, setBuildNeeded } from './graphQL/build.js'

    //import { auth } from "./stores/auth.js"
    import { user } from "./stores/user.js"
    import { espacesBF } from "./stores/espacesBF.js"
    import {tags} from "./stores/tags.js"
    import { buildNeeded } from "./stores/build.js"

    import Header from './layouts/header.svelte'
    import Navigation from "./layouts/navigation.svelte"
    var loginNeeded = true
    var flagEspace = false
    var flagTags = false
    var flagBuildNeeded = false


    $: {
        const userInfo = JSON.parse(localStorage.getItem('userInfo'))
        if (userInfo) {
            user.set(userInfo)
            loginNeeded = false
        } else {
            const pathName = window.location.pathname
            if (pathName!=="/login" && pathName!=="/login/oubliMDP" && pathName!=="/login/resetMDP") {
                window.location.replace(window.location.origin + '/login')
            }
        }
    }

$: if ($user && $espacesBF && !flagEspace) {
        listeEspacesBF().then((retour )=>{
        var listeEspaces = []
        retour.forEach((valeur) => {
            listeEspaces.push({id: valeur.id, label: valeur.espace, value: valeur.espace})
        })
        espacesBF.set(listeEspaces)
        flagEspace = true
    })
    }

$: {
    if (!loginNeeded && $tags && !flagTags) {
        listeTags().then((lesTags)=>{
            tags.set(lesTags)
            flagTags = true
        })
    }
}
</script> 
 
<Router>
    {#if loginNeeded}
        <Route path="login/*">
            <Router>
                <Route path="/">
                    <Loadable loader={login} >
                        <div slot="loading">
                            <Chargement />
                        </div>
                    </Loadable>
                </Route>
                <Route path="resetMDP">
                    <Loadable loader={resetMDP}>
                        <div slot="loading">
                            <Chargement />
                        </div>
                    </Loadable>
                </Route>
                <Route path="oubliMDP">
                    <Loadable loader={oubliMDP}>
                        <div slot="loading">
                            <Chargement />
                        </div>
                    </Loadable>
                </Route>
            </Router>
        </Route>
    {:else}
        <div class="fixed w-full h-20 p-22 flex flex-row bg-gray-900 z-20">
            <Header />
        </div>
        <div class="fixed w-240px h-full bg-gray-900 mt-20 z-20">
            <Navigation />
        </div>
        <div class="ml-240px p-4 pt-20">
            <Route path="/">
                <Loadable loader="{HomeLoader}">
                    
                </Loadable>
            </Route>
            {#if $user.role.admin }
            <Route path="utilisateurs/*">
                <Router>
                    <Route path="fiche">
                        <Loadable loader={ficheUtilisateur}>
                        
                        </Loadable>
                    </Route>
                </Router>
                <Router>
                    <Route path="ajout">
                        <Loadable loader={ajoutUtilisateur}>
                        
                        </Loadable>
                    </Route>
                </Router>
            </Route>
        {/if}
            <Route path="ateliers/*">
                <Router>
                    <Route path="agenda" >
                        <Loadable loader={agendaAteliers}>
                            
                        </Loadable>
                    </Route>
                    <Route path="archives" >
                        <Loadable loader={archivesAteliers}>
                            
                        </Loadable>
                    </Route>
                </Router>
            </Route>
            <Route path="machines/*">
                <Router>
                    <Route path="abonnements" >
                        <Loadable loader={abonnementsMachines}>
                            
                        </Loadable>
                    </Route>
                    <Route path="plagesReservations" >
                        <Loadable loader={plagesReservations}>
                            
                        </Loadable>
                    </Route>
                    <Route path="agendaReservations" >
                        <Loadable loader={agendaReservations}>
                            
                        </Loadable>
                    </Route>
                    <Route path="nouvelleMachine" >
                        <Loadable loader={nouvelleMachine}>
                            
                        </Loadable>
                    </Route>
                    <Route path="listeMachines" >
                        <Loadable loader={listeMachines}>
                            
                        </Loadable>
                    </Route>
                </Router>
            </Route>
            <Route>
                <Loadable loader={notFound}>
                    
                </Loadable>
            </Route>
        </div>
    {/if}

</Router>