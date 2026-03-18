import { Providers } from '@/app/Providers'
import { AppRouter } from '@/app/Router'

function App() {
  return (
    <Providers>
      <AppRouter />
    </Providers>
  )
}

export default App
