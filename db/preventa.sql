insert into config (clave, valor) values
  ('preventa_titulo', 'Edicion Aniversario'),
  ('preventa_bajada', 'Un ano de Civis. El drop que ustedes eligieron, vuelve.'),
  ('preventa_envio_gratis_hasta', '5'),
  ('preventa_abre', 'Hoy 20:00'),
  ('aniversario_ganador', '')
on conflict (clave) do nothing;

insert into drops (numero, nombre, precio_cent, unidades, estado)
values ('ANIV', 'Edicion Aniversario', 2500, 25, 'proximamente')
on conflict (numero) do nothing;

insert into variantes (drop_id, talla, stock)
select d.id, t.talla, 999
from drops d
cross join (values ('S'), ('M'), ('L')) as t(talla)
where d.numero = 'ANIV'
  and not exists (
    select 1 from variantes v where v.drop_id = d.id and v.talla = t.talla
  );

delete from variantes
where talla = 'XL'
  and drop_id = (select id from drops where numero = 'ANIV');
