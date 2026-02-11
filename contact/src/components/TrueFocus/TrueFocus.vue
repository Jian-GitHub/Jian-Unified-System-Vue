<script setup lang="ts">
import { motion } from 'motion-v';
import { computed, nextTick, onMounted, onUnmounted, ref, watch, useTemplateRef, inject } from 'vue';

interface TrueFocusProps {
  sentence?: string;
  manualMode?: boolean;
  blurAmount?: number;
  borderColor?: string;
  glowColor?: string;
  animationDuration?: number;
  pauseBetweenAnimations?: number;
  index?: Array<number>;
  mode?: 'zh' | 'en';
  syncGroup?: string;
}

const props = withDefaults(defineProps<TrueFocusProps>(), {
  sentence: 'True Focus',
  manualMode: false,
  blurAmount: 5,
  borderColor: 'green',
  glowColor: 'rgba(0, 255, 0, 0.6)',
  animationDuration: 0.5,
  pauseBetweenAnimations: 1,
  mode: 'en'
});

const words = computed(() => props.sentence.split(' '));

// 从父组件获取共享的 Map
const sharedIndexMap = inject<Map<string, any> | null>('trueFocusSharedIndexMap', null);

// 根据 syncGroup 决定使用共享还是独立的 currentIndex
const currentIndex = (props.syncGroup && sharedIndexMap)
  ? (() => {
      if (!sharedIndexMap.has(props.syncGroup)) {
        sharedIndexMap.set(props.syncGroup, ref(0));
      }
      const shared = sharedIndexMap.get(props.syncGroup);
      console.log('[TrueFocus] Using shared currentIndex for group:', props.syncGroup, 'sentence:', props.sentence);
      return shared;
    })()
  : (() => {
      console.log('[TrueFocus] Using independent currentIndex for sentence:', props.sentence);
      return ref(0);
    })();

const lastActiveIndex = ref<number | null>(null);
const containerRef = useTemplateRef<HTMLDivElement>('containerRef');
const wordRefs = ref<HTMLSpanElement[]>([]);
const focusRect = ref({ x: 0, y: 0, width: 0, height: 0 });

let interval: ReturnType<typeof setInterval> | null = null;

watch(
    [currentIndex, () => words.value.length],
    async () => {
      if (currentIndex.value === null || currentIndex.value === -1) return;

      // 找到实际的 word 数组索引
      let actualWordIndex = currentIndex.value;
      if (props.index) {
        // 反向查找：props.index 中哪个位置的值等于 currentIndex.value
        actualWordIndex = props.index.findIndex(val => val === currentIndex.value);
        if (actualWordIndex === -1) {
          console.error('[TrueFocus] Cannot find word index for currentIndex.value:', currentIndex.value);
          return;
        }
      }

      if (!wordRefs.value[actualWordIndex] || !containerRef.value) return;

      await nextTick();

      const parentRect = containerRef.value.getBoundingClientRect();
      const activeRect = wordRefs.value[actualWordIndex].getBoundingClientRect();

      focusRect.value = {
        x: activeRect.left - parentRect.left,
        y: activeRect.top - parentRect.top,
        width: activeRect.width,
        height: activeRect.height
      };
    },
    { immediate: true }
);

const handleMouseEnter = (index: number) => {
  if (props.manualMode) {
    // 如果有 index 映射，使用映射后的值；否则直接使用数组索引
    const mappedIndex = props.index ? props.index[index] : index;
    console.log('[TrueFocus] handleMouseEnter:', {
      sentence: props.sentence,
      wordArrayIndex: index,
      mappedIndex: mappedIndex,
      propsIndex: props.index,
      oldValue: currentIndex.value,
      syncGroup: props.syncGroup
    });
    lastActiveIndex.value = mappedIndex;
    currentIndex.value = mappedIndex;
    console.log('[TrueFocus] after set currentIndex.value =', currentIndex.value);
  }
};

const handleMouseLeave = () => {
  if (props.manualMode) {
    currentIndex.value = lastActiveIndex.value || 0;
  }
};

const setWordRef = (el: HTMLSpanElement | null, index: number) => {
  if (el) {
    wordRefs.value[index] = el;
  }
};

onMounted(async () => {
  await nextTick();

  // 找到初始的实际 word 索引
  let initialWordIndex = 0;
  if (props.index && currentIndex.value !== undefined && currentIndex.value !== null) {
    const foundIndex = props.index.findIndex(val => val === currentIndex.value);
    if (foundIndex !== -1) {
      initialWordIndex = foundIndex;
    }
  }

  if (wordRefs.value[initialWordIndex] && containerRef.value) {
    const parentRect = containerRef.value.getBoundingClientRect();
    const activeRect = wordRefs.value[initialWordIndex].getBoundingClientRect();

    focusRect.value = {
      x: activeRect.left - parentRect.left,
      y: activeRect.top - parentRect.top,
      width: activeRect.width,
      height: activeRect.height
    };
  }

  watch(
      [() => props.manualMode, () => props.animationDuration, () => props.pauseBetweenAnimations, () => words.value],
      () => {
        // ...existing code...
      },
      { immediate: true }
  );
});

onUnmounted(() => {
  if (interval) {
    clearInterval(interval);
  }
});
</script>

<template>
  <div :class="['relative', 'flex', mode === 'zh' ? 'gap-[0em]' : 'gap-[0.5em]']" ref="containerRef">
    <span
        v-for="(word, index) in words"
        :key="props.index ? props.index[index] : index"
        :ref="el => setWordRef(el as HTMLSpanElement, index)"
        class="relative font-black transition-[filter,color] duration-300 ease-in-out cursor-pointer"
        :style="{
        filter: (props.index ? props.index[index] : index) === currentIndex ? 'blur(0px)' : `blur(${blurAmount}px)`,
        '--border-color': borderColor,
        '--glow-color': glowColor,
        transition: `filter ${animationDuration}s ease`
      }"
        :data-word-index="index"
        :data-mapped-index="props.index ? props.index[index] : index"
        :data-current-index="currentIndex"
        :data-is-clear="(props.index ? props.index[index] : index) === currentIndex"
        @mouseenter="handleMouseEnter(index)"
        @mouseleave="handleMouseLeave"
    >
      {{ word }}
    </span>

    <motion.div
        class="top-0 left-0 box-content absolute border-none pointer-events-none"
        :initial="{ opacity: 0 }"
        :animate="{
        x: focusRect.x,
        y: focusRect.y,
        width: focusRect.width,
        height: focusRect.height,
        opacity: currentIndex >= 0 ? 1 : 0
      }"
        :transition="{
        duration: animationDuration
      }"
        :style="{
        '--border-color': borderColor,
        '--glow-color': glowColor
      }"
    >
      <span
          class="top-[-10px] left-[-10px] absolute filter-[drop-shadow(0_0_4px_var(--border-color,#fff))] border-[3px] border-(--border-color,#fff) border-r-0 border-b-0 rounded-[3px] w-4 h-4 transition-none"
      ></span>

      <span
          class="top-[-10px] right-[-10px] absolute filter-[drop-shadow(0_0_4px_var(--border-color,#fff))] border-[3px] border-(--border-color,#fff) border-b-0 border-l-0 rounded-[3px] w-4 h-4 transition-none"
      ></span>

      <span
          class="bottom-[-10px] left-[-10px] absolute filter-[drop-shadow(0_0_4px_var(--border-color,#fff))] border-[3px] border-(--border-color,#fff) border-t-0 border-r-0 rounded-[3px] w-4 h-4 transition-none"
      ></span>

      <span
          class="right-[-10px] bottom-[-10px] absolute filter-[drop-shadow(0_0_4px_var(--border-color,#fff))] border-[3px] border-(--border-color,#fff) border-t-0 border-l-0 rounded-[3px] w-4 h-4 transition-none"
      ></span>
    </motion.div>
  </div>
</template>