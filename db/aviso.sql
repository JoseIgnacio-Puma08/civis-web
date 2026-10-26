insert into config (clave, valor) values
  ('preventa_aviso', 'Preventa aniversario · hoy 20:00'),
  ('preventa_hora_ganador', '19:00'),
  ('preventa_hora_abre', '20:00')
on conflict (clave) do nothing;

update drops set estado = 'borrador' where numero = 'ANIV';
