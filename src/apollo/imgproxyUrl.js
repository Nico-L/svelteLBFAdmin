import { requeteGraphQL } from './gql.js'

export function imgproxyURL(url, options) {
    console.log('url initiale', url)
    const variables = {
        url: url,
        resizing_type: options.resizing_type,
        width: options.width.toString(),
        height: options.height.toString(),
        gravity: options.gravity
    }
    const query = `
        query getImgproxyUrl($url: String!, $resizing_type: String!, $width: String!, $height: String!, $gravity: String!) 
            {
            imgproxyURL (
                url: $url,
                resizing_type: $resizing_type,
                width: $width,
                height: $height,
                gravity: $gravity) {
                imgproxyURL
            }
            }
    `
    return requeteGraphQL(query, variables)
        .then((resultats)=> {
            return resultats.imgproxyURL
        })
}