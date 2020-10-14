export const dateFr = {
    mois: [
    ["janvier", "jan."],
    ["février", "fév."],
    ["mars", "mars"],
    ["avril", "avr."],
    ["mai", "mai"],
    ["juin", "juin"],
    ["juillet", "juil."],
    ["août", "août"],
    ["septembre", "sept."],
    ["octobre", "oct."],
    ["novembre", "nov."],
    ["décembre", "déc."]
],
jours: [
    ["dimanche", "dim."],
    ["lundi", "lun."],
    ["mardi", "mar."],
    ["mercredi", "mer."],
    ["jeudi", "jeu."],
    ["vendredi", "ven."],
    ["samedi", "sam."]
]
}

export function getHoraire(value){
    var d = value.split(':');
    return d[0] + "h" + d[1];
}

export function getJour(value){
    var d = new Date(value)
    return d.getDate();
}

export function getMoisShort(value) {
    var d = (new Date(value)).getMonth();
    return dateFr.mois[d][1];
}

export function dateInscription(debut, fin) {
    var leDebut = new Date(debut)
    var laFin = new Date(fin)
    var leJour = (new Date(debut)).getDate();
    var leJourSemaine = dateFr.jours[(new Date(debut)).getDay()][0];
    var leMois = dateFr.mois[(new Date(debut)).getMonth()][0]
    var minuteDebut = leDebut.getMinutes() == 0 ? '00': leDebut.getMinutes();
    var minuteFin = laFin.getMinutes() == 0 ? '00': laFin.getMinutes();
    return 'le ' + leJourSemaine + ' ' + leJour + ' ' + leMois + ' de ' + leDebut.getHours() + 'h' + minuteDebut + ' à ' + laFin.getHours() + 'h' + minuteFin;
}

export function dateLisible(date, debut, fin) {
    var leJour = (new Date(date)).getDate();
    var leJourSemaine = dateFr.jours[(new Date(date)).getDay()][0];
    var leMois = dateFr.mois[(new Date(date)).getMonth()][0]
    const horaireDebut = debut.split(':')
    const horaireFin = fin.split(':')
    return 'le ' + leJourSemaine + ' ' + leJour + ' ' + leMois + ' de ' + horaireDebut[0] + 'h' + horaireDebut[1] + ' à ' + horaireFin[0] + 'h' + horaireFin[1];
}

export function setDate(date, horaire) {
    const horaireSplit = horaire.split(':')
    var laDate = new Date(date)
    laDate.setHours(horaireSplit[0])
    laDate.setMinutes(horaireSplit[1])
    return laDate
}