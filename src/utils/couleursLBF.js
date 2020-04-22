let couleur = []
couleur['LaBonneFabrique'] = '#e32e39'
couleur['LaBrasserie'] = '#fcc62d'
couleur['LespaceCoworking'] = '#4bbcc4'
couleur['Latelier'] = '#ee732e'
couleur['jardinPartage'] = '#93c021'
couleur['Autres'] = '#5e4b99'
export const objetCouleursLBF = couleur

const couleur2 = []
couleur2['rouge'] = { numCouleur: '#e32e39', espace: 'rencontre', variante: 'rouge', classText: 'text-rougeLBF' }
couleur2['jaune'] = { numCouleur: '#fcc62d', espace: 'brasserie', variante: 'jaune', classText: 'text-jauneLBF' }
couleur2['bleu'] = { numCouleur: '#4bbcc4', espace: 'coworking', variante: 'bleu', classText: 'text-bleuLBF' }
couleur2['orange'] = { numCouleur: '#ee732e', espace: 'atelier', variante: 'orange', classText: 'text-orangeLBF' }
couleur2['vert'] = { numCouleur: '#93c021', espace: 'jardin', variante: 'vert', classText: 'text-vertLBF' }
couleur2['violet'] = { numCouleur: '#5e4b99', espace: 'autre', variante: 'violet', classText: 'text-violetLBF' }
export const tableCouleursLBF = couleur2

export function hexaToPalette(codeHexa) {
      let retour = ''
      couleur2.forEach(item => {
        if (item.numCouleur === codeHexa) {
          retour = item.espace
        }
      })
      return retour
    }