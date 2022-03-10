export const state = () => ({
  roomId: false,
  currentRoom: '',
  peerConnection: null,
  localStream: null,
  remoteStream: null,
  stream: null,
  callerCandidatesCollection: null,
  configuration: null
})


export const getters = {
  roomId: state => state.roomId,
  currentRoom: state => state.currentRoom,
  peerConnection: state => state.peerConnection,
  localStream: state => state.localStream,
  remoteStream: state => state.remoteStream,
  configuration: state => state.configuration,
  stream: state => state.stream,
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
  commitAll(state, payload) {
    state.remoteStream = payload.remoteStream
    state.localStream = payload.localStream
    state.peerConnection = payload.peerConnection
    state.callerCandidatesCollection = payload.callerCandidatesCollection
    state.configuration = payload.configuration
  }
}

export const actions = {
  async createRoom({commit, state, dispatch}, roomRef) {
    let peerConnection = null
    let localStream = state.localStream
    let remoteStream = null
    let callerCandidatesCollection = null
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
    // dispatch('registerPeerConnectionListeners')
    localStream.getTracks().forEach(track => {
      peerConnection.addTrack(track, localStream);
    });

    // Code for collecting ICE candidates below
    callerCandidatesCollection = roomRef.collection('callerCandidates');

    peerConnection.addEventListener('icecandidate', event => {
      if (!event.candidate) {
        console.log('Got final candidate!');
        return;
      }
      console.log('Got candidate: ', event.candidate);
      callerCandidatesCollection.add(event.candidate.toJSON());
    });
    // Code for collecting ICE candidates above

    // Code for creating a room below
    const offer = await peerConnection.createOffer();
    await peerConnection.setLocalDescription(offer);
    console.log('Created offer:', offer);

    const roomWithOffer = {
      'offer': {
        type: offer.type,
        sdp: offer.sdp,
      },
    };
    await roomRef.set(roomWithOffer);
    commit('setCurrentRoomId', roomRef.id)
    console.log(`New room created with SDP offer. Room ID: ${roomRef.id}`);

    peerConnection.addEventListener('track', event => {
      console.log('Got remote track:', event.streams[0]);
      event.streams[0].getTracks().forEach(track => {
        console.log('Add a track to the remoteStream:', track);
        remoteStream.addTrack(track);
      });
    });

    // Listening for remote session description below
    roomRef.onSnapshot(async snapshot => {
      const data = snapshot.data();
      if (!peerConnection.currentRemoteDescription && data && data.answer) {
        console.log('Got remote description: ', data.answer);
        const rtcSessionDescription = new RTCSessionDescription(data.answer);
        await peerConnection.setRemoteDescription(rtcSessionDescription);
      }
    });
    // Listening for remote session description above

    // Listen for remote ICE candidates below
    roomRef.collection('calleeCandidates').onSnapshot(snapshot => {
      snapshot.docChanges().forEach(async change => {
        if (change.type === 'added') {
          let data = change.doc.data();
          console.log(`Got new remote ICE candidate: ${JSON.stringify(data)}`);
          await peerConnection.addIceCandidate(new RTCIceCandidate(data));
        }
      });
    });
    const payload = {
      peerConnection,
      localStream,
      remoteStream,
      callerCandidatesCollection,
    }

    commit('commitAll', payload)
  },
  async joinRoom({commit, state}, payload) {
    let peerConnection = null
    let localStream = state.localStream
    let remoteStream = null
    let callerCandidatesCollection = null
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
    // await this.$store.dispatch('room/registerPeerConnectionListeners')
    localStream.getTracks().forEach(track => {
      peerConnection.addTrack(track, localStream);
    });

    // Code for collecting ICE candidates below
    const calleeCandidatesCollection = payload.roomRef.collection('calleeCandidates');
    peerConnection.addEventListener('icecandidate', event => {
      if (!event.candidate) {
        console.log('Got final candidate!');
        return;
      }
      console.log('Got candidate: ', event.candidate);
      calleeCandidatesCollection.add(event.candidate.toJSON());
    });
    // Code for collecting ICE candidates above
    peerConnection.addEventListener('track', event => {
      console.log('Got remote track:', event.streams[0]);
      event.streams[0].getTracks().forEach(track => {
        console.log('Add a track to the remoteStream:', track);
        remoteStream.addTrack(track);
      });
    });


    // Code for creating SDP answer below
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
    // Code for creating SDP answer above

    // Listening for remote ICE candidates below
    payload.roomRef.collection('callerCandidates').onSnapshot(snapshot => {
      snapshot.docChanges().forEach(async change => {
        if (change.type === 'added') {
          let data = change.doc.data();
          console.log(`Got new remote ICE candidate: ${JSON.stringify(data)}`);
          await peerConnection.addIceCandidate(new RTCIceCandidate(data));
        }
      });
    });
    const data = {
      peerConnection,
      localStream,
      remoteStream,
      callerCandidatesCollection,
    }

    commit('commitAll', data)
  },
  registerPeerConnectionListeners({state, commit}) {
    // state.peerConnection.addEventListener('icegatheringstatechange', () => {
    //   console.log(
    //     `ICE gathering state changed: ${state.peerConnection.iceGatheringState}`);
    // });
    //
    // state.peerConnection.addEventListener('connectionstatechange', () => {
    //   console.log(`Connection state change: ${state.peerConnection.connectionState}`);
    // });
    //
    // state.peerConnection.addEventListener('signalingstatechange', () => {
    //   console.log(`Signaling state change: ${state.peerConnection.signalingState}`);
    // });
    //
    // state.peerConnection.addEventListener('iceconnectionstatechange ', () => {
    //   console.log(
    //     `ICE connection state change: ${state.peerConnection.iceConnectionState}`);
    // });
  }
}
