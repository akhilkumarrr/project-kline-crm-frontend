import { ContractsWorkspace } from '../components/contracts/ContractsWorkspace'
import { QuotesWorkspace } from '../components/quotes/QuotesWorkspace'

type RevenuePageProps = {
  activeView: string
}

export function RevenuePage({ activeView }: RevenuePageProps) {
  if (activeView === 'contracts') {
    return <ContractsWorkspace />
  }

  return <QuotesWorkspace />
}
