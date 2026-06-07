const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

export async function api<T>(path: string, init: RequestInit = {}): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    ...init,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...(init.headers || {}),
    },
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export type DashboardStats = {
  total_members?: number;
  totalMembers?: number;
  active_members?: number;
  activeMembers?: number;
  due_members?: number;
  dueMembers?: number;
  expiring_soon?: number;
  expiringSoon?: number;
  expired_members?: number;
  expiredMembers?: number;
  today_collection?: number;
  todayCollection?: number;
  monthly_collection?: number;
  monthlyCollection?: number;
};
