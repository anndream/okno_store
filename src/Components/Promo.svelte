<script>
  import { querystring } from "svelte-spa-router";
  import { orders } from "../stores.js";
  import { getPromo } from "../api.js";
  import { onMount } from "svelte";
  let lastOrder;
  let secondsSinceLastOrder;
  let promo = "";
  orders.subscribe(value => {
    lastOrder = Array.from(value.keys()).slice(-1)[0];
    let lastOrderTime = value.get(lastOrder);
    secondsSinceLastOrder = (new Date() - new Date(lastOrderTime)) / 1000;
  });
  onMount(async () => {
    getPromo().then(value => {
      promo = value.content.replace(/<[^>]*>?/gm, "");
    });
  });
</script>

<style>
  section.promo {
    min-height: 1.5rem;
    grid-area: promo;
    background-color: yellow;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  section.promo span {
    text-align: center;
    font-size: 0.7rem;
    letter-spacing: 0.05rem;
  }

  section.promo span .order {
    font-size: 0.8rem;
  }
</style>

<section class="promo">
  {#if secondsSinceLastOrder < 10}
    <span class="order">заказ №{lastOrder} принят - мы позвоним</span>
  {:else}
    <span>
      {@html promo.toLowerCase()}
    </span>
  {/if}
</section>
