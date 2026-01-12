// 1. Create generic GET and POST methods
export const get = async (url: string) => {
  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      throw new Error(`GET request failed with status ${response.status}`)
    }

    return await response.json()
  } catch (error) {
    console.error('API GET Error:', error)
    throw error
  }
}

export const post = async (url: string, data: any) => {
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    })

    if (!response.ok) {
      throw new Error(`POST request failed with status ${response.status}`)
    }

    return await response.json()
  } catch (error) {
    console.error('API POST Error:', error)
    throw error
  }
}

// 2. Create one login method that internally calls post method
// 3. Use the mentioned URL for the login api call
export const login = async (credentials: any) => {
  const LOGIN_URL = 'https://backend-apis-8yam.onrender.com/login'
  // Passes the object (credentials) coming from where the function is called
  return await post(LOGIN_URL, credentials)
}