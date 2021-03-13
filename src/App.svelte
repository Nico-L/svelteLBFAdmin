<script context="module">
  import { register } from 'svelte-loadable'
    // not found

    const notFound = register ({
        loader: () => import('./routes/notFound.svelte'),
        resolve: () => './notFound'
    })

    const tagsArticles = register ({
        loader: () => import('./routes/redaction/tags.svelte'),
        resolve: () => './tags'
    })

    const articles = register ({
        loader: () => import('./routes/redaction/articles.svelte'),
        resolve: () => './articles'
    })

    const brouillons = register ({
        loader: () => import('./routes/redaction/brouillons.svelte'),
        resolve: () => './brouillons'
    })

    const editeur = register ({
        loader: () => import('./routes/redaction/editeur.svelte'),
        resolve: () => './editeur'
    })

    const redaction = register ({
        loader: () => import('./routes/redaction/dashboard.svelte'),
        resolve: () => './redaction'
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

    import {listeEspacesBF, listeTags} from './strapi/espacesEtTags.js'
    import {getTagsArticles} from './strapi/tagsArticles.js'
    import {verifJWT} from './strapi/verifJWT.js'
    import {listeRoles} from './strapi/users.js'

    import { roles } from './stores/roles.js'
    import { user } from "./stores/user.js"
    import { espacesBF } from "./stores/espacesBF.js"
    import {tags} from "./stores/tags.js"
    import {tagsArticlesStore} from "./stores/tagsArticles.js"
    import { buildNeeded } from "./stores/build.js"

    import Header from './layouts/header.svelte'
    import Navigation from "./layouts/navigation.svelte"
    import NavigationRedaction from "./layouts/navigationRedaction.svelte"

    var loginNeeded = true
    var flagEspace = false
    var flagTags = false
    var flagTagsArticles = false
    var flagBuildNeeded = false
    var flagRoles = false

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

$: {
    if (!loginNeeded && $tagsArticlesStore && !flagTagsArticles) {
        getTagsArticles().then((tagsArticles) => {
            tagsArticlesStore.set(tagsArticles)
            flagTagsArticles = true
        })
    }
}

$: {
    if (!loginNeeded && !flagRoles) {
        listeRoles().then((retour) => {
            var lesRoles = []
            retour.roles.forEach((role) => {
                if (role.type !== "authenticated" && role.type !== "site" && role.type !== "public") {
                    lesRoles.push(role)
                }
                if (role.type === "authenticated") {
                    role.type = "aucun"
                    lesRoles.push(role)
                }
            })
            roles.set(lesRoles)
            flagRoles = true
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
        {#await verifJWT() then value}
            <Route path="/">
                <div class="fixed w-full h-20 p-22 flex flex-row bg-gray-900 z-20">
                    <Header />
                </div>
                <div class="fixed w-240px h-full bg-gray-900 mt-20 z-20">
                    <Navigation />
                </div>
                <div class="ml-240px p-4 pt-20">
                    <Loadable loader="{HomeLoader}" />   
                </div>
            </Route>
            {#if $user.role.admin }
                <Route path="utilisateurs/*">
                    <div class="fixed w-full h-20 p-22 flex flex-row bg-gray-900 z-20">
                        <Header />
                    </div>
                    <div class="fixed w-240px h-full bg-gray-900 mt-20 z-20">
                        <Navigation />
                    </div>
                    <div class="ml-240px p-4 pt-20">
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
                    </div>
                </Route>
            {/if}
            <Route path="ateliers/*">
                <div class="fixed w-full h-20 p-22 flex flex-row bg-gray-900 z-20">
                    <Header />
                </div>
                <div class="fixed w-240px h-full bg-gray-900 mt-20 z-20">
                    <Navigation />
                </div>
                <div class="ml-240px p-4 pt-20">
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
                </div>
            </Route>
            <Route path="machines/*">
                <div class="fixed w-full h-20 p-22 flex flex-row bg-gray-900 z-20">
                    <Header />
                </div>
                <div class="fixed w-240px h-full bg-gray-900 mt-20 z-20">
                    <Navigation />
                </div>
                <div class="ml-240px p-4 pt-20">
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
                </div>
            </Route>
            <Route path="redaction/*">
                <div class="fixed w-240px h-full bg-bleuLBFTT z-50">
                    <NavigationRedaction />
                </div>
                <div class="ml-240px z-30">
                    <Router>
                        <Route path="" >
                            <Loadable loader={redaction} />
                        </Route>
                        <Route path="editeur">
                            <Loadable loader={editeur} />
                        </Route>
                        <Route path="brouillons">
                            <Loadable loader={brouillons} />
                        </Route>
                        <Route path="articles">
                            <Loadable loader={articles} />
                        </Route>
                        <Route path="tags">
                            <Loadable loader={tagsArticles} />
                        </Route>
                    </Router>
                </div>
            </Route>
            <Route>
                <div class="fixed w-full h-20 p-22 flex flex-row bg-gray-900 z-20">
                    <Header />
                </div>
                <div class="fixed w-240px h-full bg-gray-900 mt-20 z-20">
                    <Navigation />
                </div>
                <div class="ml-240px p-4 pt-20">
                    <Loadable loader={notFound}>
                    </Loadable>
                </div>
            </Route>
        {/await}
    {/if}

</Router>