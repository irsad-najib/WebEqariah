import { axiosInstance } from "@/lib/utils/api";
import type { Kitab } from "@/lib/types";

type ListResponse =
  | { success?: boolean; data?: Kitab[] }
  | Kitab[]
  | { data?: Kitab[] };

export async function fetchAllKitabs(): Promise<Kitab[]> {
  const res = await axiosInstance.get<ListResponse>("/api/kitab/", {
    withCredentials: true,
  });

  const payload: any = res.data;
  if (Array.isArray(payload)) return payload;
  if (Array.isArray(payload?.data)) return payload.data;
  if (Array.isArray(payload?.data?.data)) return payload.data.data;
  return [];
}

export async function updateKitabStatus(
  kitabId: number,
  status: "approved" | "rejected" | "pending"
): Promise<void> {
  await axiosInstance.put(
    `/api/kitab/${kitabId}/status`,
    { status },
    { withCredentials: true }
  );
}

export async function deleteKitab(kitabId: number): Promise<void> {
  await axiosInstance.delete(`/api/kitab/${kitabId}`, {
    withCredentials: true,
  });
}
