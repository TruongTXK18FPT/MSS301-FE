import { apiFetch } from "@/lib/api";

export type Province = { code: string; name: string; type: string };
export type Ward = { code: string; name: string; type: string; province_code: string };

export const AddressAPI = {
  getProvinces: async () => {
    const res = await apiFetch<{ success: boolean; data: Province[] }>(`/profile/addresses/provinces`);
    return res;
  },
  getWardsByProvince: async (provinceCode: string) => {
    const res = await apiFetch<{ success: boolean; data: Ward[] }>(`/profile/addresses/provinces/${provinceCode}/wards`);
    return res;
  },
};




