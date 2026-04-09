import { z } from "zod";
import { createServerFn } from "@tanstack/react-start";

import {
  getGuestOrderDetail,
  getLicensesForCurrentUser,
  getMockPaymentAttempt,
  getOrderDetailForCurrentUser,
  getOrdersForCurrentUser,
} from "@/modules/orders/orders.server";

export const getMyOrders = createServerFn({ method: "GET" }).handler(async () => {
  return getOrdersForCurrentUser();
});

export const getMyOrderDetail = createServerFn({ method: "GET" })
  .inputValidator(z.object({ publicId: z.string().min(1) }))
  .handler(async ({ data }) => {
    return getOrderDetailForCurrentUser(data.publicId);
  });

export const getGuestOrder = createServerFn({ method: "GET" })
  .inputValidator(z.object({ publicId: z.string().min(1), token: z.string().min(1) }))
  .handler(async ({ data }) => {
    return getGuestOrderDetail(data.publicId, data.token);
  });

export const getMyLicenses = createServerFn({ method: "GET" }).handler(async () => {
  return getLicensesForCurrentUser();
});

export const getMockPayment = createServerFn({ method: "GET" })
  .inputValidator(z.object({ publicId: z.string().min(1), guestToken: z.string().min(1).optional() }))
  .handler(async ({ data }) => {
    return getMockPaymentAttempt(data.publicId, data.guestToken);
  });
