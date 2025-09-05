<script setup lang="ts">
import { useI18n } from 'vue-i18n'
const { t } = useI18n()

import { computed } from 'vue'
const msg = computed(() => t('side.login.SIDE_TEXT_1'))
</script>