import { useFirebaseConfig } from "@/services/firebase";
import { addDoc, collection, FieldValue, doc, getDoc, getDocs, getFirestore, limit, onSnapshot, orderBy, query, updateDoc, where, writeBatch, arrayRemove } from 'firebase/firestore';

const clearUndefined = obj => {
    for (const prop in obj) {
        if (obj[prop] === undefined) {
            delete obj[prop];
        }
    }
    return obj;
};

const valuesWithId = snapshot => {
    const values = [];
    snapshot.forEach(item => {
        const data = item.data();
        values.push({ id: item.id, expenses: data.expenses, ...data });
    });
    return values;
};

export function useFirestore() {
    let fFirestore;

    async function createExpense(userId, expense) {
        const fs = getFirestore();
        const userRef = doc(fs, 'testediogo', 'yes', 'testediogo', userId);
        const userDoc = await getDoc(userRef);

        if (userDoc.exists()) {
            const userData = userDoc.data();
            const userExpenses = userData.expenses || [];
            const updatedExpenses = [...userExpenses, expense];

            return updateDoc(userRef, { expenses: updatedExpenses });
        }
    }


    function createFirestoreInstance() {
        const app = useFirebaseConfig();
        const user = sessionStorage.getItem('___u') ? JSON.parse(sessionStorage.getItem('___u')) : null
        const fs = getFirestore(app);

        function createId() {
            return btoa(new Date().getTime().toString()).replace(new RegExp('=', 'g'), '');
        }

        function list(resource, args = { limit: 0, once: false }) {
            const colRef = collection(fs, resource);

            const arrQuery = [];
            if (args.where) for (const w of args.where) arrQuery.push(where(w[0], w[1], w[2]));
            if (args && args.limit) arrQuery.push(limit(args.limit));
            if (args && args.sort) {
                let sort = [];
                if (!(args.sort instanceof Array)) sort.push(args.sort);
                else sort = args.sort;

                for (const s of sort) {
                    const split = s.split(' ');
                    arrQuery.push(orderBy(split[0], split[1] ? split[1] : 'asc'));
                }
            }
            const q = arrQuery.length ? query(colRef, ...arrQuery) : query(colRef);

            return new Promise((resolve, reject) => {
                try {
                    const unsubscribe = onSnapshot(q, snap => {
                        resolve(valuesWithId(snap.docs));
                        if (args && args.once) unsubscribe();
                    });
                } catch (error) {
                    reject(error);
                }
            });
        }


        async function create(resource, value, id = null) {
            const timestamp = new Date().getTime();
            const uid = user ? user.uid : null; // Get the UID from the user object if available
          
            const expense = {
              ...value.expenses[0], // Get the first expense object from the array
              id: createId(), // Assign a unique ID to the expense
              createdAt: timestamp,
              updatedAt: timestamp,
              uid: uid,
            };
          
            const colRef = collection(fs, resource);
            const querySnapshot = await getDocs(query(colRef, where("email", "==", value.email)));
            const docs = querySnapshot.docs;
          
            if (docs.length > 0) {
              const docRef = docs[0].ref;
              const expensesArray = docs[0].data().expenses || [];
              expensesArray.push(expense);
              return updateDoc(docRef, { expenses: expensesArray, submitted: false });
            } else {
              return addDoc(colRef, {
                email: value.email,
                expenses: [expense],
                submitted: false,
              });
            }
          }
          
        const submitExpensesForValidation = async (resource, email) => {
            const docRef = doc(fs, resource, email);
            return updateDoc(docRef, { submitted: true });
          };
          

            async function update(collectionPath, documentPath, updatedDoc) {
            const fs = getFirestore();
            const docRef = doc(fs, collectionPath, documentPath);
            await updateDoc(docRef, updatedDoc);
          }
          
          async function remove(collectionPath, documentPath, expenseId) {
            const fs = getFirestore();
            const docRef = doc(fs, collectionPath, documentPath);
            const docSnapshot = await getDoc(docRef);
          
            if (docSnapshot.exists()) {
              const existingExpenses = docSnapshot.data().expenses || [];
              const updatedExpenses = existingExpenses.filter((expense) => expense.id !== expenseId);
              await updateDoc(docRef, { expenses: updatedExpenses });
            }
          }


        async function batch(resource, items, action = 'create') {
            return new Promise(async (resolve, reject) => {
                const splited = chunkArray(items, 499);

                for (const [i, spl] of splited.entries()) {
                    const batch = writeBatch(fs);
                    for (const doc of spl) {
                        if (doc) {
                            const id = doc.id || createId();
                            const ref = id !== null ? doc(fs, resource, id) : collection(fs, resource);
                            if (action === 'create') {
                                batch.set(ref, { ...doc, uid: user.uid });
                            } else if (action === 'update') {
                                const docRef = doc(fs, resource, doc.id);
                                const docData = await getDoc(docRef);
                                const updatedData = { ...docData.data(), ...doc };
                                batch.set(docRef, updatedData);
                            } else if (action === 'delete') {
                                batch.delete(ref);
                            }
                        }
                    }
                    try {
                        await batch.commit();
                        resolve(true);
                        console.log(resource, items.length, i);
                    } catch (e) {
                        console.log('# ERRO:', e.message);
                        reject(e.message);
                    }
                }
            });
        }

        return {
            createId,
            list,
            create,
            update,
            remove,
            batch,
            createExpense,
            submitExpensesForValidation
        }
    }
    if (!window._fire) {
        fFirestore = createFirestoreInstance();
        window._fire = fFirestore;
    } else fFirestore = window._fire;
    return fFirestore;
}
