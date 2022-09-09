select 
	r.id as id, 
	p.title as name,
	p.cost_per_night as cost_per_night,
	r.start_date as start_date,
	round(avg(pr.rating),1) as average_rating
	
from reservations as r
join properties as p on p.id = r.property_id
join property_reviews as pr on pr.property_id = r.property_id
where r.guest_id = 1
group by r.id, p.title, p.cost_per_night
order by r.start_date desc
;