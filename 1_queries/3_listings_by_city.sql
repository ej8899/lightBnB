select 
	properties.id, title,cost_per_night, avg(pr.rating) as avg_rating
from properties
left join property_reviews as pr on pr.property_id = properties.id

WHERE city LIKE '%ancouv%'
group by properties.id
HAVING avg(pr.rating) >= 4

order by cost_per_night asc

limit 10
;