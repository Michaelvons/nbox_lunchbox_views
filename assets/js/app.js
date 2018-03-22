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
      //  app.showKeyboard();
      //  document.getElementById("navSetupButton").style.display = "none";
      var storedSetup = JSON.parse(localStorage.getItem("setup"));

      if (storedSetup === null) {
        console.log("No config found");
        setTimeout(function(){
          document.getElementById("navSetupButton").style.visibility = "visible";
          document.getElementById("launchPreloader").style.visibility = "hidden";
          document.getElementById("launchPreloaderText").style.visibility = "hidden";

        }, 5000);
      }else {

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

  /****/
  // APP LOGIC STARTS
  /****/

  /** VALIDATE SETUP PARAMS**/
  validateSetupParams:function functionName() {
    var locationID = $("#locationID").val();
    var terminalID = $("#terminalID").val();

    if(locationID === ""){
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


  /** SETUP DEVICE **/
  setupDevice:function(){
    var locationID = $("#locationID").val();
    var terminalID = $("#terminalID").val();
    document.getElementById("setupDeviceButton").disabled = true;
    document.getElementById("setupDeviceButton").style.backgroundColor = "#5D5D5D";
    document.getElementById("setupDevicePrelooader").style.visibility = "visible";

    $.ajax({
      url: app.BASE_URL + "locations/all",
      type: "GET",
      crossDomain: true,
      contentType: "application/json"
    }).done(function (locations) {

      // LOOP THROUGH ARRAYS TO FIND OBJECT WHERE LOCATION ID EQUALS
      for (var i = 0; i < locations.message.length; i++) {
        var aliasID = locations.message[i].alias_id;

        if(locationID === aliasID){
          $("#locationName").html = locations.message[i].location;
          locationName = locations.message[i].location;
          locationCity = locations.message[i].city;
          cityID = locations.message[i].city_id;
          aliasID = locations.message[i].alias_id;

          var setup =[];
          setupArray = {terminalID: terminalID, locationName: locationName, locationCity: locationCity, cityID : cityID, aliasID : aliasID};

          setup.unshift(setupArray);
          localStorage.setItem("setup", JSON.stringify(setup));
          app.gotoScreensaverPage();
          break;
        }

      }
    });

  },

  removeAttentionFlash:function () {
    app.element("basket-table").classList.remove("animate-basket-background");
  },

  /**NAV BACK FROM BUNDLES TO CATEGORY PAGE **/
  goBackToCategory:function () {
    views.back("page-category", function(){

      //GET DELIVERY COST
      app.getDeliveryCost();

      console.log("Whn back to page-category");

      var categoryLength = app.categoriesLength;
      for (var i = 0; i < categoryLength; i++) {
        app.element("card-category-" + i).classList.remove("card-active");
      }

      var storedBasket = JSON.parse(localStorage.getItem("basket"));
      console.log("storedBasket");
      console.log(storedBasket);
      if( storedBasket !== null){
        app.element("basketTable").innerHTML = "";
        var totalBundle = 0;

        for (i = 0; i < storedBasket.length; i++) {

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

        app.totalBundle = parseInt(totalBundle, 10).toLocaleString();
        if (app.totalBundle === undefined) {
          app.element("totalBundleCategory").innerHTML = "00";
        }else {
          app.element("totalBundleCategory").innerHTML = parseInt(totalBundle, 10).toLocaleString();

        }

        var deliveryCost = app.deliveryCost;
        var grandTotal = totalBundle +  parseInt(deliveryCost);
        //  debugger;
        app.element("grandTotalCategory").innerHTML = parseInt(grandTotal, 10).toLocaleString();
      }

      app.element("deliveryCostCategory").innerHTML = app.deliveryCost;
      console.log(app.deliveryCost);

    });
  },

  getDeliveryCost:function () {
    //GET SCREENSAVERS
    $.ajax({
      url: app.BASE_URL + "orders/deliverycost",
      type: "GET",
      crossDomain: true,
      contentType: "application/json"
    }).done(function (delivery) {
      app.deliveryCost = delivery.message;

      console.log(app.deliveryCost);
    });
  },


  /** NAV TO CATEGORY PAGE **/
  gotoCategoryPage: function () {
    //GET DELIVERY COST
    app.getDeliveryCost();

    views.goto("page-category", function () {

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
        document.getElementById("placeholder-cards-category").style.display = "none";
        app.categoriesLength = categories.message.length;
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
        }
      });
    })

    var storedBasket = JSON.parse(localStorage.getItem("basket"));
    console.log("storedBasket");
    console.log(storedBasket);
    if( storedBasket !== null){
      app.element("basketTable").innerHTML = "";
      var totalBundle = 0;

      for (i = 0; i < storedBasket.length; i++) {

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

      app.totalBundle = parseInt(totalBundle, 10).toLocaleString();
      if (app.totalBundle === undefined) {
        app.element("totalBundleCategory").innerHTML = 00;
      }else {
        app.element("totalBundleCategory").innerHTML =parseInt(totalBundle, 10).toLocaleString();
      }

      //  app.element("totalBasketBundle").innerHTML = app.totalBundle;
      //  app.element("deliveryCost").innerHTML = app.deliveryCost;
      var deliveryCost = app.deliveryCost;
      var grandTotal = totalBundle +  parseInt(deliveryCost);

      app.element("grandTotalCategory").innerHTML = app.grandTotal;
    }

    app.element("deliveryCostCategory").innerHTML = app.deliveryCost;
    console.log(app.deliveryCost);
  },


  /** NAV TO BUNDLE PAGE **/
  gotoBundlePage: function ( cardID, cardLength, categoryID) {
    //  app.showKeyboard();

    //GET DELIVERY COST
    app.getDeliveryCost();

    //GET BUNDLES
    $.ajax({
      url: app.BASE_URL + "bundles?category_id=" + categoryID,
      type: "GET",
      crossDomain: true,
      contentType: "application/json"
    }).done(function (bundles) {
      document.getElementById("placeholder-cards-bundle").style.display = "none";

      text = "";
      for (i = 0; i < bundles.message.length; i++) {
        app.allMenu = bundles.message;

        text += "<div id='card-bundle-" + i +"' class='card' onclick='app.showModalBundleDetail(" + i + ",\"" + bundles.message.length + "\",\"" + bundles.message[i].description + "\", \"" + bundles.message[i].price + "\", \"" + bundles.message[i].name + "\", \"" + bundles.message[i].image + "\",\"" + bundles.message[i]._id + "\",\"" + bundles.message[i].category_id + "\")'>"
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
      }


      var storedBasket = JSON.parse(localStorage.getItem("basket"));

      app.element("bundleBasketTable").innerHTML = "";
      var totalBundle = 0;

      if(storedBasket !== null){
        for (i = 0; i < storedBasket.length; i++) {

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

        //  app.element("totalBasketBundle").innerHTML = app.totalBundle;
        //  app.element("deliveryCost").innerHTML = app.deliveryCost;

        app.totalBundle = parseInt(totalBundle, 10).toLocaleString();
        if (app.totalBundle === undefined) {
          app.element("totalBasketBundle").innerHTML = 00;
        }else {
          app.element("totalBasketBundle").innerHTML = app.totalBundle;

        }

        var deliveryCost = app.deliveryCost;
        var grandTotal = totalBundle +  parseInt(deliveryCost);

        app.element("grandTotal").innerHTML = app.grandTotal;
      }

      app.element("deliveryCost").innerHTML = app.deliveryCost;
      console.log(app.deliveryCost);
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

    }

    views.goto("page-bundle", function () {
      var storedSetup = JSON.parse(localStorage.getItem("setup"));

      app.element("bundleLocationName").innerHTML= storedSetup[0].locationName;
      app.element("bundleLocationCity").innerHTML= storedSetup[0].locationCity;

      app.element("bundle-basket-table").classList.remove("animate-basket-background");
      document.getElementById("placeholder-cards-bundle").style.display = "flex";

    })
  },


  /** SHOW MODAL DETAILS **/
  showModalBundleDetail:function (cardID, cardLength, description, price, name, image, bundleID, categoryID) {

    var menuArray = app.allMenu[cardID];

    //ADD OR REMOVE CSS Class
    app.element("card-bundle-" + cardID).classList.add("card-active");
    cards = [];
    cardsLength = cardLength + 1;

    var inactiveCards;

    for (var i = 0; i < cardsLength; i++) {
      cards.push(i);

      //GET TAB INDEX WHEN TABS ARE CREATED
      if (cardLength == cards.length) {
        cardIndex = cards.indexOf(cardID);

        //RETURN ARRAY OF INACTIVE TABS
        inactiveCards = cards.splice(cardIndex, 1);
      }
    }

    //REMOVE CSS PROPERTY TO INACTVE TABS
    for (var i = 0; i < cards.length; i++) {
      app.element("card-bundle-" + cards[i]).classList.remove("card-active");
    }

    var bundleCount = "bundleCount";

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
    +"<button class='green-button' onclick='app.addToBasket(\"" + name + "\", \"" + price + "\",\"" + bundleID + "\", \"" + categoryID + "\")'>"
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

    for (var i = 0; i < menuArray.menu.length; i++) {
      var one = menuArray.menu[i];
      $("#bundleMenusTable").append("<tr>"
      + "<td>" + one.name + "</td>"
      + "</tr>");
    }

    document.getElementById("bundle-overlay-image").style.backgroundImage = 'url('+ image +')';
  },

  /** ADD TO BASKET **/
  addToBasket:function (name, price, bundleID, categoryID) {
    var quantity = app.element("bundleCount").innerHTML;
    var initialBasket = JSON.parse(localStorage.getItem("basket"));

    if( initialBasket === null || initialBasket.length === 0){
      var basket =[];
      basketArray = {name: name, price: price, quantity: quantity, bundleID : bundleID, categoryID : categoryID};

      basket.unshift(basketArray);
      localStorage.setItem("basket", JSON.stringify(basket));
      var storedBasket = JSON.parse(localStorage.getItem("basket"));
      app.element("bundleBasketTable").innerHTML = "";
      var totalBundle = 0;

      for (i = 0; i < storedBasket.length; i++) {

        $("#bundleBasketTable").append("<tr>"
        + "<td>" +storedBasket[i].name + "</td>"
        + "<td>NGN " + parseInt(storedBasket[i].price, 10).toLocaleString() + "</td>"
        + "<td>" +storedBasket[i].quantity + "</td>"
        + "<td><button onclick='app.deleteBundleBasket(" + i + ",\"" + storedBasket[i].name + "\",\"" + parseInt(storedBasket[i].price, 10).toLocaleString() + "\",\"" + storedBasket[i].quantity + "\")'><img src='assets/image/trash.png'></button></td>"
        + "</tr>");

        //ADD BUNDLE PRICE
        totalBundle += parseInt(storedBasket[i].price) * parseInt(storedBasket[i].quantity);

      }

      console.log("addToBasket : otalBundle");
      console.log(totalBundle);
      console.log("addToBasket : storedBasket");
      console.log(storedBasket);
      console.log("app.grandTotal");
      console.log(app.grandTotal);
      app.totalBundle = parseInt(totalBundle, 10).toLocaleString();

      app.element("totalBasketBundle").innerHTML = parseInt(totalBundle, 10).toLocaleString();
      var deliveryCost = app.deliveryCost;
      var grandTotal = totalBundle +  parseInt(deliveryCost);
      app.grandTotal = parseInt(grandTotal, 10).toLocaleString();
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

        basketArray = {name: name, price: price, quantity: quantity, bundleID : bundleID, categoryID : categoryID};

        basket.unshift(basketArray);
        localStorage.setItem("basket", JSON.stringify(basket));
        var storedBasket = JSON.parse(localStorage.getItem("basket"));
        app.element("bundleBasketTable").innerHTML = "";
        var totalBundle = 0;

        for (i = 0; i < storedBasket.length; i++) {

          $("#bundleBasketTable").append("<tr>"
          + "<td>" +storedBasket[i].name + "</td>"
          + "<td>NGN " + parseInt(storedBasket[i].price, 10).toLocaleString() + "</td>"
          + "<td>" +storedBasket[i].quantity + "</td>"
          + "<td><button onclick='app.deleteBundleBasket(" + i + ",\"" + storedBasket[i].name + "\",\"" + parseInt(storedBasket[i].price, 10).toLocaleString() + "\",\"" + storedBasket[i].quantity + "\")'><img src='assets/image/trash.png'></button></td>"
          + "</tr>");

          //ADD BUNDLE PRICE
          totalBundle += parseInt(storedBasket[i].price) * parseInt(storedBasket[i].quantity);

        }
        console.log("addToBasket : totalBundle");
        console.log(totalBundle);
        console.log("addToBasket : storedBasket");
        console.log(storedBasket);
        app.totalBundle = parseInt(totalBundle, 10).toLocaleString();
        console.log("app.grandTota");
        console.log(app.grandTotal);
        app.element("totalBasketBundle").innerHTML = parseInt(totalBundle, 10).toLocaleString();
        var deliveryCost = app.deliveryCost;
        var grandTotal = totalBundle +  parseInt(deliveryCost);
        app.grandTotal = parseInt(grandTotal, 10).toLocaleString();
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


  validateCardDetails:function () {
    var name = $("#name").val();
    var email = $("#email").val();
    var number = "77";
    var stringNumber = number.toString();
    var expiryMonth = $("#expiryMonth").find(":selected").data("id");
    var expiryYear = $("#expiryYear").find(":selected").data("id");
    var stringExpiryMonth = expiryMonth.toString();
    var stringExpiryYear = expiryYear.toString();
    var cvv = $("#cvv").val();
    var stringCvv = cvv.toString();
    var cardNumber = $("#cardNumber").val();
    var isValidName = app.validateAlphabet(name);
    var isValidEmail = app.isValidEmail(email);
    var isValidExpiryMonth = app.validateNumeric(stringExpiryMonth);
    var isValidExpiryYear = app.validateNumeric(stringExpiryYear);
    var isValidCvv = app.validateNumeric(cvv);
    var isValidCardNumber = app.validateNumeric(cardNumber);
    console.log("expiryMonth");
    console.log(stringExpiryMonth);
    console.log("expiryYear");
    console.log(stringExpiryYear);

    if( name === "" || !isValidName ){
      app.element("name").classList.add("input-error");
    }else {
      app.element("name").classList.remove("input-error");
    }

    if( email === "" | !isValidEmail){
      app.element("email").classList.add("input-error");
    }else {
      app.element("email").classList.remove("input-error");
    }

    if( stringExpiryMonth === "00" | !isValidExpiryMonth){
      app.element("expiryMonthContainer").classList.add("input-error");
    }else {
      app.element("expiryMonthContainer").classList.remove("input-error");
    }

    if( stringExpiryYear === "18" | !isValidExpiryYear){
      app.element("expiryYearContainer").classList.add("input-error");
    }else {
      app.element("expiryYearContainer").classList.remove("input-error");
    }

    if( cvv === "" | !isValidCvv){
      app.element("cvv").classList.add("input-error");
    }else {
      app.element("cvv").classList.remove("input-error");
    }

    if( cardNumber === "" | !isValidCardNumber){
      app.element("cardNumber").classList.add("input-error");
    }else {
      app.element("cardNumber").classList.remove("input-error");
    }

    if(name !== "" && isValidName && email !== "" && isValidEmail && stringExpiryYear !== "" && isValidExpiryYear && stringCvv !== "" && cardNumber !== "" ){
      //  debugger;
      app.payWithCard(name, email, stringExpiryMonth, stringExpiryYear, cvv, cardNumber)
    }

  },

  /** SHOW ATTENTION FLASH **/
  stopAttentionFlash:function () {
    setTimeout(function(){
      app.element("bundle-basket-table").classList.remove("animate-basket-background");
    }, 1000);
  },

  /** SHOW FLASH ON CATEGORY BASKET **/
  stopCategoryAttentionFlash:function () {
    setTimeout(function(){
      app.element("basket-table").classList.remove("animate-basket-background");
    }, 1000);
  },


  /** DELETE A BUNDLE FROM BUNDLE BASKET **/
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

      //REMOVE ELEMENT FROM BASKET ARRAY
      deletedBundle = storedBasket.splice(basketIndex, 1);

      //CLEAR basket LOCAL STORAGE
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
      app.totalBundle = parseInt(totalBundle, 10).toLocaleString();
      app.element("totalBasketBundle").innerHTML = parseInt(totalBundle, 10).toLocaleString();
      var deliveryCost = app.deliveryCost;
      var grandTotal = totalBundle +  parseInt(deliveryCost);
            app.grandTotal = parseInt(grandTotal, 10).toLocaleString();
      app.element("grandTotal").innerHTML = parseInt(grandTotal, 10).toLocaleString();

    },
    function () {
    }).set({movable:false, padding: false,frameless:false,transition: 'fade',labels: {ok: 'DELETE', cancel: 'CANCEL'}}).show();

  },

  /** DELETE FROM BASKET FROM category pgae **/
  deleteCategoryBasket:function (basketIndex) {
    //FETCH ALL STORED BASKET DATA
    var storedBasket = JSON.parse(localStorage.getItem("basket"));

    //REMOVE ELEMENT FROM BASKET ARRAY
    deletedBundle = storedBasket.splice(basketIndex, 1);

    //CLEAR basket LOCAL STORAGE
    localStorage.removeItem("basket");

    //RECREATE NEW basket LOCAL STORAGE WITH NEW ARRAY;
    localStorage.setItem("basket", JSON.stringify(storedBasket));

    //FETCH NEW basket LOCAL STORAGE ARRAY;
    var newStoredBasket = JSON.parse(localStorage.getItem("basket"));

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
    //  app.element("totalBasketBundle").innerHTML = parseInt(totalBundle, 10).toLocaleString();
    app.totalBundle = parseInt(totalBundle, 10).toLocaleString();
    if (app.totalBundle === undefined) {
      app.element("totalBundleCategory").innerHTML = 00;
    }else {
      app.element("totalBundleCategory").innerHTML = parseInt(totalBundle, 10).toLocaleString();
    }

    var deliveryCost = app.deliveryCost;
    var grandTotal = totalBundle +  parseInt(deliveryCost);
      app.grandTotal = parseInt(grandTotal, 10).toLocaleString();
    app.element("grandTotalCategory").innerHTML = parseInt(grandTotal, 10).toLocaleString();
  },


  /** INCREMENT **/
  increment: function (identifier, price) {
    count = parseInt(app.element(identifier).innerHTML);
    count += 1;
    app.element(identifier).innerHTML = count;
    bundleTotal = price * count;
    app.element("bundleTotal").innerHTML = parseInt(bundleTotal, 10).toLocaleString()
  },


  /** DECREMENT **/
  decrement: function (identifier, price) {
    count = parseInt(app.element(identifier).innerHTML);
    if (count == 1) {
      app.element(identifier).innerHTML = "1";
    } else {
      count -= 1;
      app.element(identifier).innerHTML = count;
    }
    bundleTotal = price * count;
    app.element("bundleTotal").innerHTML = parseInt(bundleTotal, 10).toLocaleString()
  },


  /** GO TO SETUP PAGE **/
  gotoSetupPage:function () {
    views.goto("page-setup", function () {
      document.getElementById("setupDevicePrelooader").style.visibility = "hidden";
    })
  },


  /** SHOW CUSTOM KEYBOARD **/
  showKeyboard:function () {
    console.log("function called custom keyboard");
    //  if (Modernizr.touchevents) {
    if (true) {
      // supported
      console.log('custom keyboard');
      $(".keyboard-sentence").attr('readonly', 'readonly');
      $(".keyboard-numerals").attr('readonly', 'readonly');

      //UNCOMMENT TO ALLOW CUSTOM KEYBOARD TO SHOW FOR TOUCH DEVICE
      $('.keyboard-sentence').keyboard({
        layout: 'custom',
        useCombos: false,
        autoAccept: true,
        usePreview : false,
        customLayout: {
          'normal': [
            '1 2 3 4 5 6 7 8 9 0',
            ' q w e r t y u i o p ',
            'a s d f g h j k l {b} ',
            '{shift} z x c v b n m  {shift}',
            ' @ {space} .'
          ],
          'shift': [
            '1 2 3 4 5 6 7 8 9 0',
            'Q W E R T Y U I O P ',
            'A S D F G H J K L {b}',
            '{shift} Z X C V B N M {shift}',
            '@ {space} .'
          ]
        }
      })

      //NUMPAD
      $('.keyboard-numerals').keyboard({
        layout : 'custom',
        restrictInput : true, // Prevent keys not in the displayed keyboard from being typed in
        preventPaste : true,  // prevent ctrl-v and right click
        autoAccept : true,
        usePreview : false,
        customLayout: {
          'normal': [
            '1 2 3',
            '4 5 6',
            '7 8 9',
            '{clear} 0 {b}'
          ]
        }
      })

    } else {
      // not-supported
      console.log('if The test failed!');
      $(".keyboard-sentence").click(function() {
        alert("failed initialize text keyboard");
      });
      $(".keyboard-numerals").click(function() {
        alert("failed initialize number keyboard");
      });
    }

  },

  showSentenceKeyboard:function () {
    $(".keyboard-sentence").attr('readonly', 'readonly');

    $('.keyboard-sentence').keyboard({
      layout: 'custom',
      useCombos: false,
      autoAccept: true,
      usePreview : false,
      customLayout: {
        'normal': [
          '1 2 3 4 5 6 7 8 9 0',
          ' q w e r t y u i o p ',
          'a s d f g h j k l {b} ',
          '{shift} z x c v b n m  {shift}',
          ' @ {space} .'
        ],
        'shift': [
          '1 2 3 4 5 6 7 8 9 0',
          'Q W E R T Y U I O P ',
          'A S D F G H J K L {b}',
          '{shift} Z X C V B N M {shift}',
          '@ {space} .'
        ]
      }
    })
  },

  showNumberKeyboard:function () {
    console.log("showNumberKeyboard");

    $(".keyboard-numerals").attr('readonly', 'readonly');
    //NUMPAD
    $('.keyboard-numerals').keyboard({
      layout : 'custom',
      restrictInput : true, // Prevent keys not in the displayed keyboard from being typed in
      preventPaste : true,  // prevent ctrl-v and right click
      autoAccept : true,
      usePreview : false,
      customLayout: {
        'normal': [
          '1 2 3',
          '4 5 6',
          '7 8 9',
          '{clear} 0 {b}'
        ]
      }
    })
  },


  /** SHOW CHECKOUT MODAL **/
  showModalCheckout:function(){
    var grandTotal;
    if( app.grandTotal === undefined){
      grandTotal = "00";
    }else {
      grandTotal = app.grandTotal;
    }
    //  app.showKeyboard();
    // app.element("checkoutMessage").innerHTML = "An Error Occurred. Please Try Again";
    //  document.getElementById("checkoutMessage").style.visibility = "hidden";
    //  app.element("checkoutMessage").style.visibility = "hidden";


    var bundleDetailstemplate = "<div class='checkout'>"
    +"<div class='checkout-header'>"
    +"<img class='checkout-image' src='assets/image/checkout.png'>"
    +"<p class='checkout-title'>Checkout</p>"
    +"<div class='checkout-total'>"
    +"<p class='checkout-total-title'>TOTAL</p>"
    +"<p class='checkout-total-amount'><span class='currency checkout-currency'>NGN</span>" + grandTotal+"<span class='currency checkout-currency'>.00</span></p>"
    +"</div>"
    +"</div>"
    +"<div id='checkoutBody' class='checkout-body'>"
    //  +"<input id='phoneNumber' class='checkout-input keyboard-numerals' type='text' placeholder='Phone Number' onclick='app.showNumberKeyboard()'>"
    //  +"<input id='cardPin' class='checkout-input keyboard-numerals' type='password' placeholder='Card Pin' onclick='app.showNumberKeyboard()'>"
    //  +"<button id='validateOrderButton' class='checkout-button' onclick='app.validateOrderDetails()'>CONFIRM ORDER</button>"
    +"</div>"
    +"</div>";

    alertify.confirm(bundleDetailstemplate,
    ).set({movable:false, padding: false,frameless:true,transition: 'fade'}).show();

    app.showCheckoutForm();
  },

  showCheckoutForm:function () {
    var checkoutForm = "<div class='form-card'>"
    +"<input id='phoneNumber' class='checkout-input keyboard-numerals' type='text' placeholder='Phone Number' onclick='app.showNumberKeyboard()'>"
    +"<input id='cardPin' class='checkout-input keyboard-numerals' type='password' placeholder='Card Pin' onclick='app.showNumberKeyboard()'>"
    +"<button id='validateOrderButton' class='checkout-button' onclick='app.validateOrderDetails()'>CONFIRM ORDER</button>"
    +"</div>";
    app.element("checkoutBody").innerHTML = checkoutForm;
  },


  /** VALIDATE ORDER INPUT DETAILS **/
  validateOrderDetails:function () {
    var phonenumber = $("#phoneNumber").val();
    var phoneNumberLength = phonenumber.length;
    var passcode = $("#cardPin").val();
    var isPhoneNumber = app.validateNumeric(phonenumber);
    var isPasscode = app.validateNumeric(passcode);
    var isPhoneNumberLength = app.validatePhoneNumberLength(phonenumber);

    if (!isPhoneNumber) {
      app.element("phoneNumber").classList.add("input-error");
    }else {
      app.element("phoneNumber").classList.remove("input-error");
    }

    if (isPhoneNumberLength) {
      app.element("phoneNumber").classList.remove("input-error");
    }else {
      app.element("phoneNumber").classList.add("input-error");
    }

    if (!isPasscode) {
      app.element("cardPin").classList.add("input-error");
    }else {
      app.element("cardPin").classList.remove("input-error");
    }

    if(isPhoneNumber && isPasscode && isPhoneNumberLength && phonenumber !== "" && passcode !== ""){
      app.placeOrder();
    }
  },

  /** VALIDATE LENGTH OF PHONE NUMBER **/
  validatePhoneNumberLength:function (phonenumber) {
    if (phonenumber.length === 11) {
      return true;
    }else {
      return false;
    }
  },

  /** VALIDATE NUMBERS **/
  validateNumeric: function (inputtext) {
    var numericExpression = /^[0-9]+$/;
    if (inputtext.match(numericExpression)) {
      return true;
    } else {
      return false;
    }
  },

  /** VALIDATE ALPHABET TEXT **/
  validateAlphabet: function (inputtext) {
    var alphaExp = /^[a-zA-Z]+$/;
    if (inputtext.match(alphaExp)) {
      return true;
    } else {
      return false;
    }
  },


  /** FIRST - PLACE ORDER **/
  placeOrder:function () {
    document.getElementById("validateOrderButton").disabled = true;
    document.getElementById("validateOrderButton").style.backgroundColor = "#5D5D5D";
    document.getElementById("validateOrderButton").innerHTML = "PROCESSING...";
    document.getElementById("phoneNumber").disabled = true;
    document.getElementById("cardPin").disabled = true;

    app.phoneNumber = $("#phoneNumber").val();
    var phoneNumber = app.phoneNumber;
    app.cardPin = $("#cardPin").val();

    var userData = {phonenumber : phoneNumber}

    $.ajax({
      url: app.BASE_URL + "checkuserinfo",
      type: "POST",
      crossDomain: true,
      data: JSON.stringify(userData),
      contentType: "application/json"
    }).done(function (user) {

      document.getElementById("validateOrderButton").disabled = false;
      document.getElementById("validateOrderButton").style.backgroundColor = "#6a9c5c";
      document.getElementById("validateOrderButton").innerHTML = "CONFIRM ORDER";
      document.getElementById("phoneNumber").disabled = false;
      document.getElementById("cardPin").disabled = false;

      if (user.status === 404) {
        app.showCardForm();
      }

      if (user.status === 200) {
        app.payWithToken();
      }

    })
  },


  /** FORM - SHOW CARD FORM **/
  showCardForm:function () {
    //  app.showKeyboard();
    var cardForm = "<div class='form-card'>"
    +"<input id='name' class='checkout-input keyboard-sentence' type='text' placeholder='Name' onclick='app.showSentenceKeyboard()'>"
    +"<input id='email' class='checkout-input keyboard-sentence' type='text' placeholder='Email' onclick='app.showSentenceKeyboard()'>"
    +"<div class='multiple-input'>"
    +"<div id='expiryMonthContainer' class='styled-select slate'>"
    +"<select id='expiryMonth'>"
    +"<option data-id='00' value='00'>00</option>"
    +"<option data-id='01' value='01'>01</option>"
    +"<option data-id='02' value='02'>02</option>"
    +"<option data-id='03' value='03'>03</option>"
    +"<option data-id='04' value='04'>04</option>"
    +"<option data-id='05' value='05'>05</option>"
    +"<option data-id='06' value='06'>06</option>"
    +"<option data-id='07' value='07'>07</option>"
    +"<option data-id='08' value='08'>08</option>"
    +"<option data-id='09' value='09'>09</option>"
    +"<option data-id='10' value='10'>10</option>"
    +"<option data-id='11' value='11'>11</option>"
    +"<option data-id='12' value='12'>12</option>"
    +"</select>"
    +"</div>"
    +"<div id='expiryYearContainer' class='styled-select slate'>"
    +"<select id='expiryYear'>"
    +"<option data-id='18' value='18'>18</option>"
    +"<option data-id='19' value='19'>19</option>"
    +"<option data-id='20' value='20'>20</option>"
    +"<option data-id='21' value='21'>21</option>"
    +"<option data-id='22' value='22'>22</option>"
    +"<option data-id='23' value='23'>23</option>"
    +"<option data-id='24' value='24'>24</option>"
    +"</select>"
    +"</div>"
    +"<input id='cvv' class='checkout-input-short keyboard-numerals' type='text' placeholder='CVV'onclick='app.showNumberKeyboard()'>"
    +"</div>"
    +"<input id='cardNumber' class='checkout-input keyboard-numerals' type='text' placeholder='Card Number' onclick='app.showNumberKeyboard()'>"
    //button function is payWithCard
    +"<button id='payWithCardButton' class='checkout-button' onclick='app.validateCardDetails()'>CONTINUE</button>"
    +"<p id='checkoutMessage'></p>"
    +"</div>";
    app.element("checkoutBody").innerHTML = cardForm;
  },


  /** MESSAGE - SHOW TRANSACTION SUCCESS MESSAGE **/
  showTransactionSuccess:function () {
    var TransactionSuccessForm = "<div class='form-card'>"
    +"<img class='checkout-body-image' src='assets/image/success.png'>"
    +"<p class='checkout-text-success'>Transaction Completed</p>"
    +"</div>";
    app.element("checkoutBody").innerHTML = TransactionSuccessForm;
  },


  /** FORM - SHOW TRANSACTION FAILED **/
  showTransactionFailed:function () {
    var TransactionFailedForm = "<div class='form-card'>"
    +"<img class='checkout-body-image' src='assets/image/error.png'>"
    +"<p class='checkout-text-failed'>Oops!!. An Error Occurred. Try Again</p>"
    +"</div>";
    app.element("checkoutBody").innerHTML = TransactionFailedForm;
  },


  /** PAY WITH TOKEN **/
  payWithToken:function () {
    var phoneNumber = app.phoneNumber;
    var cardPin = app.cardPin;
    var amount = app.grandTotal;

    var tokenData = {amount: amount, phonenumber: phoneNumber, pin: cardPin}

    $.ajax({
      url: app.BASE_URL + "tokentransaction",
      type: "POST",
      crossDomain: true,
      data: JSON.stringify(tokenData),
      contentType: "application/json"
    }).done(function (response) {
      if(response.status === 200){
        var transactionID = response.transaction_id;
        app.submitOrder(transactionID);
      }
    })
  },

  /** FINAL - SUBMIT TRANSACTION TO DB **/
  submitOrder:function (transactionID) {
    var storedSetup = JSON.parse(localStorage.getItem("setup"));
    var storedBasket = JSON.parse(localStorage.getItem("basket"));
    var locationID = storedSetup[0].aliasID;
    var terminalID = storedSetup[0].terminalID;
    var phoneNumber = app.phoneNumber;

    var cartItems = [];

    for (var i = 0; i < storedBasket.length; i++) {
      var cartCategoryID = storedBasket[i].categoryID;
      var cartBundleID = storedBasket[i].bundleID;
      var cartQuantity = storedBasket[i].quantity;
      var cartItemsArray = { category_id : cartCategoryID, bundle_id : cartBundleID, quantity : cartQuantity};
      cartItems.unshift(cartItemsArray);
    }

    var orderData = {
      cart_items : cartItems,
      location_id : locationID,
      terminal_id : terminalID,
      phone : phoneNumber,
      transaction_id : transactionID
    };

    console.log("orderData");
    console.log(orderData);

    $.ajax({
      url: app.BASE_URL + "order/create",
      type: "POST",
      crossDomain: true,
      data: JSON.stringify(orderData),
      contentType: "application/json"
    }).done(function (transaction) {
      console.log("transaction");
      console.log(transaction);

      if (transaction.status === 200) {
        app.showTransactionSuccess();
      }else {
        app.showTransactionFailed();
      }
    })
  },




  /** PERFORM CARD TRANSACTION**/
  payWithCard:function (name, email, expiryMonth, expiryYear, cvv, cardNumber) {

    var name = name;
    var email = email;
    var cardNumber = cardNumber;
    var expiryMonth = expiryMonth;
    var expiryYear = expiryYear;
    var cvv = cvv;
    var cardPin = app.cardPin;
    var formattedAmount = app.grandTotal;
    var amount = parseInt(formattedAmount.replace(/,/g, ''));
    var phonenumber = app.phoneNumber;

    // DISABLE INPUT
    document.getElementById("payWithCardButton").disabled = true;
    document.getElementById("payWithCardButton").style.backgroundColor = "#5D5D5D";
    document.getElementById("payWithCardButton").innerHTML = "PROCESSING...";
    document.getElementById("name").disabled = true;
    document.getElementById("email").disabled = true;
    document.getElementById("cardNumber").disabled = true;
    document.getElementById("expiryMonth").disabled = true;
    document.getElementById("expiryYear").disabled = true;
    document.getElementById("cvv").disabled = true;

    var cardData = {cardno : cardNumber, cvv : cvv, expirymonth : expiryMonth, expiryyear : expiryYear, pin : cardPin,amount : amount, email :  email, phonenumber : phonenumber, firstname : name}
    //debugger;
    $.ajax({
      url: app.BASE_URL + "payviacard",
      type: "POST",
      crossDomain: true,
      data: JSON.stringify(cardData),
      contentType: "application/json"
    }).done(function (transaction) {

      // ENABLE INPUT
      document.getElementById("payWithCardButton").disabled = false;
      document.getElementById("payWithCardButton").style.backgroundColor = "#6a9c5c";
      document.getElementById("payWithCardButton").innerHTML = "CONTINUE";
      document.getElementById("name").disabled = false;
      document.getElementById("email").disabled = false;
      document.getElementById("cardNumber").disabled = false;
      document.getElementById("expiryMonth").disabled = false;
      document.getElementById("expiryYear").disabled = false;
      document.getElementById("cvv").disabled = false;
      //  debugger;
      if(transaction.error_code === 0){
        app.showOtpForm();
        app.transactionReference = transaction.transaction_reference;
      }else {
        //  app.element("checkoutMessage").innerHTML = "An Error Occurred. Please Try Again";
        //  document.getElementById("checkoutMessage").style.visibility = "visible";
        app.showTransactionFailed()
      }

      //  debugger;
    })

  },

  /** SHOW OTP FORM **/
  showOtpForm:function () {
    //  app.showKeyboard();
    var otpForm = "<div class='form-card'>"
    +"<input id='otp' class='checkout-input keyboard-numerals' type='text' placeholder='Please Enter OTP' onclick='app.showNumberKeyboard()'>"
    +"<button id='payWithOtpButton' class='checkout-button' onclick='app.payWithOtp()'>COMPLETE TRANSACTION</button>"
    +"</div>";
    app.element("checkoutBody").innerHTML = otpForm;
  },


  /** PERFORM OTP TRANSACTION **/
  payWithOtp:function () {
    var otp = $("#otp").val();
    var transactionReference = app.transactionReference;
    var otpData = {otp: otp, transaction_reference: transactionReference};

    // DISBALE INPUT
    document.getElementById("payWithOtpButton").disabled = true;
    document.getElementById("payWithOtpButton").style.backgroundColor = "#5D5D5D";
    document.getElementById("payWithOtpButton").innerHTML = "PROCESSING...";
    document.getElementById("otp").disabled = true;

    $.ajax({
      url: app.BASE_URL + "verifypay",
      type: "POST",
      crossDomain: true,
      data: JSON.stringify(otpData),
      contentType: "application/json"
    }).done(function (response) {
      // DISBALE INPUT
      // document.getElementById("payWithOtpButton").disabled = false;
      // document.getElementById("payWithOtpButton").style.backgroundColor = "#6a9c5c";
      // document.getElementById("payWithOtpButton").innerHTML = "COMPLETE TRANSACTION";
      // document.getElementById("otp").disabled = false;

      var transactionID = response.transaction_id;
      app.submitOrder(transactionID);
    })

  },

  /** GO TO SCREENSAVER PAGE **/
  gotoScreensaverPage:function () {

    //GET DELIVERY COST
    app.getDeliveryCost();

    //debugger;
    views.goto("page-screensaver", function () {
      //CLEAR basket LOCAL STORAGE
      localStorage.removeItem("basket");

      var storedSetup = JSON.parse(localStorage.getItem("setup"));
      var cityID = storedSetup[0].cityID;

      //GET SCREENSAVERS
      $.ajax({
        url: app.BASE_URL + "city/screensavers/all?city_id=" + cityID,
        type: "GET",
        crossDomain: true,
        contentType: "application/json"
      }).done(function (screensavers) {
        for (var i = 0; i < screensavers.message.length; i++) {
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

  /****/
  //END APP LOGIC
  /****/


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

//CUSTOM KEYBOARD
$(function() {


});
