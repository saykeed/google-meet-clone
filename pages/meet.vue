<template>
  <div class="meeting">
    <div class="snackbar" :class="[isShowSnackbar ? 'show': '']">
      Copied meeting link
    </div>
    <div class="audio-container"></div>
    <div class="overlay " v-if="isShowOverlay">
      <div class="position-relative">
        <div @click="closeOverlay" class="position-absolute cursor-pointer close-overlay">
          <img src="/icons/close_black_24dp.svg" class="img-fluid" alt="">
        </div>
      </div>
      <div class="mb-4 text-18 mt-3 font-weight-light">Your meeting's ready</div>
      <p class="font-weight-light text-14">You can share this meeting link with others you want in the meeting</p>
      <div class="overlay-content mb-2 d-flex align-items-center justify-content-between">
        <div>{{ currentRoom }}</div>
        <div @click="copyText" class="cursor-pointer"><img src="/icons/content_copy_black_24dp.svg" class="img-fluid"
                                                           alt=""></div>
      </div>
    </div>
    <div class="main d-flex align-items-center justify-content-center px-4">
      <div class="row videos">
        <div class="col-md-6 mb-3">
          <video id="localVideo" class="embed-responsive-item" muted autoplay playsinline></video>
        </div>
        <div class="col-md-6 mb-3">

          <video id="remoteVideo" class="embed-responsive-item" autoplay playsinline></video>

        </div>
      </div>
    </div>
    <div class="bar px-4 text-white">
      <div class="row ">
        <div class="col-md-4 d-none d-md-flex align-items-center">
          <div class="pr-2 br-1">
            {{ currentTime }}
          </div>
          <div class="pl-2">
            {{ currentRoom }}
          </div>
        </div>
        <div class="col-md-4">
          <div class="d-flex justify-content-center align-items-center">
            <div class="icon-circle d-flex align-items-center justify-content-center">
              <div>
                <img src="/icons/mic_white_24dp.svg" class="img-fluid" alt="">
              </div>
            </div>
            <div class="icon-circle d-flex align-items-center justify-content-center">
              <div>
                <img src="/icons/videocam_white_24dp.svg" class="img-fluid" alt="">
              </div>
            </div>
            <div @click="hangUp" class="icon-circle end d-flex align-items-center justify-content-center">
              <div>
                <img src="/icons/call_end_white_24dp.svg" class="img-fluid" alt="">
              </div>
            </div>
          </div>
        </div>
        <div class="col-md-4"></div>
      </div>
    </div>
  </div>
</template>

<script>
import dayjs from 'dayjs'

export default {
  name: "meet",
  data() {
    return {
      dayjs,
      willPlaySound: true,
      isShowOverlay: true,
      isShowSnackbar: false,
    }
  },
  computed: {
    currentTime() {
      let now = Date.now()
      return dayjs(now).format('HH:mm')
    },
    currentRoom() {
      return this.$store.getters['room/currentRoom'];
    },
    remoteStream() {
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
    closeOverlay() {
      this.isShowOverlay = false
    },
    copyText() {
      let value = `${window.location.host}${this.currentRoom}`
      navigator.clipboard.writeText(value);
      this.isShowSnackbar = true
      this.isShowOverlay = false
      setTimeout(() => {
        this.isShowSnackbar = false
      }, 40000)
    },
    attachStream() {
      document.querySelector('#localVideo').srcObject = this.stream;
      document.querySelector('#remoteVideo').srcObject = this.remoteStream;
      console.log('Stream:', document.querySelector('#localVideo').srcObject);
      console.log(this.roomId)
    },
    playSound() {
      const container = document.querySelector('.audio-container')
      const audio = document.createElement('audio')
      audio.src = '/join.mp3'
      container.appendChild(audio)

      document.body.addEventListener('mouseover', () => {
        audio.play()
        setTimeout(() => {
          container.removeChild(audio)
        }, 5000)
      })
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
    }
  }
}
</script>

<style scoped>
</style>
