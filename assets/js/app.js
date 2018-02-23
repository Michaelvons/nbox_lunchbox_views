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


  gotoCategoryPage: function () {
    views.goto("page-category", function () {
      console.log("nav to page-category");
    })
  },

  gotoBundlePage: function ( cardID, cardLength) {
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
      app.element("card-category-" + cards[i]).classList.remove("card-active");
    }

    views.goto("page-bundle", function () {
      console.log("nav to page-bundle");
    })
  },

  showModalBundleDetail:function (cardID, cardLength) {

    //ADD OR REMOVE CSS Class
    app.element("card-bundle-" + cardID).classList.add("card-active");
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
      app.element("card-bundle-" + cards[i]).classList.remove("card-active");
    }

    //  views.flash("modalBundleDetail");
  },

  gotoSetupPage:function () {
    views.goto("page-setup", function () {
      console.log("nav to page-setup");
    })
  },

  showModalCheckout:function(){
    var bundleDetailstemplate = "<div>"
    "<p>Bundle details</p>"
    + "</div>";


    alertify.confirm(bundleDetailstemplate,
  ).set({movable:false, padding: false,frameless:true,transition: 'flipx'}).show();
},

gotoScreensaverPage:function () {
  views.goto("page-screensaver", function () {
    console.log("nav to page-screensaver");

    //GET SCREENSAVERS
    $.ajax({
      url: app.BASE_URL + "city/screensavers/all?city_id=" + "5a841bcc830f783a39292ebc",
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

        // $("#screensaversTable").append("<tr>"
        // + "<td><img src='" + screensavers.message[i].image + "' style='width: 70px;margin-left: 32px'></td>"
        // + "<td><img>" + screensavers.message[i].name + "</td>"
        // + "<td>" + screensavers.message[i].status + "</td>"
        // + "<td class='btn_table_container'><button class='btn_table' onclick='screensavers.editScreensaver(\"" + screensavers.message[i]._id + "\", \"" + screensavers.message[i].name + "\",\"" + screensavers.message[i].status + "\")'><i class='fa fa-pencil icon_green' aria-hidden='true'></i><button class='btn_table' onclick='screensavers.activateScreensaver(\"" + screensavers.message[i]._id + "\", \"" + screensavers.message[i].name + "\",\"" + screensavers.message[i].status + "\",\"" + screensavers.message[i].image + "\")'><i class='icon_green fa fa-power-off' aria-hidden='true'></i></button><button class='btn_table' onclick='screensavers.deleteScreensaver(\"" + screensavers.message[i]._id + "\", \"" + screensavers.message[i].name + "\", \"" + screensavers.message[i].image + "\")'><i class='icon_red fa fa-trash-o' aria-hidden='true'></i></button></td>"
        // + "</tr>");
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
