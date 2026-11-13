-- Configuración editable desde el admin
create table if not exists config (
  clave    text primary key,
  valor    text not null,
  actualizado_en timestamptz default now()
);

-- Códigos de invitación
create table if not exists invitaciones (
  id         serial primary key,
  codigo     text unique not null,
  max_usos   int  default 1,
  usos       int  default 0,
  canal      text,
  nota       text,
  activo     boolean default true,
  expira_en  timestamptz,
  creado_en  timestamptz default now()
);

-- Gente que pidió acceso desde la landing
create table if not exists lista_espera (
  id        serial primary key,
  contacto  text not null,
  estado    text default 'pendiente',
  creado_en timestamptz default now()
);

-- Quien ya entró
create table if not exists miembros (
  id            serial primary key,
  contacto      text,
  invitacion_id int references invitaciones(id),
  creado_en     timestamptz default now()
);

-- Drops
create table if not exists drops (
  id           serial primary key,
  numero       text not null,
  nombre       text,
  descripcion  text,
  specs        text,
  precio_cent  int  not null,
  unidades     int  not null default 25,
  estado       text not null default 'borrador',
  abre_en      timestamptz,
  cierra_en    timestamptz,
  creado_en    timestamptz default now()
);

-- Tallas y stock
create table if not exists variantes (
  id      serial primary key,
  drop_id int references drops(id) on delete cascade,
  talla   text not null,
  stock   int  not null default 0
);

-- Fotos del drop
create table if not exists fotos (
  id      serial primary key,
  drop_id int references drops(id) on delete cascade,
  url     text not null,
  orden   int default 0
);

-- Pedidos (web y manuales)
create table if not exists pedidos (
  id           serial primary key,
  drop_id      int references drops(id),
  variante_id  int references variantes(id),
  miembro_id   int references miembros(id),
  nombre       text,
  contacto     text,
  ciudad       text,
  direccion    text,
  envio_cent   int default 0,
  total_cent   int not null,
  estado       text not null default 'pendiente',
  origen       text not null default 'web',
  es_canje     boolean default false,
  nota         text,
  creado_en    timestamptz default now(),
  pagado_en    timestamptz
);

-- Camisetas gratis ya reclamadas
create table if not exists canjes (
  id         serial primary key,
  miembro_id int references miembros(id),
  pedido_id  int references pedidos(id),
  usado_en   timestamptz default now()
);

create index if not exists idx_pedidos_miembro on pedidos(miembro_id, estado);
create index if not exists idx_variantes_drop  on variantes(drop_id);

-- Valores iniciales
insert into config (clave, valor) values
  ('whatsapp',          '0999999999'),
  ('banco',             'Banco Pichincha'),
  ('cuenta_titular',    'Civis Brand'),
  ('cuenta_numero',     'PENDIENTE'),
  ('cuenta_tipo',       'Ahorros'),
  ('ciudades_sin_envio','Quito,Riobamba'),
  ('envio_nacional_cent','700'),
  ('proximamente',      'Próximamente · Drop V'),
  ('drops_para_gratis', '2')
on conflict (clave) do nothing;
