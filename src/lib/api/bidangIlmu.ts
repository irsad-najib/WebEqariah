import { axiosInstance } from "../utils/api";

export interface BidangIlmu {
  id: number;
  name: string;
  slug: string;
  description?: string;
  created_by: number;
  created_at: string;
  updated_at: string;
}

export interface CreateBidangIlmuRequest {
  name: string;
  description?: string;
}

export interface UpdateBidangIlmuRequest {
  name?: string;
  description?: string;
}

export interface BidangIlmuResponse {
  success: boolean;
  data: BidangIlmu[];
  message?: string;
}

export interface SingleBidangIlmuResponse {
  success: boolean;
  data: BidangIlmu;
  message?: string;
}

/**
 * Fetch all bidang ilmu
 */
export async function fetchBidangIlmu(): Promise<BidangIlmu[]> {
  try {
    const response =
      await axiosInstance.get<BidangIlmuResponse>("/api/bidang-ilmu");
    return response.data.data || [];
  } catch (error) {
    console.error("Error fetching bidang ilmu:", error);
    return [];
  }
}

/**
 * Create a new bidang ilmu
 */
export async function createBidangIlmu(
  data: CreateBidangIlmuRequest,
): Promise<SingleBidangIlmuResponse> {
  const response = await axiosInstance.post<SingleBidangIlmuResponse>(
    "/api/bidang-ilmu",
    data,
    { withCredentials: true },
  );
  return response.data;
}

/**
 * Update an existing bidang ilmu
 */
export async function updateBidangIlmu(
  id: number,
  data: UpdateBidangIlmuRequest,
): Promise<SingleBidangIlmuResponse> {
  const response = await axiosInstance.put<SingleBidangIlmuResponse>(
    `/api/bidang-ilmu/${id}`,
    data,
    { withCredentials: true },
  );
  return response.data;
}

/**
 * Delete a bidang ilmu
 */
export async function deleteBidangIlmu(id: number): Promise<void> {
  await axiosInstance.delete(`/api/bidang-ilmu/${id}`, {
    withCredentials: true,
  });
}
