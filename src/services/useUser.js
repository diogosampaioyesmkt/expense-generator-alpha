// Create a composable named 'useUser' to fetch user data from the expenses collection
import { ref, onMounted } from 'vue'
import { projectFirestore } from '@/firebase/config'

const useUser = () => {
  const users = ref([])

  // Fetch the expenses data from the collection and create users based on the emails
  const loadUsers = async () => {
    try {
      const response = await projectFirestore
        .collection('testediogo/yes/testediogo/expenses')
        .get()

      const emails = new Set()
      const usersMap = new Map()

      // Iterate over the expenses to collect unique emails and associated expenses
      response.docs.forEach((doc) => {
        const expense = doc.data()
        const email = expense.email

        if (!emails.has(email)) {
          emails.add(email)
          usersMap.set(email, { email, expenses: [] })
        }

        usersMap.get(email).expenses.push(expense)
      })

      // Convert the Map of users into an array
      users.value = Array.from(usersMap.values())
    } catch (error) {
      console.error('Error fetching users:', error)
      users.value = []
    }
  }

  // Load the user data when the component is mounted
  onMounted(loadUsers)

  return { users }
}

export default useUser
