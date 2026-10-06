import { describe, it, expect, vi, beforeEach } from "vitest";
import { getExclusiveOffers, consumeOffer } from "./offers.service";
import api from "./api";

vi.mock("./api", () => ({
  default: {
    get: vi.fn(),
    patch: vi.fn(),
  },
}));

describe("offers.service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("requests the real exclusive offers endpoint", async () => {
    api.get.mockResolvedValue({ data: [] });

    await getExclusiveOffers();

    expect(api.get).toHaveBeenCalledWith("/api/v1/offers");
  });

  it("returns the response data as-is", async () => {
    const offers = [
      { id: 1, used: false, product: { id: 1, name: "Hello Edamame" } },
    ];
    api.get.mockResolvedValue({ data: offers });

    const result = await getExclusiveOffers();

    expect(result).toEqual(offers);
  });

  it("requests the consume endpoint with the coupon in the path", async () => {
    const updatedOffer = {
      id: 1,
      used: true,
      coupon: "a1b2c3d4-0000-0000-0000-000000000000",
    };
    api.patch.mockResolvedValue({ data: updatedOffer });

    const result = await consumeOffer("a1b2c3d4-0000-0000-0000-000000000000");

    expect(api.patch).toHaveBeenCalledWith(
      "/api/v1/offers/consume/a1b2c3d4-0000-0000-0000-000000000000",
    );
    expect(result).toEqual(updatedOffer);
  });
});
