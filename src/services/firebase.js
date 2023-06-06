import { initializeApp } from "firebase/app";

export function useFirebaseConfig() {
    let app;
    const firebaseConfig = {
        apiKey: "AIzaSyCqSOQwtaED9QTOg_IqZxOKgF5N89zO2lQ",
        authDomain: "yes4eutests.firebaseapp.com",
        projectId: "yes4eutests",
        storageBucket: "yes4eutests.appspot.com",
        messagingSenderId: "1062997613231",
        appId: "1:1062997613231:web:a93d4d8f5b49f3ab41125a",
        measurementId: "G-T322ZYB8NT"
    };

    if (!window._fireApp) {
        app = initializeApp(firebaseConfig);
        window._fireApp = app;
    } else app = window._fireApp;

    return app;
}
