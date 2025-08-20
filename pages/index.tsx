import ActionStatus from '../components/ActionStatus'
import DeployControls from '../components/DeployControls'
import DeployProgressList from '../components/DeployProgressList'
import SummaryCard from '../components/SummaryCard'
import { DeployProvider } from '../context/DeployContext'

export default function Home() {
  return (
    <DeployProvider>
      <main className="container">
        <h1 style={{ marginTop: 0, marginBottom: 16 }}>Rate Deployer</h1>
        <p style={{ marginTop: 0, color: 'var(--muted)' }}>
          Deploy Shopify shipping rates across multiple zones.
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <DeployControls />
          <ActionStatus />
          <SummaryCard />
          <DeployProgressList />
        </div>
      </main>
    </DeployProvider>
  )
}
