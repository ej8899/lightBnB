select distinct p.city as city,
	count(res.id) as total_reservations
from properties as p
join reservations as res on res.property_id = p.id
group by p.city
order by total_reservations desc
;