export const state = () => ({
  roomId: false,
  currentRoom: '',
  peerConnection: null,
  localStream: null,
  remoteStream: null,
  stream: null,
  callerCandidatesCollection: null,
  configuration: null,
  isShowSnackbar: false,
  isMute: false,
  isVideo: true,
})


export const getters = {
  roomId: state => state.roomId,
  currentRoom: state => state.currentRoom,
  peerConnection: state => state.peerConnection,
  localStream: state => state.localStream,
  remoteStream: state => state.remoteStream,
  configuration: state => state.configuration,
  stream: state => state.stream,
  isShowSnackbar: state => state.isShowSnackbar,
  isMute: state => state.isMute,
  isVideo: state => state.isVideo,
}

export const mutations = {
  setCurrentRoomId(state, payload) {
    state.currentRoom = payload
  },
  setStream(state, payload) {
    state.stream = payload
  },
  setLocalStream(state, payload) {
    state.localStream = payload
  },
  setRemoteStream(state, payload) {
    state.remoteStream = payload
  },
  setPeerConnection(state, payload) {
    state.peerConnection = payload.peerConnection
  },
  setCallerCandidatesCollection(state, payload) {
    state.callerCandidatesCollection = payload.callerCandidatesCollection
  },
  setConfiguration(state, payload) {
    state.configuration = payload.configuration
  },
  showSnackbar(state, payload) {
    state.isShowSnackbar = payload
  },
  toggleMute(state, payload) {
    state.localStream.getTracks().forEach(track => {
      if (track.kind === 'audio') {
        state.isMute = !state.isMute
        track.enabled = state.isMute
        console.log(track)
      }
    })
  },
  toggleVideo(state, payload) {
    state.localStream.getTracks().forEach(track => {
      if (track.kind === 'video') {
        state.isVideo = !state.isVideo
        track.enabled = state.isVideo
        console.log(track)
      }
    })
  },
}

export const actions = {
  async createRoom(context, payload) {
    let peerConnection = null
    let localStream = payload.localStream
    let remoteStream = new MediaStream()
    let callerCandidatesCollection = null
    let configuration = {
      iceServers: [
        {
          urls: [
            'stun:stun1.l.google.com:19302',
            'stun:stun2.l.google.com:19302',
          ],
        },
        {
          urls: "turn:openrelay.metered.ca:80",
          username: "openrelayproject",
          credential: "openrelayproject"
        },
        {
          urls: "turn:openrelay.metered.ca:443",
          username: "openrelayproject",
          credential: "openrelayproject"
        },
        {
          urls: "turn:openrelay.metered.ca:443?transport=tcp",
          username: "openrelayproject",
          credential: "openrelayproject"
        }
      ],
      iceCandidatePoolSize: 10,
    }
    peerConnection = new RTCPeerConnection(configuration)
    localStream.getTracks().forEach(track => {
      peerConnection.addTrack(track, localStream);
    });

    callerCandidatesCollection = payload.roomRef.collection('callerCandidates');

    peerConnection.addEventListener('icecandidate', event => {
      if (!event.candidate) {
        console.log('Got final candidate!');
        return;
      }
      console.log('Got candidate: ', event.candidate);
      callerCandidatesCollection.add(event.candidate.toJSON());
    });
    const offer = await peerConnection.createOffer();
    await peerConnection.setLocalDescription(offer);
    console.log('Created offer:', offer);

    const roomWithOffer = {
      'offer': {
        type: offer.type,
        sdp: offer.sdp,
      },
    };
    await payload.roomRef.set(roomWithOffer);
    context.commit('setCurrentRoomId', payload.roomRef.id)
    console.log(`New room created with SDP offer. Room ID: ${payload.roomRef.id}`);

    peerConnection.addEventListener('track', event => {
      console.log('Got remote track:', event.streams[0]);
      event.streams[0].getTracks().forEach(track => {
        console.log('Add a track to the remoteStream:', track);
        remoteStream.addTrack(track);
      });
    });

    payload.roomRef.onSnapshot(async snapshot => {
      const data = snapshot.data();
      if (!peerConnection.currentRemoteDescription && data && data.answer) {
        console.log('Got remote description: ', data.answer);
        const rtcSessionDescription = new RTCSessionDescription(data.answer);
        await peerConnection.setRemoteDescription(rtcSessionDescription);
      }
    });
    payload.roomRef.collection('calleeCandidates').onSnapshot(snapshot => {
      snapshot.docChanges().forEach(async change => {
        if (change.type === 'added') {
          let data = change.doc.data();
          console.log(`Got new remote ICE candidate: ${JSON.stringify(data)}`);
          await peerConnection.addIceCandidate(new RTCIceCandidate(data));
        }
      });
    });


    context.commit('setPeerConnection', peerConnection)
    context.commit('setLocalStream', localStream)
    context.commit('setRemoteStream', remoteStream)
    context.commit('setCallerCandidatesCollection', callerCandidatesCollection)
    context.commit('setConfiguration', configuration)
  },
  async joinRoom(context, payload) {
    let peerConnection = null
    let localStream = payload.localStream
    let remoteStream = new MediaStream()
    let configuration = {
      iceServers: [
        {
          urls: [
            'stun:stun1.l.google.com:19302',
            'stun:stun2.l.google.com:19302',
          ],
        },
      ],
      iceCandidatePoolSize: 10,
    }
    peerConnection = new RTCPeerConnection(configuration)
    localStream.getTracks().forEach(track => {
      peerConnection.addTrack(track, localStream);
    });

    const calleeCandidatesCollection = payload.roomRef.collection('calleeCandidates');
    peerConnection.addEventListener('icecandidate', event => {
      if (!event.candidate) {
        console.log('Got final candidate!');
        return;
      }
      console.log('Got candidate: ', event.candidate);
      calleeCandidatesCollection.add(event.candidate.toJSON());
    });
    peerConnection.addEventListener('track', event => {
      console.log('Got remote track:', event.streams[0]);
      event.streams[0].getTracks().forEach(track => {
        console.log('Add a track to the remoteStream:', track);
        remoteStream.addTrack(track);
      });
    });

    const offer = payload.roomSnapshot.data().offer;
    console.log('Got offer:', offer);
    await peerConnection.setRemoteDescription(new RTCSessionDescription(offer));
    const answer = await peerConnection.createAnswer();
    console.log('Created answer:', answer);
    await peerConnection.setLocalDescription(answer);

    const roomWithAnswer = {
      answer: {
        type: answer.type,
        sdp: answer.sdp,
      },
    };
    await payload.roomRef.update(roomWithAnswer);
    payload.roomRef.collection('callerCandidates').onSnapshot(snapshot => {
      snapshot.docChanges().forEach(async change => {
        if (change.type === 'added') {
          let data = change.doc.data();
          console.log(`Got new remote ICE candidate: ${JSON.stringify(data)}`);
          await peerConnection.addIceCandidate(new RTCIceCandidate(data));
        }
      });
    });
    context.commit('setPeerConnection', peerConnection)
    context.commit('setLocalStream', localStream)
    context.commit('setRemoteStream', remoteStream)
    context.commit('setConfiguration', configuration)
  },
}
