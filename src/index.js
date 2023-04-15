import { Router } from '@fastly/expressly'
const router = new Router()

// Use middleware to set a header
router.use((req, res) => {
  res.set('x-powered-by', 'svn.io')
})

// GET 200 response
router.get('/', (req, res) => {
  res.sendStatus(200) // "OK"
})

// Hookdeck queue system test
router.post('/hook', async (req, res) => {
  // get body from request
  let body = await req.json()
  console.log(body)

  // res.json({
  //   message: 'got.',
  // })

  res.send(
    await fetch(`https://events.hookdeck.com/e/src_2b71Ub8nItLO`, {
      backend: 'hookdeck',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    })
  )

  // res.send(response)
})

router.get('/check/:customerId/:featureId', async (req, res) => {
  const customerId = req.params.customerId
  const featureId = req.params.featureId

  // get tenantKey from headers
  const tenantKey = req.headers.get('x-tenant-key')

  // Cache-Control: no-store prevents browsers from writing the object to disk.
  // We add 'private' in case there are any public caches downstream of Fastly,
  // between us and the browser, which might perform request collapsing on public content
  resp.headers.set('cache-control', 'private, no-store')

  // Remove all other caching-related response headers
  resp.headers.delete('expires')
  resp.headers.delete('etag')
  resp.headers.delete('last-modified')

  res.send(
    await fetch(
      `https://api.svn.sh/api/client/check-feature?customerId=${customerId}&featureId=${featureId}`,
      {
        backend: 'vercel',
        headers: {
          'x-tenant-key': tenantKey,
          'Content-Type': 'application/json',
        },
        cacheOverride: new CacheOverride('override', {
          ttl: 36000000,
          surrogateKey: `check-feature ${tenantKey} ${customerId} ${featureId}`,
        }),
      }
    )
  )
})

router.get('/check-limit/:customerId/:featureId', async (req, res) => {
  const customerId = req.params.customerId
  const featureId = req.params.featureId

  // get tenantKey from headers
  const tenantKey = req.headers.get('x-tenant-key')

  // set - do not store in browser
  res.headers.set('Cache-Control', 'private, no-store')

  // return origin
  res.send(
    await fetch(
      `https://api.svn.sh/api/client/check-feature-limit?customerId=${customerId}&featureId=${featureId}`,
      {
        // backend,
        backend: 'vercel',
        headers: {
          'x-tenant-key': tenantKey,
          'Content-Type': 'application/json',
          cacheOverride: new CacheOverride('override', {
            ttl: 36000000,
            surrogateKey: `check-feature-limit ${tenantKey} ${customerId} ${featureId}`,
          }),
        },
      }
    )
  )
})

// 404/405 response for everything else

router.listen()
