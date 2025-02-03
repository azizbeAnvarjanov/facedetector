import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyC45rZ1iOznBBWldJ0p5snXLEOCE2gqbEs",
  authDomain: "new-pr-65936.firebaseapp.com",
  projectId: "new-pr-65936",
  storageBucket: "new-pr-65936.appspot.com",
  messagingSenderId: "178566900704",
  appId: "1:178566900704:web:470ec46fc943fee4829985",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const storage = getStorage(app);

export { db, storage };
