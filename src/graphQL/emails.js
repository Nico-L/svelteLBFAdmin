import { requeteGraphQL } from './gql.js'

export async function envoieEmail(auth, isAdmin, variables) {
    const query = `mutation envoiMail($email: [String!]!, $template: String, $templateId: String) {
                    sendEmail(
                    from: "atelierdusappey@gmail.com"
                    to: $email
                    templateId: $templateId
                    dynamic_template_data: $template
                    ) {
                    success
                    }
                }`
    return requeteGraphQL(auth, isAdmin, query, variables)
        .then((resultats)=> {
            return resultats.sendEmail
        })
}