import { useFirebaseConfig } from "@/services/firebase";
import { getAuth, onAuthStateChanged, signInWithEmailAndPassword, signOut } from "firebase/auth";
import { ref } from "vue";
import router from "@/router";

export function useAuth() {
    let fAuth;
    function createAuthInstance() {
        const app = useFirebaseConfig();
        const auth = getAuth(app);
        const loggedUser = ref(getLocalUser());
        const token = ref('');
        console.log('Auth creted at:', new Date().toISOString())

        onAuthStateChanged(auth, _user => {
            // console.log('# onAuthStateChanged', _user)
            if (_user) {
                loggedUser.value = _user;
            } else {
                loggedUser.value = null;
            }
        });

        function getLocalUser() {
            const local = sessionStorage.getItem('___u') || null;
            return local !== null ? JSON.parse(local) : null;
        }

        function login(email, password) {
            return signInWithEmailAndPassword(auth, email, password).then(result => {
                token.value = result.user.accessToken;
                loggedUser.value = result.user;
                sessionStorage.setItem('___u', JSON.stringify(result.user));
                return result.user;
            }).catch(error => {
                const errorCode = error.code;
                const errorMessage = error.message;
                const email = error.email;
                const credential = error.credential;
                loggedUser.value = null;
                sessionStorage.clear();
                console.log('# login error')
                console.table({ errorCode, errorMessage, email, credential });
            });
        }

        function logout() {
            signOut(auth).then(() => {
                loggedUser.value = null;
                sessionStorage.clear();
                router.push('login');
            }).catch(error => {
                const errorCode = error.code;
                const errorMessage = error.message;
                const email = error.email;
                const credential = error.credential;
                console.log('# logout error')
                console.table({ errorCode, errorMessage, email, credential });
            });
        }

        return {
            loggedUser,
            login,
            logout
        };
    }
    if (!window._fireAuth) {
        fAuth = createAuthInstance();
        window._fireAuth = fAuth;
    } else fAuth = window._fireAuth;
    return fAuth;
}
