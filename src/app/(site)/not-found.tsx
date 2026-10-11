import {NotFoundContent} from '@/components/NotFoundContent'
import {SiteHeader} from '@/components/SiteHeader'

// Shown when a project or journal entry doesn't exist (inside the normal site layout).
export default function NotFound() {
  return (
    <>
      <SiteHeader />
      <NotFoundContent />
    </>
  )
}
