import { createServerFn } from "@tanstack/react-start";
import * as serverApi from "../server/api";
export type { OrderData, SafeUser } from "../server/api";

// ==================== USER AUTH FUNCTIONS ====================

export const registerUserFn = createServerFn({ method: "POST" })
  .inputValidator((data: { name: string; email: string; phone: string; password: string }) => data)
  .handler(async ({ data }) => {
    return await serverApi.registerUser(data);
  });

export const loginUserFn = createServerFn({ method: "POST" })
  .inputValidator((data: { identifier: string; password: string }) => data)
  .handler(async ({ data }) => {
    return await serverApi.loginUser(data);
  });

export const verifyUserTokenFn = createServerFn({ method: "POST" })
  .inputValidator((data: { token: string }) => data)
  .handler(async ({ data }) => {
    return serverApi.verifyUserToken(data.token);
  });

// ==================== ADMIN AUTH ====================

export const adminLoginFn = createServerFn({ method: "POST" })
  .inputValidator((data: { username: string; password: string }) => data)
  .handler(async ({ data }) => {
    return await serverApi.adminLogin(data);
  });

export const adminVerifyFn = createServerFn({ method: "POST" })
  .inputValidator((data: { token: string }) => data)
  .handler(async ({ data }) => {
    return serverApi.verifyAdminToken(data.token);
  });

// ==================== PUBLIC & CMS GAMES ====================

export const getGamesFn = createServerFn({ method: "GET" }).handler(async () => {
  return await serverApi.getAllGames();
});

export const getGameBySlugFn = createServerFn({ method: "GET" })
  .inputValidator((data: { slug: string }) => data)
  .handler(async ({ data }) => {
    return await serverApi.getGameBySlug(data.slug);
  });

export const adminGetAllGamesFn = createServerFn({ method: "GET" }).handler(async () => {
  return await serverApi.adminGetAllGamesRaw();
});

export const adminSaveGameFn = createServerFn({ method: "POST" })
  .inputValidator(
    (data: {
      id?: number;
      slug: string;
      name: string;
      tagline: string;
      image: string;
      badge?: string;
      category: string;
      order_time?: string;
      description: string;
      needs: any[];
      is_active?: boolean;
    }) => data
  )
  .handler(async ({ data }) => {
    return await serverApi.adminSaveGame(data);
  });

export const adminDeleteGameFn = createServerFn({ method: "POST" })
  .inputValidator((data: { id: number }) => data)
  .handler(async ({ data }) => {
    return await serverApi.adminDeleteGame(data.id);
  });

export const adminSavePackageFn = createServerFn({ method: "POST" })
  .inputValidator(
    (data: {
      dbId?: number;
      game_id: number;
      package_id: string;
      name: string;
      price: number;
      popular?: boolean;
    }) => data
  )
  .handler(async ({ data }) => {
    return await serverApi.adminSavePackage(data);
  });

export const adminDeletePackageFn = createServerFn({ method: "POST" })
  .inputValidator((data: { id: number }) => data)
  .handler(async ({ data }) => {
    return await serverApi.adminDeletePackage(data.id);
  });

// ==================== ORDERS & CHECKOUT ====================

export const createOrderFn = createServerFn({ method: "POST" })
  .inputValidator(
    (data: {
      user_id?: number | null;
      game_name: string;
      package_name: string;
      amount: number;
      customer_name: string;
      customer_email: string;
      customer_phone: string;
      player_credentials: Record<string, string>;
      payment_method: string;
      payment_sender_number: string;
      transaction_id: string;
    }) => data
  )
  .handler(async ({ data }) => {
    return await serverApi.createOrder(data);
  });

export const getUserOrdersFn = createServerFn({ method: "POST" })
  .inputValidator((data: { userId?: number; phone?: string; email?: string }) => data)
  .handler(async ({ data }) => {
    return await serverApi.getUserOrders(data);
  });

export const adminGetAllOrdersFn = createServerFn({ method: "POST" })
  .inputValidator((data: { status?: string; search?: string }) => data)
  .handler(async ({ data }) => {
    return await serverApi.adminGetAllOrders(data);
  });

export const adminUpdateOrderStatusFn = createServerFn({ method: "POST" })
  .inputValidator(
    (data: {
      orderId: string;
      status: "pending" | "processing" | "completed" | "cancelled";
      adminNotes?: string;
    }) => data
  )
  .handler(async ({ data }) => {
    return await serverApi.adminUpdateOrderStatus(data.orderId, data.status, data.adminNotes);
  });

// ==================== SETTINGS ====================

export const getSiteSettingsFn = createServerFn({ method: "GET" }).handler(async () => {
  return await serverApi.getSiteSettings();
});

export const updateSiteSettingsFn = createServerFn({ method: "POST" })
  .inputValidator((data: { settings: Record<string, string> }) => data)
  .handler(async ({ data }) => {
    return await serverApi.updateSiteSettings(data.settings);
  });
