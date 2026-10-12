const { neon } = require('@neondatabase/serverless')

const q = process.argv[2]
if (!q) {
  console.log('Uso: node --env-file=.env.local db/run.js "SQL"')
  process.exit(1)
}

neon(process.env.DATABASE_URL)
  .query(q)
  .then(r => {
    if (Array.isArray(r) && r.length) console.table(r)
    else console.log('OK')
  })
  .catch(e => console.log('ERROR:', e.message))