<template>
  <div class="autocomplete">
    <input
      type="text"
      v-model="search"
      data-lpignore="true"
      @input="onChange"
      @keydown.tab="onEnter"
      @keydown.down="onArrowDown"
      @keydown.up="onArrowUp"
      @keydown.enter="onEnter"
      @keydown.esc="onEscape"
    />
    <ul class="autocomplete-results" v-show="isOpen">
      <li
        class="autocomplete-result"
        v-for="(result, i) in results"
        :key="i"
        @click="submitResult(result)"
        :class="{ 'is-active': i === arrowCounter }"
      >
        {{ result }}
      </li>
    </ul>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const emit = defineEmits(['enter'])
const props = defineProps({
  items: {
    type: Array,
    required: false,
    default: () => [],
  },
  initext: {
    type: String,
    required: false,
    default: '',
  },
})

const search = ref(props.initext)
const results = ref([])
const isOpen = ref(false)
const arrowCounter = ref(-1)

function filterResults() {
  results.value = props.items.filter((item) =>
    item.toLowerCase().includes(search.value.toLowerCase()),
  )
}

function onChange() {
  filterResults()
  isOpen.value = results.value.length > 0
}

function onArrowDown() {
  if (arrowCounter.value < results.value.length - 1) {
    arrowCounter.value += 1
  }
  console.log(`onArrowDown(${arrowCounter.value})`)
}

function onArrowUp() {
  if (arrowCounter.value > 0) {
    arrowCounter.value -= 1
  }
  console.log(`onArrowUp(${arrowCounter.value})`)
}

function onEnter() {
  console.log(`onEnter(${arrowCounter.value})`)
  if (arrowCounter.value >= 0) {
    setResult(results.value[arrowCounter.value])
  }
  emit('enter', search.value)
}

function onEscape() {
  setResult('')
}

function submitResult(result) {
  setResult(result)
  emit('enter', search.value)
}

function setResult(result) {
  search.value = result
  isOpen.value = false
  arrowCounter.value = -1
}
</script>

<style scoped>
input[type='text'] {
  width: 100%;
}

.autocomplete {
  position: relative;
}

.autocomplete-results {
  background: white;
  padding: 0;
  margin: 0;
  border: 1px solid #eeeeee;
  height: 120px;
  min-height: 1em;
  max-height: 6em;
  overflow: auto;
}

.autocomplete-result {
  list-style: none;
  text-align: left;
  padding: 4px 2px;
  cursor: pointer;
}

.autocomplete-result.is-active,
.autocomplete-result:hover {
  background-color: #4aae9b;
  color: white;
}
</style>
