<template>
  <div class="snackbar" :class="[isShowSnackbar ? 'show': '']">
    Copied meeting code
  </div>
</template>

<script>
export default {
  name: "snackbar",
  props: {
    isShowSnackbar: {
      type: Boolean
    }
  }
}
</script>

<style scoped>

</style>
