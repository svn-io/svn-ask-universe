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

router.get('/check/:customerId/:featureId', async (req, res) => {
  const customerId = req.params.customerId
  const featureId = req.params.featureId

  // get tenantKey from headers
  const tenantKey = req.headers.get('x-tenant-key')

  let response = await fetch(
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

  // set - do not store in browser
  res.headers.set('Cache-Control', 'private, no-store')

  res.send(response)
})

router.get('/check-limit/:customerId/:featureId', async (req, res) => {
  const customerId = req.params.customerId
  const featureId = req.params.featureId

  // get tenantKey from headers
  const tenantKey = req.headers.get('x-tenant-key')

  let response = await fetch(
    `https://api.svn.sh/api/client/check-feature-limit?customerId=${customerId}&featureId=${featureId}`,
    {
      // backend,
      backend: 'vercel',
      headers: {
        'x-tenant-key': tenantKey,
        'Content-Type': 'application/json',
        cacheOverride: new CacheOverride('override', {
          ttl: 36000000,
          surrogateKey: `check-feature ${tenantKey} ${customerId} ${featureId}`,
        }),
      },
    }
  )

  // set - do not store in browser
  res.headers.set('Cache-Control', 'private, no-store')

  res.send(response)
})

// 404/405 response for everything else

router.listen()
