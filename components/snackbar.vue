<template>
  <div class="snackbar small font-weight-light" :class="[isShowSnackbar ? 'show': '']">
    Copied meeting code
  </div>
</template>

<script>
export default {
  name: "snackbar",
  computed: {
    isShowSnackbar(){
      return this.$store.getters['room/isShowSnackbar']
    }
  }
}
</script>

<style scoped>

</style>
