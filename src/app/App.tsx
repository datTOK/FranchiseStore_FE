import { useState } from 'react'
import LoginPage from './login/LoginPage'
import Signup from './login/signup'

type Screen = 'login' | 'signup'

function App() {
  const [screen, setScreen] = useState<Screen>('login')

  if (screen === 'signup') {
    return <Signup onLoginClick={() => setScreen('login')} />
  }

  return <LoginPage onSignupClick={() => setScreen('signup')} />
}

export default App
