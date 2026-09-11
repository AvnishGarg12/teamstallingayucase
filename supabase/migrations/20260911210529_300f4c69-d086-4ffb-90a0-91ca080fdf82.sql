revoke execute on function public.has_role(uuid, public.app_role) from anon, public;
grant execute on function public.has_role(uuid, public.app_role) to authenticated;
revoke execute on function public.request_staff_access() from anon, public;
revoke execute on function public.approve_staff_request(uuid) from anon, public;
revoke execute on function public.revoke_staff_request(uuid) from anon, public;
revoke execute on function public.set_updated_at() from anon, authenticated, public;
grant execute on function public.request_staff_access() to authenticated;
grant execute on function public.approve_staff_request(uuid) to authenticated;
grant execute on function public.revoke_staff_request(uuid) to authenticated;