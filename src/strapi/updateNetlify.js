export function buildSiteAtelier() {
    const url = "https://api.netlify.com/build_hooks/634559843dcbda3f09bc9689"
    var options = { 
        method: 'POST',
        mode: 'cors',
        cache: 'default',
    }
    return fetch(url, options)
}