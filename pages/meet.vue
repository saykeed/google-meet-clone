<template>
  <div class="body">
    <div class="main d-flex align-items-center justify-content-center px-3">
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
        <div class="col-md-4 d-none d-md-block">
          9:3PM | {{ currentRoom }}
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
export default {
  name: "clone",
  data() {
    return {}
  },
  computed: {
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
    this.bindStream();
  },
  methods: {
    bindStream() {
      document.querySelector('#localVideo').srcObject = this.stream;
      document.querySelector('#remoteVideo').srcObject = this.remoteStream;
      console.log('Stream:', document.querySelector('#localVideo').srcObject);
      console.log(this.roomId)
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

      // Delete room on hangup
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
.main {
  height: 100vh;
}

.videos video {
  border-radius: 10px;
}

.body {
  background-color: #202124;
}

.bar {
  position: fixed;
  width: 100vw;
  height: 80px;
  bottom: 0;
  left: 0;
}

.icon-circle {
  width: 40px;
  height: 40px;
  border-radius: 100px;
  margin-right: 6px;
  background-color: #3c4043;
  cursor: pointer;
}

.icon-circle img {
  width: 24px;
}

.end {
  background-color: #ea4335;
  border-radius: 100px;
  height: 40px;
  width: 56px;
}
</style>
