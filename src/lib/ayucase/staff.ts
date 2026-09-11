import { supabase } from "@/integrations/supabase/client";

export interface StaffAccess {
  isStaff: boolean;
  isAdmin: boolean;
  requestStatus: "none" | "pending" | "approved";
}

export interface StaffRequest {
  userId: string;
  email: string;
  status: string;
  createdAt: string;
  isStaff: boolean;
}

/** Reads the signed-in person's console access. */
export async function fetchStaffAccess(userId: string): Promise<StaffAccess> {
  const [roles, request] = await Promise.all([
    supabase.from("user_roles").select("role").eq("user_id", userId),
    supabase.from("staff_requests").select("status").eq("user_id", userId).maybeSingle(),
  ]);
  const list = roles.data?.map((r) => r.role) ?? [];
  const status = request.data?.status;
  return {
    isStaff: list.includes("staff"),
    isAdmin: list.includes("admin"),
    requestStatus: status === "approved" ? "approved" : status === "pending" ? "pending" : "none",
  };
}

/** Asks a clinic admin for console access. The first ever requester becomes the clinic admin. */
export async function requestStaffAccess(): Promise<{ status: string | null; error?: string }> {
  const { data, error } = await supabase.rpc("request_staff_access");
  if (error) return { status: null, error: error.message };
  return { status: data };
}

/** Admin only: everyone who has asked for console access. */
export async function listStaffRequests(): Promise<StaffRequest[]> {
  const [requests, roles] = await Promise.all([
    supabase.from("staff_requests").select("user_id, email, status, created_at").order("created_at"),
    supabase.from("user_roles").select("user_id, role"),
  ]);
  const staffIds = new Set(
    (roles.data ?? []).filter((r) => r.role === "staff").map((r) => r.user_id),
  );
  return (requests.data ?? []).map((r) => ({
    userId: r.user_id,
    email: r.email,
    status: r.status,
    createdAt: r.created_at,
    isStaff: staffIds.has(r.user_id),
  }));
}

export async function approveStaff(userId: string): Promise<string | null> {
  const { error } = await supabase.rpc("approve_staff_request", { _user_id: userId });
  return error?.message ?? null;
}

export async function revokeStaff(userId: string): Promise<string | null> {
  const { error } = await supabase.rpc("revoke_staff_request", { _user_id: userId });
  return error?.message ?? null;
}
