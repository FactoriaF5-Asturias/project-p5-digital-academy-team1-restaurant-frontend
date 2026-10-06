// src/components/CloudAutomationStatusCard.test.js
import { describe, it, expect, vi, beforeEach } from "vitest";
import { mount, flushPromises } from "@vue/test-utils";
import CloudAutomationStatusCard from "./CloudAutomationStatusCard.vue";
import * as cronStatusService from "../services/cronStatus.service";

describe("CloudAutomationStatusCard", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("shows a loading indicator while fetching", async () => {
    vi.spyOn(cronStatusService, "getCronStatus").mockReturnValue(
      new Promise(() => {}),
    );
    const wrapper = mount(CloudAutomationStatusCard);
    await flushPromises();

    expect(wrapper.text()).toContain("Comprobando el estado del servicio");
  });

  it("shows the online badge and the last sync date on success", async () => {
    vi.spyOn(cronStatusService, "getCronStatus").mockResolvedValue({
      status: "ONLINE",
      lastSyncAt: "2026-10-02T03:00:00",
      lastError: null,
    });
    const wrapper = mount(CloudAutomationStatusCard);
    await flushPromises();

    expect(wrapper.text()).toContain("En línea");
    expect(wrapper.find(".cloud-automation-status__last-error").exists()).toBe(
      false,
    );
  });

  it("shows the error badge and the last registered error when the process failed", async () => {
    vi.spyOn(cronStatusService, "getCronStatus").mockResolvedValue({
      status: "ERROR",
      lastSyncAt: "2026-10-01T03:00:00",
      lastError: "Sin conexión con el almacenamiento en la nube",
    });
    const wrapper = mount(CloudAutomationStatusCard);
    await flushPromises();

    expect(wrapper.text()).toContain("Con errores");
    expect(wrapper.text()).toContain(
      "Sin conexión con el almacenamiento en la nube",
    );
  });

  it("shows an error message when the request to check the status fails", async () => {
    vi.spyOn(cronStatusService, "getCronStatus").mockRejectedValue(
      new Error("network error"),
    );
    const wrapper = mount(CloudAutomationStatusCard);
    await flushPromises();

    expect(wrapper.text()).toContain(
      "No se ha podido comprobar el estado del servicio",
    );
  });

  it("shows an empty-state message when there is no status data", async () => {
    vi.spyOn(cronStatusService, "getCronStatus").mockResolvedValue(null);
    const wrapper = mount(CloudAutomationStatusCard);
    await flushPromises();

    expect(wrapper.text()).toContain(
      "Todavía no hay datos de sincronización disponibles",
    );
  });
  
  it("says the sync has not run yet when there is no last sync date", async () => {
    vi.spyOn(cronStatusService, "getCronStatus").mockResolvedValue({
      status: "ONLINE",
      lastSyncAt: null,
      lastError: null,
    });
    const wrapper = mount(CloudAutomationStatusCard);
    await flushPromises();

    expect(wrapper.find(".cloud-automation-status__sync").text()).toBe(
      "Última sincronización: todavía no se ha ejecutado",
    );
  });
});
