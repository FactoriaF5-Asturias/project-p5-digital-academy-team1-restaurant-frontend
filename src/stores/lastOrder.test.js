import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { createPinia, setActivePinia } from "pinia";
import { useLastOrderStore, LAST_ORDER_MAX_AGE_MS } from "./lastOrder";

const STORAGE_KEY = "gitsushi-last-order";

describe("useLastOrderStore", () => {
  beforeEach(() => {
    localStorage.clear();
    setActivePinia(createPinia());
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("starts with no order", () => {
    const lastOrderStore = useLastOrderStore();

    expect(lastOrderStore.order).toBeNull();
    expect(lastOrderStore.ticketReference).toBeNull();
  });

  it("stores the confirmed order", () => {
    const lastOrderStore = useLastOrderStore();
    const order = { id: 1, total: 24.4, paymentStatus: "PENDING_CASH" };

    lastOrderStore.setOrder(order);

    expect(lastOrderStore.order).toEqual(order);
  });

  it("overwrites a previously stored order", () => {
    const lastOrderStore = useLastOrderStore();
    lastOrderStore.setOrder({ id: 1, total: 24.4 });

    lastOrderStore.setOrder({ id: 2, total: 8.5 });

    expect(lastOrderStore.order).toEqual({ id: 2, total: 8.5 });
  });

  it("clears the stored order", () => {
    const lastOrderStore = useLastOrderStore();
    lastOrderStore.setOrder({ id: 1, total: 24.4 });

    lastOrderStore.clearOrder();

    expect(lastOrderStore.order).toBeNull();
    expect(lastOrderStore.ticketReference).toBeNull();
    expect(localStorage.getItem(STORAGE_KEY)).toBeNull();
  });

  it("keeps the ticket reference (id and access token) of the confirmed order", () => {
    const lastOrderStore = useLastOrderStore();

    lastOrderStore.setOrder({ id: 42, ticketAccessToken: "abc-123" });

    expect(lastOrderStore.ticketReference).toEqual({ id: 42, token: "abc-123" });
  });

  it("restores the ticket reference after a page reload", () => {
    useLastOrderStore().setOrder({ id: 42, ticketAccessToken: "abc-123" });

    setActivePinia(createPinia());
    const reloadedStore = useLastOrderStore();

    expect(reloadedStore.order).toBeNull();
    expect(reloadedStore.ticketReference).toEqual({ id: 42, token: "abc-123" });
  });

  it("forgets a stored reference that is too old (shared tablets)", () => {
    vi.useFakeTimers();
    useLastOrderStore().setOrder({ id: 42, ticketAccessToken: "abc-123" });

    vi.advanceTimersByTime(LAST_ORDER_MAX_AGE_MS + 1);
    setActivePinia(createPinia());

    expect(useLastOrderStore().ticketReference).toBeNull();
    expect(localStorage.getItem(STORAGE_KEY)).toBeNull();
  });
});