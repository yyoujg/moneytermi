with periods(label,start_date,end_date) as (values ('previous','2026-10-02'::date,'2026-10-08'::date),('latest','2026-10-09'::date,'2026-10-15'::date)),
stats as (select label,start_date,end_date,
(select count(distinct user_id) from attendance where date between start_date and end_date) attendance_users,
(select count(*) from attendance where date between start_date and end_date) attendance_user_days,
(select count(*) from profiles where (created_at at time zone 'Asia/Seoul')::date between start_date and end_date) new_profiles,
(select count(distinct user_id) from daily_missions where date between start_date and end_date and mission_id='m2' and current>0) new_word_mission_users,
(select count(distinct user_id) from daily_missions where date between start_date and end_date and mission_id='m3' and current>0) quiz_correct_mission_users,
(select count(distinct user_id) from daily_missions where date between start_date and end_date and mission_id='m5' and current>0) card_mission_users,
(select count(distinct user_id) from energy_refill_requests where (created_at at time zone 'Asia/Seoul')::date between start_date and end_date) energy_purchase_users
from periods),
cohort as (select id,(created_at at time zone 'Asia/Seoul')::date d from profiles where (created_at at time zone 'Asia/Seoul')::date between '2026-10-02' and '2026-10-14'),
retention as (select case when d<='2026-10-08' then 'previous' else 'latest_mature' end period,count(*) denominator,count(*) filter(where exists(select 1 from attendance a where a.user_id=cohort.id and a.date=cohort.d+1)) d1_attendance,count(*) filter(where exists(select 1 from daily_missions m where m.user_id=cohort.id and m.date=cohort.d+1 and m.mission_id in ('m2','m3','m5') and m.current>0)) d1_learning_proxy from cohort group by 1)
select jsonb_build_object('observed_at',now(),'periods',(select jsonb_agg(stats) from stats),'d1',(select jsonb_agg(retention) from retention),'total_profiles',(select count(*) from profiles),'total_words',(select count(*) from words),'latest_word_updates_users',(select count(distinct user_id) from word_progress where updated_at>='2026-10-09 00:00:00+09' and updated_at<'2026-10-16 00:00:00+09')) metrics;
