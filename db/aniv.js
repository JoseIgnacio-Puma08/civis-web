// Exporta los pedidos PAGADOS de la Edicion Aniversario a db/aniv.json
// Uso:  node --env-file=.env.local db/aniv.js
const { neon } = require('@neondatabase/serverless')
const fs = require('fs')
const path = require('path')

neon(process.env.DATABASE_URL)
  .query(`
    select p.id, p.nombre, p.contacto, p.ciudad, v.talla, p.estado,
           p.envio_cent, p.total_cent, p.origen, p.creado_en
    from pedidos p
    left join variantes v on v.id = p.variante_id
    join drops d on d.id = p.drop_id
    where d.numero = 'ANIV' and p.estado = 'pagado'
    order by p.id
  `)
  .then(r => {
    const destino = path.join(__dirname, 'aniv.json')
    fs.writeFileSync(destino, JSON.stringify(r, null, 2))
    console.log('Listo: ' + r.length + ' pedidos pagados -> db/aniv.json')
  })
  .catch(e => console.log('ERROR:', e.message))
