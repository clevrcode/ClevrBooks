<template>
    <!-- <li @click="accountEntries"> -->
    <li>
        <h3>{{ name }}</h3>
        <h4 :class="{negative: balanceIsNegative}">${{ currentBalance }}</h4>
        <div class="actions">
            <base-button link :to="accountDetailsLink">View Details</base-button>
        </div>
    </li>
</template>

<script>
export default {
    props: ['id', 'name', 'balance'],
    computed: {
        accountDetailsLink() {
          return this.$route.path + '/' + this.id
          // return { name: 'accountdetail', params: { id: this.id } }
        },
        currentBalance() {
          if (this.balance > -0.01) {
            return "0.00"
          }
          return this.balance.toFixed(2)
        },
        balanceIsNegative() {
          if (this.balance > -0.01) {
            return false
          }
          return this.balance < 0.0
        }
    },
    methods: {
        accountEntries() {
          this.$router.push({ name: 'accountentries', params: { id: this.id }})
        }
    }
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
div {
  margin: 0.5rem 0;
}

.actions {
  display: flex;
  justify-content: flex-end;
}

.negative {
    color: red;
}

</style>