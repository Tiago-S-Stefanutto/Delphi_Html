create database Quimica

use Quimica

create table grupo (
	grupoId int identity(1,1) primary key,
	descricao varchar(50) not null
);

create table periodo (
	periodoId int identity(1,1) primary key,
	descricao varchar(50) not null
);

create table familia (
	familiaId int identity(1,1) primary key,
	descricao varchar(50) not null
);

create table categoria_quimica (
	categoria_quimicaId int identity(1,1) primary key,
	descricao varchar(50) not null
);

create table elemento (
	elementoId int identity(1,1) primary key,
	numero_atomico int not null unique,
	simbolo varchar(5) not null unique,
	nome varchar(50) not null unique,
	massa_atomica decimal (10,4),

	grupo_id int not null,
	periodo_id int not null,
	familia_id int,
	categoria_quimica_id int,

	constraint  fk_elemento_grupo
		foreign key (grupo_id) references grupo(grupoId),

	constraint  fk_elemento_periodo
		foreign key (periodo_id) references periodo(periodoId),

	constraint  fk_elemento_familia
		foreign key (familia_id) references familia(familiaId),

	constraint fk_elemento_categoria_quimica
		foreign key (categoria_quimica_id) references categoria_quimica(categoria_quimicaId)
);

drop table elemento
drop table grupo
drop table periodo
drop table familia
drop table categoria_quimica

select * from elemento
select * from grupo
select * from periodo
select * from familia
select * from categoria_quimica
use vendas