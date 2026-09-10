// src/views/CartaView.test.js
import { describe, it, expect, vi } from "vitest";
import { mount, flushPromises } from "@vue/test-utils";
import CartaView from "./CartaView.vue";
import * as productsService from "../services/products.service";

describe("CartaView", () => {
  it("shows a loading state while products are being fetched", async () => {
    vi.spyOn(productsService, "getProducts").mockReturnValue(
      new Promise(() => {}),
    );
    const wrapper = mount(CartaView);
    await flushPromises();

    expect(wrapper.text()).toContain("Cargando la carta");
  });

  it("shows an error message when the request fails", async () => {
    vi.spyOn(productsService, "getProducts").mockRejectedValue(
      new Error("network error"),
    );
    const wrapper = mount(CartaView);
    await flushPromises();

    expect(wrapper.text()).toContain("No se ha podido cargar la carta");
  });

  it("groups the received products by category", async () => {
    vi.spyOn(productsService, "getProducts").mockResolvedValue([
      {
        id: 1,
        name: "Sushi test",
        category: "SUSHI",
        price: 1,
        description: "",
        imageUrl: "",
      },
      {
        id: 2,
        name: "Drink test",
        category: "DRINKS",
        price: 1,
        description: "",
        imageUrl: "",
      },
    ]);
    const wrapper = mount(CartaView);
    await flushPromises();

    expect(wrapper.text()).toContain("Especialidades");
    expect(wrapper.text()).toContain("Sushi test");
    expect(wrapper.text()).toContain("Bebidas");
    expect(wrapper.text()).toContain("Drink test");
  });

  it("shows an empty message for a category with no products", async () => {
    vi.spyOn(productsService, "getProducts").mockResolvedValue([]);
    const wrapper = mount(CartaView);
    await flushPromises();

    expect(wrapper.text()).toContain(
      "No hay productos disponibles en esta categoría",
    );
  });

  it('calls the add-to-cart handler when a product card emits the event', async () => {
  vi.spyOn(productsService, 'getProducts').mockResolvedValue([
    { id: 1, name: 'Sushi test', category: 'SUSHI', price: 1, description: '', imageUrl: '' },
  ])
  const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {})

  const wrapper = mount(CartaView)
  await flushPromises()
  await wrapper.find('.product-card__add-btn').trigger('click')

  expect(consoleSpy).toHaveBeenCalled()
})
});
