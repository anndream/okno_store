<script>
  import {
    basket,
    deliveryVariants,
    paymentGateways,
    productsRaw,
    orders
  } from "../stores.js";
  import { push } from "svelte-spa-router";
  import Button from "./Button.svelte";
  import { addOrder } from "../api.js";
  let products, productsMap, deliveryOptions, paymentOptions;

  let name = "",
    phone = "",
    deliveryOption,
    paymentOption,
    address = "",
    message = {};

  $: {
    deliveryVariants.subscribe(values => {
      deliveryOptions = values;
    });

    paymentGateways.subscribe(values => {
      paymentOptions = values;
    });

    basket.subscribe(map => {
      products = Array.from(map.values());
      productsMap = map;
    });
  }

  const validatePhoneNumber = function() {
    return /\+?[0-9]{11,20}/.test(phone);
  };

  const constructOrderBody = function() {
    // let orderLines = products.map(product => {
    // Rewrite for different variants and quantity
    // return {
    // variant_id: product.variants[0].id,
    // quantity: 1
    // };
    // });
    // let ids = products.map(product => product.id);
    return {
      ids: products.map(product => product.id),
      products: products.map(product => {
        // Rewrite for different variants and quantity
        return {
          variant_id: product.variants[0].id,
          quantity: 1
        };
      }),
      name,
      phone,
      address,
      deliveryOption,
      paymentOption: paymentOptions[0].id
    };
  };
  const handleMissingProducts = function(items) {
    items.forEach(id => {
      let p = productsMap.get(id);
      p.is_hidden = true;
      productsMap.set(id, p);
    });
    return basket.set(new Map(productsMap));
  };
  const handleOrderSuccess = function(number) {
    // Delete products from available products, empty basket, store new order
    productsRaw.update(store => {
      return store.filter(item => !productsMap.has(item.id));
    });
    basket.set(new Map());
    orders.update(o => o.set(number, new Date()));
  };

  const handleSubmit = function(event) {
    if (!validatePhoneNumber()) {
      return (message = { type: "error", text: "Некорректный номер телефона" });
    }
    return addOrder(constructOrderBody())
      .then(result => {
        if (result.status == "missing_products") {
          return handleMissingProducts(result.products);
        }
        if (result.number) {
          handleOrderSuccess(result.number);
          alert(`Заказ №${result.number} оформлен. Мы позвоним`);
          return push("/");
        }
        alert(`Что-то сломалось, позвоните нам, мы оформим заказ`);
      })
      .catch(err => {
        console.log(err);
      });
  };
</script>

<style>
  form {
    align-self: flex-end;
    flex-basis: 100%;
    display: flex;
    flex-wrap: wrap;
    justify-content: flex-end;
    margin: 0 1rem 1rem 1rem;
    padding: 0.5rem 0.5rem;
    border-radius: 1rem;
  }
  form div {
    margin-bottom: 1rem;
  }

  .message {
    flex-basis: 100%;
    margin: 0;
  }
  .message span {
    background-color: yellow;
  }
  form div {
    flex-basis: 100%;
  }
  form .contact {
    display: flex;
  }

  form .delivery {
    display: flex;
  }
  form .payment {
    /* flex-basis: 100%; */
    display: flex;
  }
  form .submit {
    text-align: right;
  }

  form label {
    margin-right: 1rem;
  }

  form input[type="submit"] {
    -webkit-appearance: none;
    padding: 0.2rem 1.3rem;
    background-color: yellow;
    border-radius: 2px;
    box-shadow: 0 2px 3px 0 rgba(0, 0, 0, 0.1), 0 2px 5px 0 rgba(0, 0, 0, 0.05);
    border: none;
    letter-spacing: 0.05rem;
  }

  label,
  input {
    display: inline-block;
  }

  input[type="radio"] {
    margin: 0.1rem 0.5rem 0.2rem 0;
  }
  input:checked {
    border: 2px solid black;
  }
  input:required {
    box-shadow: none;
  }
  input:invalid {
    box-shadow: 0 0 3px #fcd116;
  }
  .invisible {
    visibility: hidden;
  }
</style>

<form action="submit" on:submit|preventDefault={handleSubmit}>
  <div class:invisible={!message.text} class="message">
    <span>{message.text}</span>
  </div>
  <div class="contact">
    <input
      id="name"
      type="text"
      bind:value={name}
      required
      size="11"
      placeholder="имя" />
  </div>
  <div class="contact">
    <input
      type="tel"
      id="phone"
      name="phone"
      placeholder="+79774879349"
      bind:value={phone}
      size="11"
      required />

  </div>

  <div class="delivery">
    {#each deliveryOptions as option}
      <input
        bind:group={deliveryOption}
        name="delivery"
        type="radio"
        value={option.id}
        id={option.id}
        required />
      <label for={option.id}>{option.title}</label>
    {/each}
  </div>
  {#if deliveryOptions.find(d => d.id == deliveryOption)}
    {#if deliveryOptions.find(d => d.id == deliveryOption).title == 'Доставка'}
      <div class="address">
        <input
          id="address"
          type="text"
          bind:value={address}
          required
          size="20"
          placeholder="адрес доставки" />
      </div>
    {/if}
    {#if deliveryOptions.find(d => d.id == deliveryOption).title == 'Самовывоз'}
      <div>
        {deliveryOptions
          .find(d => d.id == deliveryOption)
          .description.replace(/<\/?[^>]+(>|$)/g, '')}
      </div>
    {/if}
  {/if}
  <!-- <div class="payment">
    {#each paymentOptions as option}
      <input
        bind:group={paymentOption}
        name="payment"
        type="radio"
        id={option.id}
        value={option.id}
        required />
      <label for={option.id}>{option.title}</label>
    {/each}
  </div> -->
  <div class="submit">
    <input type="submit" value="могу себе позволить" />
  </div>

</form>
