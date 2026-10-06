import { describe, it, expect, vi } from "vitest";
import api from "./api";
import { createCheckoutSession, confirmPayment } from "./payments.service";

vi.mock("./api", () => ({
  default: { post: vi.fn() },
}));

describe("payments.service", () => {
  it("requests a checkout session for the given order", async () => {
    const responseData = {
      sessionId: "sess_123",
      checkoutUrl: "https://stripe.test/pay/sess_123",
      paymentStatus: "unpaid",
      orderId: 5,
      amount: 12.5,
    };
    api.post.mockResolvedValue({ data: responseData });

    const result = await createCheckoutSession({
      orderId: 5,
      email: "customer@gitsushi.com",
    });

    expect(api.post).toHaveBeenCalledWith("/api/v1/payments/checkout", {
      orderId: 5,
      email: "customer@gitsushi.com",
    });
    expect(result).toEqual(responseData);
  });

  it("confirms a payment session and returns the updated order", async () => {
    const responseData = { id: 5, status: "PAID" };
    api.post.mockResolvedValue({ data: responseData });

    const result = await confirmPayment("sess_123");

    expect(api.post).toHaveBeenCalledWith("/api/v1/payments/confirm", null, {
      params: { sessionId: "sess_123" },
    });
    expect(result).toEqual(responseData);
  });
});
