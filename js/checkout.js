$(function () {
  function getCart() {
    try {
      const cart = JSON.parse(localStorage.getItem("cart"));
      return cart && typeof cart === "object" ? cart : {};
    } catch {
      return {};
    }
  }

  function saveOrder(order) {
    localStorage.setItem("order", JSON.stringify(order));
  }

  function formatPrice(value) {
    return `$${parseFloat(value).toFixed(2)}`;
  }

  const US_STATES = [
    "Alabama",
    "Alaska",
    "Arizona",
    "Arkansas",
    "California",
    "Colorado",
    "Connecticut",
    "Delaware",
    "Florida",
    "Georgia",
    "Hawaii",
    "Idaho",
    "Illinois",
    "Indiana",
    "Iowa",
    "Kansas",
    "Kentucky",
    "Louisiana",
    "Maine",
    "Maryland",
    "Massachusetts",
    "Michigan",
    "Minnesota",
    "Mississippi",
    "Missouri",
    "Montana",
    "Nebraska",
    "Nevada",
    "New Hampshire",
    "New Jersey",
    "New Mexico",
    "New York",
    "North Carolina",
    "North Dakota",
    "Ohio",
    "Oklahoma",
    "Oregon",
    "Pennsylvania",
    "Rhode Island",
    "South Carolina",
    "South Dakota",
    "Tennessee",
    "Texas",
    "Utah",
    "Vermont",
    "Virginia",
    "Washington",
    "West Virginia",
    "Wisconsin",
    "Wyoming",
  ];

  function populateStates($countrySelect, $stateSelect) {
    const country = $countrySelect.val();
    $stateSelect.empty();
    if (country === "United States") {
      $stateSelect.append("<option selected disabled>State</option>");
      US_STATES.forEach((state) => {
        $stateSelect.append(`<option value="${state}">${state}</option>`);
      });
      $stateSelect.prop("disabled", false);
    } else {
      $stateSelect.append("<option selected disabled>State</option>");
      $stateSelect.prop("disabled", true);
    }
  }

  function renderOrderSummary() {
    const cart = getCart();
    const items = Object.values(cart);
    if (!items.length) {
      $(".order-summary").html(
        '<div class="text-center">Your cart is empty.</div>'
      );
      return;
    }

    let subtotal = 0;
    items.forEach((item) => {
      subtotal += item.price * item.quantity;
    });

    let shipping = 0;
    let shippingText = "";
    if (subtotal < 50) {
      shipping = 1;
      shippingText = formatPrice(shipping);
    } else {
      shipping = 0;
      shippingText = "Free shipping";
    }

    const tax = subtotal * 0.05;
    const platform = subtotal * 0.01;
    const total = subtotal + tax + platform + shipping;

    let summaryHtml = `
      <div class="d-flex justify-content-between ck-title">
        <strong>Cart Total</strong>
        <strong>${formatPrice(subtotal)}</strong>
      </div>
      <div class="ck-divider mb-4 mt-4"></div>
    `;

    items.forEach((item) => {
      const itemTotal = item.price * item.quantity;
      summaryHtml += `
        <div class="d-flex justify-content-between mb-2">
          <span class="ck-pr-box d-flex align-items-center">
            <span><img src="${item.image}" alt=""></span>
            <span class="pr-title">${item.name} x ${item.quantity}</span>
          </span>
          <span>${formatPrice(itemTotal)}</span>
        </div>
      `;
    });

    summaryHtml += `
      <div class="ck-divider mb-4 mt-4"></div>
      <div class="d-flex justify-content-between mb-3">
        <span>Shipping</span>
        <span>${shippingText}</span>
      </div>
      ${
        subtotal < 50 && subtotal > 0
          ? `<div class="free-shipping-msg">Free shipping for orders over $50</div>`
          : ""
      }
      <div class="d-flex justify-content-between mb-3">
        <span>TAX</span>
        <span>5%</span>
      </div>
      <div class="d-flex justify-content-between">
        <span>Platform Charges</span>
        <span>1%</span>
      </div>
      <div class="ck-divider mb-5 mt-4"></div>
      <div class="d-flex justify-content-between ck-title">
        <strong>Amount to pay</strong>
        <strong>${formatPrice(total)}</strong>
      </div>
      <div class="form-check">
        <input class="form-check-input" type="radio" name="payment" id="cod" checked>
        <label class="form-check-label" for="cod">
          <strong>Cash on delivery</strong><br><small>Pay with cash upon delivery.</small>
        </label>
      </div>
      <button type="submit" class="btn btn-pay w-100 mb-3">Proceed To Pay</button>
      <a href="cart.html" class="btn btn-cart w-100 mb-3">Return To Cart</a>
      <p class="d-flex align-items-center justify-content-center"><i class='bx bx-lock-alt me-1'></i> Secure 256 Bit Encrypted Connection</p>
    `;

    $(".order-summary").html(summaryHtml);
  }

  function toggleBillingAddress() {
    if ($("#diffBilling").is(":checked")) {
      $("#billing-address").hide();
    } else {
      $("#billing-address").show();
    }
  }
  $("#diffBilling").on("change", toggleBillingAddress);
  toggleBillingAddress();

  renderOrderSummary();

  const $shippingCountry = $("select.form-select").eq(1);
  const $shippingState = $("select.form-select").eq(0);
  $shippingCountry.on("change", function () {
    populateStates($shippingCountry, $shippingState);
  });

  populateStates($shippingCountry, $shippingState);

  const $billingCountry = $("#billing-address select.form-select").eq(1);
  const $billingState = $("#billing-address select.form-select").eq(0);
  $billingCountry.on("change", function () {
    populateStates($billingCountry, $billingState);
  });
  populateStates($billingCountry, $billingState);

  $("#checkout-form").on("submit", function (e) {
    e.preventDefault();
    let valid = true;
    let $form = $(this);
    let errorMsg = "";

    $form.find("input[required], select[required]").each(function () {
      if (!$(this).val().trim()) {
        $(this).addClass("is-invalid");
        valid = false;
      } else {
        $(this).removeClass("is-invalid");
      }
    });

    const $email = $form.find('input[type="email"]');
    if ($email.length && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test($email.val())) {
      $email.addClass("is-invalid");
      errorMsg += "Please enter a valid email address.\n";
      valid = false;
    }

    const $pincode = $form.find('input[placeholder*="Pincode"]');
    if ($pincode.length && !/^\d{4,10}$/.test($pincode.val())) {
      $pincode.addClass("is-invalid");
      errorMsg += "Please enter a valid pincode/zipcode.\n";
      valid = false;
    }

    if (!$("#diffBilling").is(":checked")) {
      $("#billing-address input, #billing-address select").each(function () {
        if ($(this).attr("required") && !$(this).val().trim()) {
          $(this).addClass("is-invalid");
          valid = false;
        } else {
          $(this).removeClass("is-invalid");
        }
      });
    }

    if (!valid) {
      if (errorMsg) alert(errorMsg);
      return;
    }

    const shipping = {
      firstName: $form.find('input[placeholder="First Name"]').eq(0).val(),
      lastName: $form.find('input[placeholder="Last Name"]').eq(0).val(),
      email: $form.find('input[type="email"]').val(),
      address1: $form.find('input[placeholder="Address 1"]').eq(0).val(),
      address2: $form.find('input[placeholder="Address 2"]').eq(0).val(),
      city: $form.find('input[placeholder="City"]').eq(0).val(),
      pincode: $form.find('input[placeholder*="Pincode"]').eq(0).val(),
      state: $form.find("select").eq(0).val(),
      country: $form.find("select").eq(1).val(),
    };

    let billing;
    if ($("#diffBilling").is(":checked")) {
      billing = { ...shipping };
    } else {
      billing = {
        firstName: $form
          .find('#billing-address input[placeholder="First Name"]')
          .val(),
        lastName: $form
          .find('#billing-address input[placeholder="Last Name"]')
          .val(),
        address1: $form
          .find('#billing-address input[placeholder="Address 1"]')
          .val(),
        address2: $form
          .find('#billing-address input[placeholder="Address 2"]')
          .val(),
        city: $form.find('#billing-address input[placeholder="City"]').val(),
        pincode: $form
          .find('#billing-address input[placeholder*="Pincode"]')
          .val(),
        state: $form.find("#billing-address select").eq(0).val(),
        country: $form.find("#billing-address select").eq(1).val(),
      };
    }

    const cart = getCart();
    const items = Object.values(cart);
    let subtotal = 0;
    items.forEach((item) => {
      subtotal += item.price * item.quantity;
    });

    let shippingCharge = 0;
    if (subtotal < 50) {
      shippingCharge = 1;
    } else {
      shippingCharge = 0;
    }
    const tax = subtotal * 0.05;
    const platform = subtotal * 0.01;
    const total = subtotal + tax + platform + shippingCharge;

    const order = {
      items,
      subtotal,
      tax,
      platform,
      shipping: shippingCharge,
      total,
      shippingAddress: shipping,
      billing,
    };

    saveOrder(order);
    localStorage.removeItem("cart");

    window.location.href = "thank-you.html";
  });
});
