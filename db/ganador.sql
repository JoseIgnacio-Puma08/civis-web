update config set valor = 'II' where clave = 'aniversario_ganador';

update config set valor = '0' where clave = 'votacion_activa';

delete from fotos
where drop_id = (select id from drops where numero = 'ANIV');

insert into fotos (drop_id, url, orden)
select d.id, f.url, f.orden
from drops d
cross join (values
  ('/aniv-1.webp', 1),
  ('/aniv-2.webp', 2),
  ('/aniv-3.webp', 3),
  ('/aniv-4.webp', 4),
  ('/aniv-5.webp', 5)
) as f(url, orden)
where d.numero = 'ANIV';

update drops set nombre = 'Edicion Aniversario' where numero = 'ANIV';

update drops set estado = 'proximamente' where numero = 'ANIV';
