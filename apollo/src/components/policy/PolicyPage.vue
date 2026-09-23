<script setup lang="ts">
import {computed, type ComputedRef} from 'vue'
import {useI18n} from 'vue-i18n'
import {useRoute} from 'vue-router'
import {policyConfig} from '@/config/policy'

const {t, locale, tm, rt} = useI18n()
const route = useRoute()

/*
 * The router defines the path as `/privacy` and `/terms`. The Settings panel
 * (top-right theme + language switcher) is rendered globally by App.vue and
 * already reacts to locale changes — no extra wiring needed here.
 *
 * Maintainer-tunable values (contact email, brand owner, server location,
 * "personal project" toggle) live in `@/config/policy.ts` so they can be
 * changed without editing this file or the locale JSONs.
 */

const isTerms = computed(() => route.name === 'Terms')
const isPersonalProject = computed(() => !policyConfig.isFormalProduct)

// Page-level labels
const eyebrow: ComputedRef<string> = computed(() =>
    isTerms.value ? t('policy.terms.eyebrow') : t('policy.privacy.eyebrow')
)
const pageTitle: ComputedRef<string> = computed(() =>
    isTerms.value ? t('policy.terms.title') : t('policy.privacy.title')
)
const effectiveDate: ComputedRef<string> = computed(() =>
    isTerms.value ? t('policy.terms.effectiveDate') : t('policy.privacy.effectiveDate')
)
const version: ComputedRef<string> = computed(() =>
    isTerms.value ? t('policy.terms.version') : t('policy.privacy.version')
)
const brandLabel: ComputedRef<string> = computed(() => t('policy.brand.label'))
const brandOwner: string = policyConfig.brandOwner

// Section list comes from i18n arrays. `tm` returns the raw message,
// `rt` renders any embedded linked-message references or simple text.
const sections = computed<Array<Record<string, any>>>(() => {
    const key = isTerms.value ? 'policy.terms.sections' : 'policy.privacy.sections'
    return (tm(key) as Array<Record<string, any>>) ?? []
})

const backText: ComputedRef<string> = computed(() =>
    isTerms.value ? t('policy.terms.backToPrivacy') : t('policy.privacy.backToLogin')
)
const backTarget: ComputedRef<string> = computed(() =>
    isTerms.value ? '/privacy' : '/login'
)
const contactLead: ComputedRef<string> = computed(() =>
    isTerms.value ? t('policy.terms.contactLead') : t('policy.privacy.contactLead')
)
const tocTitle: ComputedRef<string> = computed(() => t('policy.tocTitle'))
const footerNote: ComputedRef<string> = computed(() =>
    isTerms.value ? t('policy.terms.footerNote') : t('policy.privacy.footerNote')
)
const contactEmail: string = policyConfig.contactEmail
const contactMailHref = computed(() => `mailto:${contactEmail}`)

// Personal-project disclaimer (only when policyConfig.isFormalProduct is false)
const personalProjectTitle: ComputedRef<string> = computed(() =>
    t('policy.personalProject.title')
)
const personalProjectBody: ComputedRef<string> = computed(() =>
    t('policy.personalProject.body')
)

// Data-retention caveat for §6 of the privacy policy
const dataRetentionCaveat: ComputedRef<string> = computed(() =>
    t('policy.privacy.dataRetention.caveat')
)

// Whether the current section is the contact section; if so, render the
// mailto link dynamically so the email lives in exactly one place.
function isContactSection(section: Record<string, any>): boolean {
    return section.id === 'contact'
}
</script>

<template>
  <div class="jus-apollo-policy-page">
    <article class="jus-apollo-policy-card" :lang="locale">
      <header class="jus-apollo-policy-header">
        <span class="jus-apollo-policy-eyebrow">{{ eyebrow }}</span>
        <h1 class="jus-apollo-policy-title">{{ pageTitle }}</h1>
        <div class="jus-apollo-policy-meta">
          <span class="jus-apollo-policy-meta-item">
            <strong>{{ brandLabel }}</strong> · {{ brandOwner }}
          </span>
          <span class="jus-apollo-policy-meta-item">
            {{ t('policy.meta.effective') }}: {{ effectiveDate }}
          </span>
          <span class="jus-apollo-policy-meta-item">
            {{ t('policy.meta.version') }}: {{ version }}
          </span>
        </div>
      </header>

      <aside
          v-if="isPersonalProject"
          class="jus-apollo-policy-callout jus-apollo-policy-callout--warning"
          role="note"
      >
        <strong>{{ personalProjectTitle }}</strong>
        <span>{{ personalProjectBody }}</span>
      </aside>

      <nav class="jus-apollo-policy-toc" :aria-label="tocTitle">
        <span class="jus-apollo-policy-toc-title">{{ tocTitle }}</span>
        <ul class="jus-apollo-policy-toc-list">
          <li v-for="section in sections" :key="section.id">
            <a :href="`#${section.id}`">{{ section.heading }}</a>
          </li>
        </ul>
      </nav>

      <section
          v-for="section in sections"
          :key="section.id"
          :id="section.id"
          class="jus-apollo-policy-section"
      >
        <h2>{{ section.heading }}</h2>

        <p v-if="section.body">{{ rt(section.body) }}</p>

        <!-- §6 of Privacy Policy: best-effort retention disclaimer -->
        <p
            v-if="section.id === 'data-retention'"
            class="jus-apollo-policy-callout"
        >
          {{ dataRetentionCaveat }}
        </p>

        <p v-if="section.callout" class="jus-apollo-policy-callout">{{ rt(section.callout) }}</p>

        <ul v-if="section.list">
          <li v-for="(item, idx) in section.list" :key="idx">{{ rt(item) }}</li>
        </ul>

        <h3 v-if="section.subheading">{{ section.subheading }}</h3>

        <ol v-if="section.orderedList" class="jus-apollo-policy-section-list">
          <li v-for="(item, idx) in section.orderedList" :key="idx">{{ rt(item) }}</li>
        </ol>

        <!-- Static link from locale (e.g. Google's policy URL) -->
        <p v-if="section.link && !isContactSection(section)">
          <a :href="section.link.href" target="_blank" rel="noopener noreferrer">
            {{ rt(section.link.label) }}
          </a>
        </p>

        <!-- Dynamic contact link, sourced from policyConfig -->
        <p v-if="isContactSection(section)">
          <a :href="contactMailHref">{{ contactEmail }}</a>
        </p>
      </section>

      <footer class="jus-apollo-policy-footer">
        <span>
          {{ t('policy.footer.contact') }}:
          <a :href="contactMailHref">{{ contactEmail }}</a>
          <span v-if="contactLead"> · {{ contactLead }}</span>
        </span>
        <span class="jus-apollo-policy-footer-actions">
          <router-link :to="backTarget">{{ backText }}</router-link>
          <router-link v-if="!isTerms" to="/terms">{{ t('policy.seeAlsoTerms') }}</router-link>
          <router-link v-else to="/privacy">{{ t('policy.seeAlsoPrivacy') }}</router-link>
        </span>
        <span class="jus-apollo-policy-footer-note">{{ footerNote }}</span>
      </footer>
    </article>
  </div>
</template>

<style scoped>
@import "@/assets/css/policy/index.css";
</style>
