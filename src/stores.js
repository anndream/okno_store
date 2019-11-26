import { writable } from "svelte/store";

export const collections = writable({});
export const collectionsArray = writable([]);
export const basket = writable(
  new Map(JSON.parse(localStorage.getItem("basket")))
);
export const deliveryVariants = writable([]);
export const paymentGateways = writable([]);
