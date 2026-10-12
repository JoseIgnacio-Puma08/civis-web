create table if not exists candidatos (
  id serial primary key,
  numero text not null unique,
  nombre text,
  foto_url text,
  orden int default 0,
  activo boolean default true
);

create table if not exists votos (
  id serial primary key,
  candidato_id int references candidatos(id) on delete cascade,
  votante text not null,
  creado_en timestamptz default now()
);

create unique index if not exists idx_voto_unico on votos(votante);

insert into config (clave, valor) values
  ('votacion_activa', '1'),
  ('votacion_titulo', 'Un año de Civis'),
  ('votacion_bajada', 'Relanzamos uno. Vota cuál.')
on conflict (clave) do nothing;

insert into candidatos (numero, nombre, foto_url, orden) values
  ('I',   'Drop I · Morado',      '/drop1.webp', 1),
  ('II',  'Drop II · Negro',      '/drop2.webp', 2),
  ('III', 'Drop III · Need Money For a Civis','/drop3.webp', 3),
  ('IV',  'Drop IV · Estrellas',  '/drop4.webp', 4)
on conflict (numero) do nothing;