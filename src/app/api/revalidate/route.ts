import {revalidateTag} from 'next/cache'
import {parseBody} from 'next-sanity/webhook'
import {type NextRequest, NextResponse} from 'next/server'

/**
 * Sanity webhook (on publish/unpublish/delete) → expire every cached Sanity fetch.
 * Sanity Live already refreshes pages while someone has the site open; this
 * covers publishes made while nobody is on it. The site is small, so expiring
 * everything is simpler and safer than working out which pages a change touches.
 */
export async function POST(request: NextRequest) {
  const secret = process.env.SANITY_REVALIDATE_SECRET
  if (!secret) return NextResponse.json({message: 'SANITY_REVALIDATE_SECRET is not set'}, {status: 500})

  const {isValidSignature, body} = await parseBody<{_type?: string; _id?: string}>(request, secret, true)
  if (!isValidSignature) return NextResponse.json({message: 'Invalid signature'}, {status: 401})

  revalidateTag('sanity', {expire: 0})
  return NextResponse.json({revalidated: true, type: body?._type ?? null, id: body?._id ?? null, now: Date.now()})
}
