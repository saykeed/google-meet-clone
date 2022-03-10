<template>
  <div class="meeting">
    <div class="audio-container"></div>

    <snackbar :is-show-snackbar="isShowSnackbar"></snackbar>

    <code-overlay @close="toggleOverlay" @show-snackbar="toggleSnackbar"
                  :is-show-overlay="isShowOverlay"></code-overlay>

    <div class="main d-flex align-items-center justify-content-center px-4">
      <div class="row videos">
        <div class="col-md-6 mb-3">
          <video id="localVideo" class="img-fluid" muted autoplay playsinline></video>
        </div>
        <div class="col-md-6 mb-3">

          <video id="remoteVideo" class="img-fluid" autoplay playsinline></video>

        </div>
      </div>
    </div>
    <bottom-action-panel @mute="mute" @end="hangUp" @toggle="toggle"></bottom-action-panel>
  </div>
</template>

<script>

export default {
  name: "meet",
  data() {
    return {
      willPlaySound: true,
      isShowOverlay: true,
      isShowSnackbar: false,
    }
  },
  computed: {
    currentRoom() {
      return this.$store.getters['room/currentRoom'];
    },
    remoteStream() {
      return this.$store.getters['room/remoteStream'];
    },
    localStream() {
      return this.$store.getters['room/remoteStream'];
    },
    peerConnection() {
      return this.$store.getters['room/peerConnection'];
    },
    roomId() {
      return this.$store.getters['room/roomId'];
    },
    stream() {
      return this.$store.getters['room/stream'];
    },
  },
  mounted() {
    this.attachStream();
    // this.playSound();
  },
  methods: {
    toggleSnackbar(e) {
      console.log(e)
      this.isShowSnackbar = e.value;
    },
    toggleOverlay(e) {
      this.isShowOverlay = e.value
    },
    toggle(){
      this.$store.commit('room/toggleVideo')
    },
    mute(){
      this.$store.commit('room/toggleMute')
    },
    async hangUp(e) {
      const ctx = this;
      const tracks = document.querySelector('#localVideo').srcObject.getTracks();
      tracks.forEach(track => {
        track.stop();
      });

      if (ctx.remoteStream) {
        ctx.remoteStream.getTracks().forEach(track => track.stop());
      }

      if (ctx.peerConnection) {
        ctx.peerConnection.close();
      }

      document.querySelector('#localVideo').srcObject = null;
      document.querySelector('#remoteVideo').srcObject = null;
      ctx.$store.commit('room/setCurrentRoomId', null)

      await this.deleteRoom();
    },
    async deleteRoom() {
      const ctx = this;
      if (ctx.roomId) {
        await this.$fire.firestoreReady();
        const roomRef = await this.$fire.firestore.collection('rooms').doc(ctx.roomId)
        const calleeCandidates = roomRef.collection('calleeCandidates').get();
        calleeCandidates.forEach(async candidate => {
          await candidate.ref.delete();
        });
        const callerCandidates = roomRef.collection('callerCandidates').get();
        callerCandidates.forEach(async candidate => {
          await candidate.ref.delete();
        });
        await roomRef.delete();
      }
      await this.$router.push('/')
    },
    attachStream() {
      document.querySelector('#localVideo').srcObject = this.stream;
      document.querySelector('#remoteVideo').srcObject = this.remoteStream;
      console.log('Stream:', document.querySelector('#localVideo').srcObject);
      console.log(this.roomId)
    },
    playSound() {
      const container = document.querySelector('.audio-container')
      let audio = document.createElement('audio')
      audio.src = '/join.mp3'
      container.appendChild(audio)

      document.body.addEventListener('mouseover', () => {
        if (audio !== null) {
          audio.play()
          setTimeout(() => {
            container.removeChild(audio)
            audio = null
          }, 5000)
        }
      })
    },
  }
}
</script>

<style scoped>
</style>
