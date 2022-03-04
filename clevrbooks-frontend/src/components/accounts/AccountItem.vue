<template>
    <li>
        <h3>{{ name }}</h3>
        <h4>${{ balance }}</h4>
    </li>
</template>

<script>
export default {
    props: ['id', 'name', 'balance']
}
</script>

<style scoped>
li {
  margin: 1rem 0;
  border: 1px solid #424242;
  border-radius: 12px;
  padding: 1rem;
}

h3 {
  font-size: 1.5rem;
}

h3,
h4 {
  margin: 0.5rem 0;
}
</style>