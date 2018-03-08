var app = {
  platform: "DEVEL_PLATFORM",
  pushToken: "DEVEL_TOKEN",
  isLiveApp: false,
  versionNumber: 1,
  buildNumber: 1,
  isBackground: false,
  BASE_URL: "http://staging.nairabox.com/foodhub/",

  start: function () {

    if (app.isLiveApp) document.addEventListener("deviceready", app.launch, false);
    else app.launch();
  },

  launch: function () {
    window.addEventListener("resize", views.resize);
    // app.showBusy();

    if (app.isLiveApp) {
      navigator.splashscreen.hide();

      var vW = window.innerWidth;
      var vH = window.innerHeight;

      app.platform = device.platform.toUpperCase();

      if (app.platform == "IOS") {
        StatusBar.overlaysWebView(true);


        if (vW > 480) {
          app.headerPercent = 0.065;
          app.tabPercent = 0.050;
        }
        else {
          app.headerPercent = 0.120;
          app.tabPercent = 0.110;
        }
      }
      else {
        if (vW > 480) {
          app.headerPercent = 0.078;
          app.tabPercent = 0.068;
        }
        else {
          app.headerPercent = 0.152;
          app.tabPercent = 0.142;
        }

        document.addEventListener("backbutton", app.onBackButton, false);
      }

      app.headerHeight = vH * app.headerPercent;
      app.tabHeight = vH * app.tabPercent;
      app.msgHeight = vH * app.headerPercent;
      app.scrollHeight = vH - app.headerHeight;


      document.addEventListener("pause", app.onPause, false);
      document.addEventListener("resume", app.onResume, false);
      //alert(cordova.file.dataDirectory);
    }
    else {
      app.headerPercent = 0.152;
      app.tabPercent = 0.142;
      app.headerHeight = window.innerHeight * app.headerPercent;
      app.scrollHeight = window.innerHeight - app.headerHeight;
      app.msgHeight = window.innerHeight - app.headerHeight;
    }


    app.CalculateViewPort();

    views.start("page-launch", function () {
      //  document.getElementById("navSetupButton").style.display = "none";
      var storedSetup = JSON.parse(localStorage.getItem("setup"));
      console.log("Load Screen");

      if (storedSetup === null) {
        console.log("No config found");
        setTimeout(function(){
          document.getElementById("navSetupButton").style.visibility = "visible";
          document.getElementById("launchPreloader").style.visibility = "hidden";
          document.getElementById("launchPreloaderText").style.visibility = "hidden";

        }, 5000);
      }else {
        console.log("Config Found");
        setTimeout(function(){
          app.gotoScreensaverPage();
        }, 5000);
      }
    });

  },

  CalculateViewPort: function () {
    var headers = document.getElementsByClassName("header");
    for (var i = 0, max = headers.length; i < max; i++) {
      headers[i].style.height = app.headerHeight;
    }
    var tabBars = document.getElementsByClassName("tabBar");
    for (var i = 0, max = headers.length; i < max; i++) {
      tabBars[i].style.height = app.tabHeight;
    }

    var scrollViews = document.getElementsByClassName("scrollView");
    for (var i = 0, max = scrollViews.length; i < max; i++) {
      scrollViews[i].style.top = app.headerHeight;
      scrollViews[i].style.height = app.scrollHeight;
    }

    var scrollViewsFull = document.getElementsByClassName("scrollViewFull");
    for (var i = 0, max = scrollViewsFull.length; i < max; i++) {
      scrollViewsFull[i].style.paddingTop = app.headerHeight;
    }
    var containView = document.getElementsByClassName("containView");
    for (var i = 0, max = containView.length; i < max; i++) {
      containView[i].style.top = app.headerHeight;
      containView[i].style.height = app.scrollHeight - app.tabHeight;
    }

    window.addEventListener("keyup", function (event) {
      //if (event.keyCode === 13) Keyboard.hide();
    });
  },

  //
  // APP LOGIC STARTS
  //

  validateSetupParams:function functionName() {
    var locationID = $("#locationID").val();
    var terminalID = $("#terminalID").val();

    if(locationID === ""){
      //  document.getElementById("setupDevicePrelooader").style.visibility = "visible";
      app.element("locationID").classList.add("input-error");
    }else {
      app.element("locationID").classList.remove("input-error");
    }

    if(terminalID === ""){
      app.element("terminalID").classList.add("input-error");
    }else {
      app.element("terminalID").classList.remove("input-error");
    }

    if (locationID !== "" && terminalID !== "") {
      app.setupDevice();
    }

  },

  setupDevice:function(){
    var locationID = $("#locationID").val();
    var terminalID = $("#terminalID").val();
    document.getElementById("setupDeviceButton").disabled = true;
    document.getElementById("setupDeviceButton").style.backgroundColor = "#5D5D5D";
    document.getElementById("setupDevicePrelooader").style.visibility = "visible";

    console.log("locationID");
    console.log(locationID);
    console.log("terminalID");
    console.log(terminalID);

    $.ajax({
      url: app.BASE_URL + "locations/all",
      type: "GET",
      crossDomain: true,
      contentType: "application/json"
    }).done(function (locations) {

      console.log(locations);

      // LOOP THROUGH ARRAYS TO FIND OBJECT WHERE LOCATION ID EQUALS
      for (var i = 0; i < locations.message.length; i++) {
        var aliasID = locations.message[i].alias_id;

        console.log("aliasID");
        console.log(aliasID);
        console.log(locationID);

        if(locationID === aliasID){
          console.log("We found it");
          console.log(locations.message[i].location);
          console.log(locations.message[i].city);
          console.log(locations.message[i].alias_id);
          $("#locationName").html = locations.message[i].location;

          locationName = locations.message[i].location;
          locationCity = locations.message[i].city;
          cityID = locations.message[i].city_id;

          var setup =[];
          setupArray = {terminalID: terminalID, locationName: locationName, locationCity: locationCity, cityID : cityID};

          setup.unshift(setupArray);
          localStorage.setItem("setup", JSON.stringify(setup));
          app.gotoScreensaverPage();
          break;
        }

      }

      //  NAV TO SCREENSAVER PAGE BECAUSE THAT'S THE FLOW BEFORE CATEGORIES
      // views.goto("page-screensaver", function (locationName) {
      //   console.log("nav to page-screensaver");
      // })

      //  app.gotoScreensaverPage();

    });

  },

  removeAttentionFlash:function () {

    app.element("basket-table").classList.remove("animate-basket-background");
    // debugger;
  },

  gotoCategoryPage: function () {
    views.goto("page-category", function () {
      console.log("nav to page-category");

      // //REMOVE ATTENTION FLASH
      // app.removeAttentionFlash();
      ////


      ////

      app.element("basket-table").classList.remove("animate-basket-background");


      var storedSetup = JSON.parse(localStorage.getItem("setup"));

      app.element("locationName").innerHTML= storedSetup[0].locationName;
      app.element("locationCity").innerHTML= storedSetup[0].locationCity;
      var cityID = storedSetup[0].cityID;

      //GET SCREENSAVERS
      $.ajax({
        url: app.BASE_URL + "categories?city_id=" + cityID,
        type: "GET",
        crossDomain: true,
        contentType: "application/json"
      }).done(function (categories) {
        console.log("categories");
        console.log(categories);
        console.log(categories.message.length);
        document.getElementById("placeholder-cards-category").style.display = "none";


        text = "";
        for (i = 0; i < categories.message.length; i++) {
          text += "<div id='card-category-" + i +"' class='card' onclick='app.gotoBundlePage(\"" + i + "\",\"" + categories.message.length + "\",\"" + categories.message[i]._id + "\")'>"
          +"<div class='card-content'>"
          +"<img class='card-image lazy-image' src='" + categories.message[i].image +"'>"
          +"<div class='card-caption'>"
          +"<p class='card-title'>" + categories.message[i].category + "</p>"
          +"<p class='card-description'>"+ categories.message[i].description +"</p>"
          +"</div>"
          +"</div>"
          +"<div class='card-background'></div>"
          +"</div>";
          app.element("cards-category").innerHTML = text;
          console.log("repeating cards-category");
        }
      });
    })

    var storedBasket = JSON.parse(localStorage.getItem("basket"));
    console.log(storedBasket);

    //$("#basketTable").html = "";

    if( storedBasket !== null){
      app.element("basketTable").innerHTML = "";
      var totalBundle = 0;

      for (i = 0; i < storedBasket.length; i++) {
        console.log(storedBasket[i].name + " -- " + storedBasket[i].price + "--" + storedBasket[i].quantity);

        //DISPLAY BASKET
        $("#basketTable").append("<tr>"
        + "<td>" +storedBasket[i].name + "</td>"
        + "<td>NGN " + parseInt(storedBasket[i].price, 10).toLocaleString() + "</td>"
        + "<td>" +storedBasket[i].quantity + "</td>"
        + "<td><button onclick='app.deleteCategoryBasket(" + i + ",\"" + storedBasket[i].name + "\")'><img src='assets/image/trash.png'></button></td>"
        + "</tr>");

        //ADD BUNDLE PRICE TO CATEGORY PAGE
        totalBundle += parseInt(storedBasket[i].price) * parseInt(storedBasket[i].quantity);
      }

      console.log("totalBundle");
      console.log(totalBundle);

      app.element("totalBasketBundle").innerHTML = parseInt(totalBundle, 10).toLocaleString();
      var deliveryCost = app.element("deliveryCost").innerHTML;
      //  var quantity = app.element("bundleCount").innerHTML;
      console.log("deliveryCost");
      console.log(deliveryCost);
      var grandTotal = totalBundle +  parseInt(deliveryCost);

      console.log("grandTotal");
      console.log(grandTotal);
      app.element("grandTotal").innerHTML = parseInt(grandTotal, 10).toLocaleString();

    }


  },



  gotoBundlePage: function ( cardID, cardLength, categoryID) {
    console.log("cardID");
    console.log(cardID);
    console.log("cardLength");
    console.log(cardLength);
    console.log("categoryID");
    console.log(categoryID);


    //GET BUNDLES
    $.ajax({
      url: app.BASE_URL + "bundles?category_id=" + categoryID,
      type: "GET",
      crossDomain: true,
      contentType: "application/json"
    }).done(function (bundles) {
      console.log("bundles");
      console.log(bundles);
      console.log(bundles.message.length);
      document.getElementById("placeholder-cards-bundle").style.display = "none";

      text = "";
      for (i = 0; i < bundles.message.length; i++) {
        app.allMenu = bundles.message;

        text += "<div id='card-bundle-" + i +"' class='card' onclick='app.showModalBundleDetail(" + i + ",\"" + bundles.message.length + "\",\"" + bundles.message[i].description + "\", \"" + bundles.message[i].price + "\", \"" + bundles.message[i].name + "\", \"" + bundles.message[i].image + "\")'>"
        +"<div class='card-content'>"
        +"<img class='card-image' src='" + bundles.message[i].image +"'>"
        +"<div class='card-caption'>"
        +"<p class='card-bundle-title'>" + bundles.message[i].name + "</p>"
        +"</div>"
        +"</div>"
        +"<div class='card-background'>"
        +"</div>"
        +"</div>";

        app.element("cards-bundle").innerHTML = text;
        console.log("repeating cards-bundle");
      }


      var storedBasket = JSON.parse(localStorage.getItem("basket"));
      console.log(storedBasket);

      //  $("#bundleBasketTable").html = "";
      app.element("bundleBasketTable").innerHTML = "";

      var totalBundle = 0;

      if(storedBasket !== null){
        for (i = 0; i < storedBasket.length; i++) {
          console.log(storedBasket[i].name + " -- " + storedBasket[i].price + "--" + storedBasket[i].quantity);

          //DISPLAY BASKET
          $("#bundleBasketTable").append("<tr>"
          + "<td>" +storedBasket[i].name + "</td>"
          + "<td>NGN " + parseInt(storedBasket[i].price, 10).toLocaleString() + "</td>"
          + "<td>" +storedBasket[i].quantity + "</td>"
          + "<td><button onclick='app.deleteBundleBasket(" + i + ",\"" + storedBasket[i].name + "\",\"" + parseInt(storedBasket[i].price, 10).toLocaleString() + "\",\"" + storedBasket[i].quantity + "\")'><img src='assets/image/trash.png'></button></td>"
          + "</tr>");

          //ADD BUNDLE PRICE
          totalBundle += parseInt(storedBasket[i].price) * parseInt(storedBasket[i].quantity);
        }

        console.log("totalBundle");
        console.log(totalBundle);

        app.element("totalBasketBundle").innerHTML = parseInt(totalBundle, 10).toLocaleString();
        var deliveryCost = app.element("deliveryCost").innerHTML;
        //  var quantity = app.element("bundleCount").innerHTML;
        console.log("deliveryCost");
        console.log(deliveryCost);
        var grandTotal = totalBundle +  parseInt(deliveryCost);

        console.log("grandTotal");
        console.log(grandTotal);
        app.element("grandTotal").innerHTML = parseInt(grandTotal, 10).toLocaleString();

      }

    });


    //ADD OR REMOVE CSS Class
    app.element("card-category-" + cardID).classList.add("card-active");
    cards = [];
    cardsLength = cardLength + 1;
    var inactiveCards;

    for (var i = 1; i < cardsLength; i++) {
      cards.push(i);
      //GET TAB INDEX WHEN TABS ARE CREATED
      if (cardLength == cards.length) {
        cardIndex = cards.indexOf(parseInt(cardID));

        //RETURN ARRAY OF INACTIVE TABS
        inactiveCards = cards.splice(cardIndex, 1);
      }
    }

    //REMOVE CSS PROPERTY TO INACTVE TABS
    for (var i = 0; i < cards.length; i++) {
      //  console.log(cards[i]);
      //  app.element("card-category-" + cards[i]).classList.remove("card-active");
    }

    views.goto("page-bundle", function () {
      console.log("nav to page-bundle");
      var storedSetup = JSON.parse(localStorage.getItem("setup"));

      app.element("bundleLocationName").innerHTML= storedSetup[0].locationName;
      app.element("bundleLocationCity").innerHTML= storedSetup[0].locationCity;

      app.element("bundle-basket-table").classList.remove("animate-basket-background");
      document.getElementById("placeholder-cards-bundle").style.display = "flex";

    })
  },

  showModalBundleDetail:function (cardID, cardLength, description, price, name, image) {
    console.log("cardID");
    console.log(cardID);

    var menuArray = app.allMenu[cardID];
    console.log("menuArray");
    console.log(menuArray);

    //ADD OR REMOVE CSS Class
    app.element("card-bundle-" + cardID).classList.add("card-active");
    cards = [];
    cardsLength = cardLength + 1;

    console.log("cardsLength");
    console.log(cardsLength);
    var inactiveCards;

    for (var i = 0; i < cardsLength; i++) {
      cards.push(i);

      //console.log("cards array");
      //  console.log(cards);
      //GET TAB INDEX WHEN TABS ARE CREATED
      if (cardLength == cards.length) {
        cardIndex = cards.indexOf(cardID);

        //RETURN ARRAY OF INACTIVE TABS
        inactiveCards = cards.splice(cardIndex, 1);
      }
    }

    //REMOVE CSS PROPERTY TO INACTVE TABS
    for (var i = 0; i < cards.length; i++) {
      //  console.log(cards[i]);
      app.element("card-bundle-" + cards[i]).classList.remove("card-active");
    }

    var bundleCount = "bundleCount";
    // var quantity = "";

    var bundleDetailstemplate = "<div class='bundle-details'>"
    +"<div class='bundle-header'>"
    +"<div id='bundle-overlay-image' class='bundle-overlay-image'></div>"
    +"<div class='bundle-overlay'></div>"
    +"<div class='bundle-overlay-text'>"+ name +" </div>"
    +"</div>"
    +"<div class='bundle-content'>"
    +"<div>"
    +"<p class='bundle-details-header'> DESCRIPTION</p>"
    +"<p class='bundle-details-text'>"+ description + "</p>"
    +"</div>"
    +"<div class='bundle-details-secondary'>"
    +"<div class='bundle-details-menu'>"
    +"<table>"
    +"<thead>"
    +"<tr>"
    +"<th>MENU</th>"
    +"</tr>"
    +"</thead>"
    +"<tbody id='bundleMenusTable'>"
    +"</tbody>"
    +"</table>"
    +"</div>"
    +"<div class='bundle-details-basket'>"
    +"<div class='basket-total'>"
    +"<div>"
    +"<div class='basket-total-row'>"
    +"<span>Price</span>"
    +"<p><span class='currency'>NGN </span>" + parseInt(price, 10).toLocaleString() + "<span class='currency'>.00</span></p>"
    +"</div>"
    +"<div class='basket-total-row basket-total-row-quantity'>"
    +"<span>Quantity</span>"
    +"<div class='bundle-count'><button onclick='app.decrement(\"" + bundleCount + "\",\"" + price + "\" )'>-</button><span id='bundleCount' class='bundle-count-figure'>1</span><button onclick='app.increment(\"" + bundleCount + "\", \"" + price + "\")'>+</button></div>"
    +"</div>"
    +"<hr>"
    +"<div class='basket-total-row basket-total-row-total'>"
    +"<span>Total</span>"
    +"<p><span class='currency'>NGN </span><span id='bundleTotal'>" + parseInt(price, 10).toLocaleString() + "</span><span class='currency'>.00</span></p>"
    +"</div>"
    +"</div>"
    +"<button class='green-button' onclick='app.addToBasket(\"" + name + "\", \"" + price + "\")'>"
    +"ADD TO BASKET"
    +"</button>"
    +"</div>"
    +"</div>"
    +"<div>"
    +"</div>"
    +"</div>";

    alertify.confirm(bundleDetailstemplate,
    ).set({movable:false, padding: false,frameless:true,transition: 'fade'}).show();

    app.element("bundleMenusTable").innerHTML = "";
    //  quantity = app.element("bundleCount").innerHTML;
    //  debugger;
    //  app.element('btn_multi_amount').innerHTM

    for (var i = 0; i < menuArray.menu.length; i++) {
      var one = menuArray.menu[i];
      $("#bundleMenusTable").append("<tr>"
      + "<td>" + one.name + "</td>"
      + "</tr>");
    }

    document.getElementById("bundle-overlay-image").style.backgroundImage = 'url('+ image +')';
    //  document.getElementById("bundle-overlay-image").style.backgroundImage = 'url(assets/image/healthyfood.png)'

  },

  addToBasket:function (name, price) {
    var quantity = app.element("bundleCount").innerHTML;
    console.log("addToBasket");
    console.log(name);
    console.log(price);
    console.log(quantity);
    var initialBasket = JSON.parse(localStorage.getItem("basket"));

    if( initialBasket === null){
      var basket =[];
      basketArray = {name: name, price: price, quantity: quantity};

      basket.unshift(basketArray);
      localStorage.setItem("basket", JSON.stringify(basket));

      var storedBasket = JSON.parse(localStorage.getItem("basket"));
      console.log(storedBasket);

      //  $("#basketTable").html = "";
      app.element("bundleBasketTable").innerHTML = "";
      //  app.element("basketTable").innerHTML = "";

      var totalBundle = 0;


      for (i = 0; i < storedBasket.length; i++) {
        console.log(storedBasket[i].name + " -- " + storedBasket[i].price + "--" + storedBasket[i].quantity);

        $("#bundleBasketTable").append("<tr>"
        + "<td>" +storedBasket[i].name + "</td>"
        + "<td>NGN " + parseInt(storedBasket[i].price, 10).toLocaleString() + "</td>"
        + "<td>" +storedBasket[i].quantity + "</td>"
        + "<td><button onclick='app.deleteBundleBasket(" + i + ",\"" + storedBasket[i].name + "\",\"" + parseInt(storedBasket[i].price, 10).toLocaleString() + "\",\"" + storedBasket[i].quantity + "\")'><img src='assets/image/trash.png'></button></td>"
        + "</tr>");

        //ADD BUNDLE PRICE
        totalBundle += parseInt(storedBasket[i].price) * parseInt(storedBasket[i].quantity);

      }

      console.log("totalBundle");
      console.log(totalBundle);

      app.element("totalBasketBundle").innerHTML = parseInt(totalBundle, 10).toLocaleString();
      var deliveryCost = app.element("deliveryCost").innerHTML;
      //  var quantity = app.element("bundleCount").innerHTML;
      console.log("deliveryCost");
      console.log(deliveryCost);
      var grandTotal = totalBundle +  parseInt(deliveryCost);

      console.log("grandTotal");
      console.log(grandTotal);
      app.element("grandTotal").innerHTML = parseInt(grandTotal, 10).toLocaleString();

      //CLOSE MODAL
      alertify.closeAll();

      //FLASH BASKET BACKGROUND
      app.element("bundle-basket-table").classList.add("animate-basket-background");

      //CALL FUNCTION TO STOP FLASH AFTER 2 SECONDS
      app.stopAttentionFlash();

    }else {
      var basket = initialBasket;

      if (initialBasket.length !== 0) {
        //var id = initialContacts.length;

        basketArray = {name: name, price: price, quantity: quantity};

        basket.unshift(basketArray);
        localStorage.setItem("basket", JSON.stringify(basket));

        var storedBasket = JSON.parse(localStorage.getItem("basket"));
        console.log(storedBasket);

        //  $("#basketTable").html = "";
        app.element("bundleBasketTable").innerHTML = "";

        var totalBundle = 0;


        for (i = 0; i < storedBasket.length; i++) {
          console.log(storedBasket[i].name + " -- " + storedBasket[i].price + "--" + storedBasket[i].quantity);

          $("#bundleBasketTable").append("<tr>"
          + "<td>" +storedBasket[i].name + "</td>"
          + "<td>NGN " + parseInt(storedBasket[i].price, 10).toLocaleString() + "</td>"
          + "<td>" +storedBasket[i].quantity + "</td>"
          + "<td><button onclick='app.deleteBundleBasket(" + i + ",\"" + storedBasket[i].name + "\",\"" + parseInt(storedBasket[i].price, 10).toLocaleString() + "\",\"" + storedBasket[i].quantity + "\")'><img src='assets/image/trash.png'></button></td>"
          + "</tr>");

          //ADD BUNDLE PRICE
          totalBundle += parseInt(storedBasket[i].price) * parseInt(storedBasket[i].quantity);

        }

        console.log("totalBundle");
        console.log(totalBundle);

        app.element("totalBasketBundle").innerHTML = parseInt(totalBundle, 10).toLocaleString();
        var deliveryCost = app.element("deliveryCost").innerHTML;
        //  var quantity = app.element("bundleCount").innerHTML;
        console.log("deliveryCost");
        console.log(deliveryCost);
        var grandTotal = totalBundle +  parseInt(deliveryCost);

        console.log("grandTotal");
        console.log(grandTotal);
        app.element("grandTotal").innerHTML = parseInt(grandTotal, 10).toLocaleString();

      }

      //CLOSE MODAL
      alertify.closeAll();

      //FLASH BASKET BACKGROUND
      app.element("bundle-basket-table").classList.add("animate-basket-background");

      //CALL FUNCTION TO STOP FLASH AFTER 2 SECONDS
      app.stopAttentionFlash();
    }

  },

  stopAttentionFlash:function () {
    setTimeout(function(){
      app.element("bundle-basket-table").classList.remove("animate-basket-background");
    }, 1000);
  },

  stopCategoryAttentionFlash:function () {
    setTimeout(function(){
      app.element("basket-table").classList.remove("animate-basket-background");
    }, 1000);
  },

  deleteBundleBasket:function (basketIndex, bundleName, bundlePrice, bundleQuantity) {
    console.log("basketIndex");
    console.log(basketIndex);


    var deleteBundleTemplate = "<div class='delete-modal'><div class='modal-header'>Are you sure you want to remove this bundle from your cart ?</div>"
    +"<div class='modal-body'>"
    +"<p class='delete-basket-details-header'>BUNDLE NAME</p>"
    +"<p class='delete-basket-details-text'>" + bundleName + "</p>"
    +"<p class='delete-basket-details-header'>PRICE</p>"
    +"<p class='delete-basket-details-text'>" + bundlePrice + "</p>"
    +"<p class='delete-basket-details-header'>QUANTITY</p>"
    +"<p class='delete-basket-details-text'>" + bundleQuantity + "</p></div></div>";


    alertify.confirm("Confirm delete action", deleteBundleTemplate,
    function () {

      //FETCH ALL STORED BASKET DATA
      var storedBasket = JSON.parse(localStorage.getItem("basket"));
      console.log("storedBasket");
      console.log(storedBasket);

      //REMOVE ELEMENT FROM BASKET ARRAY
      deletedBundle = storedBasket.splice(basketIndex, 1);
      console.log("deletedBundle");
      console.log(deletedBundle);

      //CLEAR basket LOCAL STORAGE
      //localStorage.clear("basket");
      localStorage.removeItem("basket");

      //RECREATE NEW basket LOCAL STORAGE WITH NEW ARRAY;
      localStorage.setItem("basket", JSON.stringify(storedBasket));

      //FETCH NEW basket LOCAL STORAGE ARRAY;
      var newStoredBasket = JSON.parse(localStorage.getItem("basket"));
      console.log("newStoredBasket");
      console.log(newStoredBasket);

      //CLEAR BASKET TABLE
      app.element("bundleBasketTable").innerHTML = "";

      var totalBundle = 0;

      //DISPLAY NEW BASKET DATA FOR BUNDLES PAGE
      for (i = 0; i < newStoredBasket.length; i++) {
        $("#bundleBasketTable").append("<tr>"
        + "<td>" +newStoredBasket[i].name + "</td>"
        + "<td>NGN " + parseInt(newStoredBasket[i].price, 10).toLocaleString() + "</td>"
        + "<td>" + newStoredBasket[i].quantity + "</td>"
        + "<td><button onclick='app.deleteBundleBasket(" + i + ",\"" + newStoredBasket[i].name + "\",\"" + parseInt(newStoredBasket[i].price, 10).toLocaleString() + "\",\"" + newStoredBasket[i].quantity + "\")'><img src='assets/image/trash.png'></button></td>"
        + "</tr>");

        //ADD BUNDLE PRICE
        totalBundle += parseInt(storedBasket[i].price) * parseInt(storedBasket[i].quantity);
      }

      //FLASH BASKET BACKGROUND
      app.element("bundle-basket-table").classList.add("animate-basket-background");

      //CALL FUNCTION TO STOP FLASH AFTER 2 SECONDS
      app.stopAttentionFlash();

      console.log("totalBundle");
      console.log(totalBundle);

      app.element("totalBasketBundle").innerHTML = parseInt(totalBundle, 10).toLocaleString();
      var deliveryCost = app.element("deliveryCost").innerHTML;
      //  var quantity = app.element("bundleCount").innerHTML;
      console.log("deliveryCost");
      console.log(deliveryCost);
      var grandTotal = totalBundle +  parseInt(deliveryCost);

      console.log("grandTotal");
      console.log(grandTotal);
      app.element("grandTotal").innerHTML = parseInt(grandTotal, 10).toLocaleString();

    },
    function () {
    }).set({movable:false, padding: false,frameless:false,transition: 'fade',labels: {ok: 'DELETE', cancel: 'CANCEL'}}).show();


    //debugger;


  },


  deleteCategoryBasket:function (basketIndex) {
    console.log("basketIndex");
    console.log(basketIndex);

    //FETCH ALL STORED BASKET DATA
    var storedBasket = JSON.parse(localStorage.getItem("basket"));
    console.log("storedBasket");
    console.log(storedBasket);

    //REMOVE ELEMENT FROM BASKET ARRAY
    deletedBundle = storedBasket.splice(basketIndex, 1);
    console.log("deletedBundle");
    console.log(deletedBundle);

    //CLEAR basket LOCAL STORAGE
    //localStorage.clear("basket");
    localStorage.removeItem("basket");

    //RECREATE NEW basket LOCAL STORAGE WITH NEW ARRAY;
    localStorage.setItem("basket", JSON.stringify(storedBasket));

    //FETCH NEW basket LOCAL STORAGE ARRAY;
    var newStoredBasket = JSON.parse(localStorage.getItem("basket"));
    console.log("newStoredBasket");
    console.log(newStoredBasket);

    //CLEAR BASKET TABLE
    app.element("basketTable").innerHTML = "";

    var totalBundle = 0;

    //DISPLAY NEW BASKET DATA FOR BUNDLES PAGE
    for (i = 0; i < newStoredBasket.length; i++) {
      $("#basketTable").append("<tr>"
      + "<td>" +newStoredBasket[i].name + "</td>"
      + "<td>NGN " + parseInt(newStoredBasket[i].price, 10).toLocaleString() + "</td>"
      + "<td>" +newStoredBasket[i].quantity + "</td>"
      + "<td><button onclick='app.deleteBundleBasket(" + i + ",\"" + newStoredBasket[i].name + "\",\"" + parseInt(newStoredBasket[i].price, 10).toLocaleString() + "\",\"" + newStoredBasket[i].quantity + "\")'><img src='assets/image/trash.png'></button></td>"
      + "</tr>");

      //ADD BUNDLE PRICE
      totalBundle += parseInt(storedBasket[i].price) * parseInt(storedBasket[i].quantity);
    }

    //FLASH BASKET BACKGROUND
    app.element("basket-table").classList.add("animate-basket-background");

    //CALL FUNCTION TO STOP FLASH AFTER 2 SECONDS
    app.stopCategoryAttentionFlash();

    console.log("totalBundle");
    console.log(totalBundle);

    app.element("totalBasketBundle").innerHTML = parseInt(totalBundle, 10).toLocaleString();
    var deliveryCost = app.element("deliveryCost").innerHTML;
    //  var quantity = app.element("bundleCount").innerHTML;
    console.log("deliveryCost");
    console.log(deliveryCost);
    var grandTotal = totalBundle +  parseInt(deliveryCost);

    console.log("grandTotal");
    console.log(grandTotal);
    app.element("grandTotal").innerHTML = parseInt(grandTotal, 10).toLocaleString();

  },



  increment: function (identifier, price) {
    console.log("increment for - " + identifier);

    count = parseInt(app.element(identifier).innerHTML);
    count += 1;
    app.element(identifier).innerHTML = count;
    console.log("value is - " + count);
    //app.element(identifier).innerHTML = "0";

    //PERFORM MATHS
    //  console.log("passed price");
    console.log(price);
    bundleTotal = price * count;
    app.element("bundleTotal").innerHTML = parseInt(bundleTotal, 10).toLocaleString()

  },

  decrement: function (identifier, price) {

    console.log("decrement clicked");
    console.log("decrement for" + identifier);
    count = parseInt(app.element(identifier).innerHTML);
    if (count == 1) {
      app.element(identifier).innerHTML = "1";
    } else {
      count -= 1;
      app.element(identifier).innerHTML = count;
    }

    //PERFORM MATHS
    //  console.log(price);
    bundleTotal = price * count;
    app.element("bundleTotal").innerHTML = parseInt(bundleTotal, 10).toLocaleString()
  },

  gotoSetupPage:function () {
    views.goto("page-setup", function () {
      document.getElementById("setupDevicePrelooader").style.visibility = "hidden";
      console.log("nav to page-setup");
    })
  },

  showModalCheckout:function(){
    console.log("showModalCheckout clicked");

      var grandTotal =  app.element("grandTotal").innerHTML;

    var bundleDetailstemplate = "<div class='checkout'>"
    +"<div class='checkout-header'>"
    //IMG Here
    +"<img class='checkout-image' src='assets/image/checkout.png'>"
    +"<p class='checkout-title'>Checkout</p>"
    +"<div class='checkout-total'>"
    +"<p class='checkout-total-title'>TOTAL</p>"
    +"<p class='checkout-total-amount'><span class='currency checkout-currency'>NGN</span>" + grandTotal+"<span class='currency checkout-currency'>.00</span></p>"
    +"</div>"
    +"</div>"
    +"<div id='checkoutBody' class='checkout-body'>"
    +"<input id='phoneNumber' class='checkout-input' type='text' placeholder='Phone Number'>"
    +"<input id='userPasscode' class='checkout-input' type='text' placeholder='Passcode'>"
    +"<button class='checkout-button' onclick='app.validateOrderDetails()'>CONFIRM ORDER</button>"
    +"</div>"
    +"</div>";

    alertify.confirm(bundleDetailstemplate,
    ).set({movable:false, padding: false,frameless:true,transition: 'fade'}).show();

  },

  validateOrderDetails:function () {
    console.log("placeOrder");
    var phonenumber = $("#phoneNumber").val();
    var phoneNumberLength = phonenumber.length;
    var passcode = $("#userPasscode").val();

    console.log(phonenumber);
    console.log(passcode);
    var isPhoneNumber = app.validateNumeric(phonenumber);
    var isPasscode = app.validateNumeric(passcode);
    var isPhoneNumberLength = app.validatePhoneNumberLength(phonenumber);
    console.log(isPhoneNumber);
    console.log(isPasscode);
    console.log(isPhoneNumberLength);
    console.log(phoneNumberLength);

    if (!isPhoneNumber) {
      console.log("phonenumber is invalid");
      app.element("phoneNumber").classList.add("input-error");
    }else {
      console.log("valid phonenumber");
      app.element("phoneNumber").classList.remove("input-error");
    }

    if (isPhoneNumberLength) {
      console.log("valid phoneNumberLength");
      app.element("phoneNumber").classList.remove("input-error");
    }else {
      console.log("phoneNumberLength is invalid");
      app.element("phoneNumber").classList.add("input-error");
    }

    if (!isPasscode) {
      console.log("passcode is invalid");
      app.element("userPasscode").classList.add("input-error");
    }else {
      console.log("valid passcode");
      app.element("userPasscode").classList.remove("input-error");
    }

    if(isPhoneNumber && isPasscode && isPhoneNumberLength && phonenumber !== "" && passcode !== ""){
      console.log("All Credentials Correct");
      app.placeOrder();
    }else {
      console.log("Invalid Credentials");
    }
  },

  validatePhoneNumberLength:function (phonenumber) {
    if (phonenumber.length === 11) {
      return true;
    }else {
      return false;
    }
  },

  validateNumeric: function (inputtext) {
    var numericExpression = /^[0-9]+$/;
    if (inputtext.match(numericExpression)) {
      return true;
    } else {
      return false;
    }
  },


  validateAlphabet: function (inputtext) {
    var alphaExp = /^[a-zA-Z]+$/;
    if (inputtext.match(alphaExp)) {
      return true;
    } else {
      return false;
    }
  },

  placeOrder:function () {
    //CHECK DB IF USER EXIST AND USE RECORDS TO PERFORM TRANSACTION
    //IF USER DOESN'T EXIST SHOW CARD FORM
    var cardForm = "<div class='form-card'>"
    +"<input id='phoneNumber' class='checkout-input' type='text' placeholder='Name'>"
    +"<input id='phoneNumber' class='checkout-input' type='text' placeholder='Email'>"
    +"<input id='phoneNumber' class='checkout-input' type='text' placeholder='Card Number'>"
    +"<div class='multiple-input'>"
    +"<input id='phoneNumber' class='checkout-input-short' type='text' placeholder='Expiry Month'>"
    +"<input id='phoneNumber' class='checkout-input-short' type='text' placeholder='Expiry Day'>"
    +"<input id='phoneNumber' class='checkout-input-short' type='text' placeholder='CVV'>"
    +"</div>"
    +"<input id='phoneNumber' class='checkout-input' type='text' placeholder='Card Pin'>"
    +"<button class='checkout-button' onclick='app.confirmOtp()'>CONTINUE</button>"
    +"</div>";
    console.log("placeOrder");

    app.element("checkoutBody").innerHTML = cardForm;

  },

  confirmOtp:function () {
    var otpForm = "<div class='form-card'>"
    +"<input id='phoneNumber' class='checkout-input' type='text' placeholder='Please Enter OTP'>"
    +"<button class='checkout-button' onclick='app.validateOrderDetails()'>COMPLETE TRANSACTION</button>"
    +"</div>";

    app.element("checkoutBody").innerHTML = otpForm;
  },

  gotoScreensaverPage:function () {

    views.goto("page-screensaver", function () {

      var storedSetup = JSON.parse(localStorage.getItem("setup"));
      // console.log("storedSetup");
      // console.log(storedSetup);
      // console.log(storedSetup[0].cityID);
      var cityID = storedSetup[0].cityID;

      console.log("nav to page-screensaver");

      //GET SCREENSAVERS
      $.ajax({
        url: app.BASE_URL + "city/screensavers/all?city_id=" + cityID,
        type: "GET",
        crossDomain: true,
        contentType: "application/json"
      }).done(function (screensavers) {
        console.log(screensavers);
        for (var i = 0; i < screensavers.message.length; i++) {
          console.log(screensavers.message[i].image);
          $( "#screensaver-swiper-wrapper" ).append( "<div class='swiper-slide'><img class='screensaver' src='" + screensavers.message[i].image + "'></div>" );
          var mySwiper = new Swiper ('.swiper-container', {
            direction: 'horizontal',
            loop: true,
            autoHeight: true,
            spaceBetween:0,
            effect:'fade',
            autoplay: {
              delay: 5000,
            },
          })
        }
      });
    })
  },

  //
  //END APP LOGIC
  //


  //•••••• BASIC APP LOGIC ••••••/

  isValidEmail: function (email) {
    if (email == "") return false;
    var regex = /^([\w-]+(?:\.[\w-]+)*)@((?:[\w-]+\.)*\w[\w-]{0,66})\.([a-z]{2,6}(?:\.[a-z]{2})?)$/i;
    if (regex.test(email)) return true;
    else return false;
  },

  valueOf: function (element) {
    return app.element(element).value;
  },

  send: function (url, data, callback, errorCallback) {
    var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function () {
      if (xhttp.readyState == 4) {
        if (xhttp.status == 200) {
          var response = JSON.parse(xhttp.responseText);

          if (app.debugMode) console.log(response);
          if (callback) callback(response);
        }
        else return errorCallback ? errorCallback() : app.offline(xhttp.status);
      }
    };

    var request = "";
    var i = 0;
    var length = Object.keys(data).length;

    for (var key in data) {
      request += (key + "=" + encodeURIComponent(data[key]) + "&");
    }

    request += "nocache=" + new Date().getTime();

    xhttp.open("POST", url, true);
    xhttp.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
    xhttp.send(request);
  },
  sendRaw: function (url, data, callback, errorCallback) {
    var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function () {
      if (xhttp.readyState == 4) {
        if (xhttp.status == 200) {
          var response = JSON.parse(xhttp.responseText);

          if (app.debugMode) console.log(response);
          if (callback) callback(response);
        }
        else return errorCallback ? errorCallback() : app.offline(xhttp.status);
      }
    };
    xhttp.open("POST", url, true);

    xhttp.send(data);
  },


  showBusy: function () {
    views.locked = true;
    app.element("busyUIView").style.display = "block";
  },

  hideBusy: function () {
    views.locked = false;
    app.element("busyUIView").style.display = "none";
  },
  doEdit: function (callback) {
    views.flash('editUIView', function () {
      callback();
    })
  },
  alert: function (caption, message) {
    if (app.isLiveApp) {
      setTimeout(function () {
        navigator.notification.alert(message, function () {
        }, caption, 'Okay');
      }, 50);
    }
    else alert(message ? message : caption);
  },

  toast: function (message, long) {
    var duration = long ? 4000 : 2000;
    var options = {
      message: message,
      duration: duration,
      position: "bottom",
      addPixelsY: -200,
    };

    if (app.isLiveApp) window.plugins.toast.showWithOptions(options);
    else console.log(message);
  },

  offline: function () {
    app.hideBusy();
    var showMessage = true;

    if (showMessage) app.alert("Can't reach servers", "You may be offline. Please check your internet connection and try again.");
  },

  toTitleCase: function (string) {
    string = string.replace("-", " ");

    return string.replace(/\w\S*/g, function (txt) {
      return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
    });
  },

  element: function (element) {
    return document.getElementById(element);
    if (window[element]) return window[element];
    return window[element] = document.getElementById(element);
  },
  Kformatter: function (num) {
    num = Math.round(num);
    return num > 999 ? (num / 1000).toFixed(1) + 'k' : num

  },
  numberFormat: function (amount, currency, decimal) {
    amount = Number(amount).toFixed(2).toString();

    var x = amount.split('.');
    var x1 = x[0], x2 = x[1];

    if (decimal) {
      if (!x2) x2 = "00";
      else if (x2.length == 1) x2 = x2 + "0";
      x2 = "." + x2;
    }
    else x2 = "";

    var rgx = /(\d+)(\d{3})/;
    while (rgx.test(x1)) {
      x1 = x1.replace(rgx, '$1' + ',' + '$2');
    }

    if (currency) return currency + " " + x1 + x2;
    else return x1 + x2;
  },

  isPlural: function (count, term, plural) {
    if (count == 1) return count + " " + term;
    else return count + " " + ((plural) ? plural : term + "s");
  },

  isDigitsOnly: function (string) {
    "use strict";

    return (!isNaN(parseInt(string)) && isFinite(string));
  },

  htmlText: function (string) {
    return string.replace(/(?:\r\n|\r|\n)/g, '<br />');
  },

  currentTime: function () {
    var date = new Date();
    var hours = date.getHours();
    var minutes = date.getMinutes();
    var ampm = hours >= 12 ? 'PM' : 'AM';
    var months = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];

    hours = hours % 12;
    hours = hours ? hours : 12;
    hours = (hours >= 10) ? hours : '0' + hours;
    minutes = minutes < 10 ? '0' + minutes : minutes;

    var time = hours + ':' + minutes + ' ' + ampm;
    return months[date.getMonth()] + " " + date.getDate() + " @ " + time;
  },

  changeStatusBarColorTo: function (color) {
    if (app.isLiveApp && app.statusBarColor !== color) {
      StatusBar.backgroundColorByHexString(color);
      if (app.platform == "IOS") StatusBar.styleLightContent();
    }
    app.statusBarColor = color;
  },


  exitApplication: function () {
    if (!app.isLiveApp) console.log("Application Closed.")
    else navigator.app.exitApp();
  }
};

if (/Android [4-6]/.test(navigator.appVersion)) {
  window.addEventListener("resize", function () {
    if (document.activeElement.tagName === "INPUT" || document.activeElement.tagName === "TEXTAREA") {
      window.setTimeout(function () {
        //  document.activeElement.scrollIntoView();
        document.activeElement.scrollIntoViewIfNeeded();
      }, 0);
    }
  })
}


window.addEventListener('load', function () {
  FastClick.attach(document.body);
}, false);


app.start();

//LZY LOAD IMAGES
$(function() {
  console.log("lazy loading");
  //lazyload();

  $('.lazy-image').lazy({
    effect: "fadeIn",
    effectTime: 750,
    threshold: 0,
    afterLoad:function(element) {

      console.log('finished loading ' + element.data('src'));
      //  document.getElementById("placeholder").style.display = "none";
    },
    beforeLoad:function(element) {
      console.log('before loading ' + element.data('src'));
      //  document.getElementById("placeholder").style.display = "none";
    }
  });
});
