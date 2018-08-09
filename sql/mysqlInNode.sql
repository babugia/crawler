use champion_prediction;
show tables;

drop table matches;

drop database tcc;

use tcc;
select * from events ;

select * from matches where eventName="IEM Sydney 2018";

SELECT COUNT(*)  FROM matches where map ='';