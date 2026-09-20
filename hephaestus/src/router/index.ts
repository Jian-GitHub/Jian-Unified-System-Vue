import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router'
import { redirectToApollo } from '@/api/apollo'
import { useSessionStore } from '@/store/session'

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    redirect: '/dashboard',
  },
  {
    path: '/login',
    name: 'login',
    // Legacy links are handled by the guard; this subsystem has no login view.
    redirect: (to) => ({ path: '/dashboard', query: to.query }),
    meta: { public: true, layout: 'minimal' },
  },
  { path: '/auth/error', name: 'auth-error', component: () => import('@/pages/auth/AuthErrorPage.vue'), meta: { public: true, layout: 'minimal' } },
  {
    path: '/invoice',
    name: 'invoice',
    component: () => import('@/pages/invoice/InvoiceMakerPage.vue'),
    meta: { public: true, layout: 'invoice' },
  },
  {
    path: '/invoice/saved',
    name: 'invoice-saved',
    component: () => import('@/pages/invoice/InvoiceListPage.vue'),
    meta: { requiresAuth: true, layout: 'invoice' },
  },
  {
    path: '/invoice/issuer',
    name: 'invoice-issuer',
    component: () => import('@/pages/invoice/InvoiceIssuerPage.vue'),
    meta: { requiresAuth: true, layout: 'invoice' },
  },
  {
    path: '/dashboard',
    name: 'dashboard',
    component: () => import('@/pages/dashboard/DashboardPage.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/records',
    name: 'records',
    component: () => import('@/pages/records/RecordsListPage.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/records/new',
    name: 'record-new',
    component: () => import('@/pages/records/RecordEditPage.vue'),
    meta: { requiresAuth: true, mode: 'create' },
  },
  {
    path: '/records/:id',
    name: 'record-edit',
    component: () => import('@/pages/records/RecordEditPage.vue'),
    meta: { requiresAuth: true, mode: 'edit' },
  },
  {
    path: '/imports',
    name: 'imports',
    component: () => import('@/pages/imports/ImportsListPage.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/imports/new',
    name: 'imports-new',
    component: () => import('@/pages/imports/ImportNewPage.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/imports/:id',
    name: 'import-detail',
    component: () => import('@/pages/imports/ImportDetailPage.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/sources',
    name: 'sources',
    component: () => import('@/pages/sources/SourcesPage.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/settings',
    name: 'settings',
    component: () => import('@/pages/settings/SettingsPage.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/:pathMatch(.*)*',
    redirect: '/dashboard',
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

router.beforeEach(async (to) => {
  if (to.name === 'auth-error') return true
  const session = useSessionStore()
  try {
    // Recheck protected navigation: a grant may have been revoked in Apollo.
    await session.bootstrap(true)
  } catch (e: any) {
    if (to.meta.requiresAuth) return { name: 'auth-error', query: { reason: e.response?.status === 403 ? 'denied' : 'unavailable', from: to.fullPath } }
  }
  if (to.meta.requiresAuth && !session.isAuthenticated) {
    redirectToApollo(to.fullPath)
    return false
  }
  return true
})

export default router
