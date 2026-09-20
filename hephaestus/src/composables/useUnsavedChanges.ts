import { onBeforeUnmount, type Ref } from 'vue'
import { onBeforeRouteLeave, onBeforeRouteUpdate } from 'vue-router'
import { ElMessageBox } from 'element-plus'
import { useI18n } from 'vue-i18n'

export function useUnsavedChanges(dirty: Ref<boolean>) {
  const { t } = useI18n()
  const confirm = async () => {
    if (!dirty.value) return true
    try {
      await ElMessageBox.confirm(t('ui.leaveWithoutSavingYourChanges'), '', { type: 'warning' })
      return true
    } catch { return false }
  }
  onBeforeRouteLeave(confirm)
  onBeforeRouteUpdate((to, from) => to.fullPath === from.fullPath || confirm())
  const unload = (event: BeforeUnloadEvent) => {
    if (!dirty.value) return
    event.preventDefault()
    event.returnValue = ''
  }
  window.addEventListener('beforeunload', unload)
  onBeforeUnmount(() => window.removeEventListener('beforeunload', unload))
  return confirm
}
