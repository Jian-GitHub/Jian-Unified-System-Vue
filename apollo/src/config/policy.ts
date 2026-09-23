/**
 * Apollo · policy & legal configuration.
 *
 * Centralizes maintainer-tunable, language-independent values that
 * the Privacy Policy and Terms of Service pages reference at runtime.
 * Anything that should be formatted per language stays in the locale
 * files instead — this module only holds single-source-of-truth
 * values like the contact address and brand owner.
 *
 * Edit this file to change where the maintainer can be reached, or
 * to flip Apollo from a personal / preview project to a formal
 * commercial product (which hides the personal-project disclaimer
 * callout on the policy pages).
 */

export interface PolicyConfig {
    /** Single point of contact for privacy & legal matters. */
    contactEmail: string

    /**
     * Brand owner shown in the policy header. For a personal project
     * this is typically the maintainer's name; for a corporate
     * project it would be the legal entity name.
     */
    brandOwner: string

    /**
     * When false, the policy pages render a prominent callout
     * stating that Apollo is a personal project under active
     * development, comes with no SLA, and may not honor the
     * data-retention and deletion timelines stated in the policy.
     */
    isFormalProduct: boolean

    /**
     * Factual description of where Apollo's primary servers run.
     * Surfaced in the international-transfers section of the
     * Privacy Policy via a `{serverLocation}` placeholder.
     */
    serverLocation: string
}

export const policyConfig: PolicyConfig = {
    contactEmail: 'e.jianqi@gmail.com',
    brandOwner: 'Jian Qi',
    isFormalProduct: false,
    serverLocation: 'a single region',
}
