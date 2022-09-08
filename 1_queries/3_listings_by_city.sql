select 
	properties.id, title,cost_per_night, avg(pr.rating)
from properties
join property_reviews as pr on pr.property_id = properties.id

where city = 'Vancouver'
having avg(pr.rating) > 3.99
group by properties.id
order by cost_per_night asc

limit 10
;