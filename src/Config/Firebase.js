import * as fb from "firebase/app";
import "firebase/auth";
import "firebase/firestore";

const firebase = fb.initializeApp({
  apiKey: "AIzaSyCIpQxgkjGsV4UGgi4DhGAwo3h-HjMk7kw",
  authDomain: "cards-4d0cc.firebaseapp.com",
  databaseURL: "https://cards-4d0cc.firebaseio.com",
  projectId: "cards-4d0cc",
  storageBucket: "cards-4d0cc.appspot.com",
  messagingSenderId: "1071767468257",
  appId: "1:1071767468257:web:79f5f83cb4d0c355b89fa0",
  measurementId: "G-HHEV9NVBMP",
});

export default firebase;
