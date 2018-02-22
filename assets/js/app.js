var app = {
    platform: "DEVEL_PLATFORM",
    pushToken: "DEVEL_TOKEN",
    isLiveApp: false,
    versionNumber: 1,
    buildNumber: 1,
    isBackground: false,

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

        views.start("home", function () {
            // app.element("talk").innerHTML="oshey";
            app.slider();
            app.animatePreloader();

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


    // APP LOGIC STARTS
    //
    //

    animatePreloader: function () {
        console.log("animate preloader");
        //app.element("sun").style.left = "0px";

        //app.element("sky").style.left = "0px";


        var skyNight = document.getElementById("sky_night");
        var tweenNight = new TweenLite(skyNight, 40, {left: "-1000px", ease: Linear.easeNone, delay: 0.5});
        TweenLite.set(skyNight, {z: 0.1});

        var photo = document.getElementById("sky");
        var tweenSky = new TweenLite(photo, 40, {left: "-1000px", ease: Linear.easeNone, delay: 0.5});
        TweenLite.set(photo, {z: 0.1});
        // tweenSky.restart(true, false);

        var sun = document.getElementById("sun");
        var tweenSun = new TweenLite(sun, 40, {x: "-150px", ease: Linear.easeNone, delay: 0.5});
        TweenLite.set(sun, {z: 0.1});
        // tweenSun.restart(true, false);;


    },

    slider: function () {
        console.log("slider started");
        var mySwiper = new Swiper('.swiper-container', {
            // pagination: '.swiper-pagination',
            // nextButton: '.swiper-button-next',
            // prevButton: '.swiper-button-prev',
            // slidesPerView: 2,
            slidesPerView: 'auto',
            spaceBetween: 10
            // centeredSlides: true,
            // paginationClickable: true,


            // autoplay:{
            //   delay:1000,
            // }
        });
    },

    titleSelect: function (titleID, titleLength) {
        app.element('traveller_title_' + titleID).classList.add("card_traveller_option_active");

        titles = [];
        titlesLength = titleLength + 1;

        var inactiveTitles;

        for (var i = 1; i < titlesLength; i++) {
            titles.push(i);

            if (titleLength == titles.length) {
                titleIndex = titles.indexOf(parseInt(titleID));

                inactiveTitles = titles.splice(titleIndex, 1);
            }
        }


        for (var i = 0; i < titles.length; i++) {
            app.element("traveller_title_" + titles[i]).classList.remove("card_traveller_option_active");

        }

    },

    filterResult: function () {
        console.log("filterResult clicked");
        views.flash("modalFilterResult");
    },

    closeFilterResultModal: function () {
        views.hideFlash("modalFilterResult");
    },

    filterPriceGroup: function () {
        console.log("filterGroup clicked");

        value = app.element("filterPriceGroup").innerHTML;

        var fees = 398500;

        if (value === "Price Per Person") {
            app.element("filterPriceGroup").innerHTML = "Price Per Group";
            // console.log(app.element('btn_multi_amount').innerHTML);
            multiAmountValue = app.element('btn_multi_amount').innerHTML;
            singleAmountValue = app.element('btn_single_amount').innerHTML;

            var multiAmount = parseInt(multiAmountValue.replace(/,/g, ''));
            var singleAmount = parseInt(singleAmountValue.replace(/,/g, ''));

            //  console.log(multiAmount);

            singleTotal = fees.toLocaleString();
            multiTotal = fees.toLocaleString();

            app.element("btn_multi_amount").innerHTML = multiTotal;
            app.element("btn_single_amount").innerHTML = singleTotal;


            //console.log(total);
        } else {
            app.element("filterPriceGroup").innerHTML = "Price Per Person";
            // console.log(app.element('btn_amount').innerHTML);
            multiAmountValue = app.element('btn_multi_amount').innerHTML;
            singleAmountValue = app.element('btn_single_amount').innerHTML;

            var multiAmount = parseInt(multiAmountValue.replace(/,/g, ''));
            var singleAmount = parseInt(singleAmountValue.replace(/,/g, ''));

            // console.log(multiAmount);

            singleTotal = (singleAmount / 2).toLocaleString();
            multiTotal = (multiAmount / 2).toLocaleString();


            app.element("btn_multi_amount").innerHTML = multiTotal;
            app.element("btn_single_amount").innerHTML = singleTotal;


            //  console.log(total);

        }
    },

    cabinSelect: function (cabinID, cabinMessage, cabinLength) {
        console.log("cabinSelect");
        app.element('cabin_menu_list_' + cabinID).classList.add("modal_traveller_option_active");
        app.element('cabin_menu_list_' + cabinID).innerHTML = cabinMessage;
        app.element('toolbarCabinClass').innerHTML = cabinMessage;

        cabins = [];
        cabinsLength = cabinLength + 1;

        var inactiveCabins;

        for (var i = 1; i < cabinsLength; i++) {
            cabins.push(i);

            if (cabinLength == cabins.length) {
                cabinIndex = cabins.indexOf(parseInt(cabinID));

                inactiveCabins = cabins.splice(cabinIndex, 1);
            }
        }

        // console.log(cabins);

        console.log(inactiveCabins);
        //
        for (var i = 0; i < cabins.length; i++) {
            app.element("cabin_menu_list_" + cabins[i]).classList.remove("modal_traveller_option_active");
            // app.element('cabin_menu_list_'+cabins[i]).innerHTML = cabinMessage;

            // switch(cabinID) {
            //     case '1':
            //         console.log('FIRST CLASS SWICTCH');
            //         app.element('cabin_menu_list_'+cabinID).innerHTML = "First Class";
            //
            //         break;
            //     case '2':
            //         console.log('BUSINESS CLASS SWICTCH');
            //         app.element('cabin_menu_list_'+cabinID).innerHTML = "Business";
            //
            //         break;
            //     default:
            //         console.log('ERROR SWICTH ');
            // }

            // app.element('menu_list_indicator'+cabins[i]).style.display =  cabinMessage;
            // app.element("menu_list_indicator").style.display = "none";

        }
    },

    filterResultSelect: function (listID, listLength) {
        app.element('filter_result_' + listID).classList.add("modal_traveller_option_active");

        lists = [];
        listsLength = listLength + 1;

        var inactiveLists;

        for (var i = 1; i < listsLength; i++) {
            lists.push(i);

            if (listLength == lists.length) {
                listIndex = lists.indexOf(parseInt(listID));

                inactiveLists = lists.splice(listIndex, 1);
            }
        }


        for (var i = 0; i < lists.length; i++) {
            app.element("filter_result_" + lists[i]).classList.remove("modal_traveller_option_active");
        }


    },

    showMenu: function () {

        if (!views.revealView) {
            views.peek("homeMenu");
        } else {
            app.closeHomeMenu();
        }


    },


    closeHomeMenu: function () {
        views.hidePeek("homeMenu");
    },

    tabSelect: function (tabID, tabLength) {
        app.element("toolbar_menu_" + tabID).classList.add("menu_active");

        console.log("tab ID -> " + tabID);


        tabs = [];
        tabsLength = tabLength + 1;
        var inactiveTabs;

        for (var i = 1; i < tabsLength; i++) {
            // CREATE TABS AS ARRAY
            tabs.push(i);

            //GET TAB INDEX WHEN TABS ARE CREATED
            if (tabLength == tabs.length) {
                tabIndex = tabs.indexOf(parseInt(tabID));

                //RETURN ARRAY OF INACTIVE TABS
                inactiveTabs = tabs.splice(tabIndex, 1);
            }
        }

        //ADD CSS PROPERTY TO INACTVE TABS
        for (var i = 0; i < tabs.length; i++) {
            app.element("toolbar_menu_" + tabs[i]).classList.remove("menu_active");
        }


        switch (tabID) {
            case '1':
                console.log(tabID);
                app.resetDestination();
                break;
            case '2':
                console.log(tabID);
                //app.element("departure").style.display = "none";
                //app.element("toolbar_plane").style.display = "none";
                // app.element("toolbar_destination").classList.add("centralize");
                app.element("toolbar_plus").style.display = "none";
                app.element("departure_city").style.display = "flex";
                app.element("arrival_city").style.display = "flex";
                break;
            case '3':
                console.log(tabID);
                app.resetDestination();
                //  app.element("toolbar_plane").style.display = "none";
                app.element("toolbar_plus").style.display = "flex";
                //app.element("departure_city").style.display = "none";
                // app.element("arrival_city").style.display = "none";
                break;
            default:
                console.log("tabID");
        }
    },

    selectContacts: function () {
        views.overlay("contactsList", 40, loadContact);

        function loadContact() {
            console.log("onloadded contact");
            var storedContacts = JSON.parse(localStorage.getItem("contacts"));

            if (storedContacts != null) {
                text = "<ul class='contact_list_item_ul'>";
                for (i = 0; i < storedContacts.length; i++) {
                    text += "<li class='contact_list_item' onclick='app.selectedContactsItem(" + storedContacts[i].id + ")'>" + storedContacts[i].firstName + " " + storedContacts[i].midName + " " + storedContacts[i].surname + "</li>";
                    app.element("contact_list_items").innerHTML = text;
                    // app.element("flight_list").innerHTML = "<p> flight journeys</p>";
                    console.log("repeating records");

                }
            }
        }

        // function selectedContactsItem(firstname) {
        //     console.log(firstname)
        // }

    },

    selectedContactsItem: function (id) {
        console.log(" contact selected");
        console.log("ID")
        console.log(id);
        var storedContacts = JSON.parse(localStorage.getItem("contacts"));
        var storedContactsCount = storedContacts.length - 1;
        var uid = storedContactsCount - id;
        console.log("UID")
        console.log(uid);
        console.log("FIRST NAME")
        console.log(storedContacts[uid].firstName);

        // console.log(middlename);
        // console.log(surname);

    },

    addContact: function () {

        var initialContacts = JSON.parse(localStorage.getItem("contacts"))
        if (initialContacts === null) {
            console.log("contacts is empty. Adding Contacts");
            var contacts = [];
            console.log("clicked addContact");

            // var id = initialContacts.length - 1;
            var firstName = app.element('traveller_firstname').value;
            var midName = app.element('traveller_midname').value;
            var surname = app.element('traveller_surname').value;


            contactsArray = {id: 0, initial: "Mr", firstName: firstName, midName: midName, surname: surname};

            contacts.unshift(contactsArray);
            localStorage.setItem("contacts", JSON.stringify(contacts));
            var storedContacts = JSON.parse(localStorage.getItem("contacts"));
            console.log(storedContacts);

            for (i = 0; i < storedContacts.length; i++) {
                console.log(storedContacts.initial + " -- " + storedContacts.id + "--" + storedContacts.firstName + " - - " + storedContacts.surname)
            }
        } else {

            console.log("Contacts found");
            var contacts = initialContacts;
            var firstName = app.element('traveller_firstname').value;
            var midName = app.element('traveller_midname').value;
            var surname = app.element('traveller_surname').value;

            if (initialContacts.length !== 0) {
                var id = initialContacts.length;

                contactsArray = {id: id, initial: "Mr", firstName: firstName, midName: midName, surname: surname};

                contacts.unshift(contactsArray);
                localStorage.setItem("contacts", JSON.stringify(contacts));

                var storedContacts = JSON.parse(localStorage.getItem("contacts"));
                console.log(storedContacts);
            }
        }
    },

    resetDestination: function () {
        app.element("departure").style.display = "block";
        app.element("toolbar_plane").style.display = "block";
        app.element("toolbar_destination").classList.remove("centralize");
        app.element("toolbar_plus").style.display = "none";
        app.element("departure_city").style.display = "flex";
        app.element("arrival_city").style.display = "flex";
    },

    searchPreloader: function () {


        views.goto("search_preloader", function () {
            console.log("nav to search_preloader")
            app.animatePreloader();

            //Check For Day or Night Time
            now = new Date();
            hour = now.getHours();
            if (hour > 6 && hour < 18) {
                console.log("Day Time");
                app.element("sky_night").style.display = "none";
            } else {
                console.log("Nigt time");
                app.element("sky_night").style.display = "flex";


            }
        })
    },

    addFlight: function () {


        var initialNames = JSON.parse(localStorage.getItem("names"));
        console.log("initialNames");
        console.log(initialNames);
        if (initialNames == null) {

            console.log("record is empty. Adding Record");
            var names = [];


            console.log("names array");
            console.log(names);
            //
            // arrayValue = {departure: "love", arrival: "love"};
            //
            // names.unshift(arrayValue);


            departureValue = app.element('toolbarDepartureCityAlias').value;
            ArrivalValue = app.element('toolbarArrivalCityAlias').value;
            arrayValue = {departure: departureValue, arrival: ArrivalValue};

            names.unshift(arrayValue);

            localStorage.setItem("names", JSON.stringify(names));

            var storedNames = JSON.parse(localStorage.getItem("names"));
            console.log("storedNames");
            console.log(storedNames);
            console.log(storedNames.length);

            text = "<ul>";
            for (i = 0; i < storedNames.length; i++) {
                text += "<li>" + storedNames[i].departure + " - " + storedNames[i].arrival + " - TUE AUG, 25" + "</li>";
                app.element("flight_list").innerHTML = text;
                // app.element("flight_list").innerHTML = "<p> flight journeys</p>";
                console.log("repeating records");

            }


            // console.log(flightList);
            // app.element("flight_list").innerHTML = "<p>flight listed</p>";


            //var dparture = JSON.parse(localStorage.destination);
            //console.log(dparture.departure);

        } else {
            console.log("there is a record. Retrieve and Add Record");


            var names = initialNames;


            console.log("names array");
            console.log(names);

            departureValue = app.element('toolbarDepartureCityAlias').value;
            ArrivalValue = app.element('toolbarArrivalCityAlias').value;
            arrayValue = {departure: departureValue, arrival: ArrivalValue};

            names.unshift(arrayValue);


            localStorage.setItem("names", JSON.stringify(names));

            var storedNames = JSON.parse(localStorage.getItem("names"));
            console.log("storedNames");
            console.log(storedNames);
            console.log(storedNames.length);


            text = "<ul>";
            for (i = 0; i < storedNames.length; i++) {
                text += "<li>" + storedNames[i].departure + " - " + storedNames[i].arrival + " - TUE AUG,25" + "</li>";
                app.element("flight_list").innerHTML = text;
                // app.element("flight_list").innerHTML = "<p> flight journeys</p>";
                console.log("repeating records");

            }
            //
            // text = "<ul>";
            // for (i = 0; i < fLen; i++) {
            //     text += "<li>" + fruits[i] + "</li>";
            // }
            // Try it Yourself »


            console.log(flightList);
            // app.element("flight_list").innerHTML = "<p>flight listed</p>";

            localStorage.destination = JSON.stringify(destination);

            var dparture = JSON.parse(localStorage.destination);
            console.log(dparture.departure);


            //app.element("flight_list").innerHTML = "<p>"+ text +"</p>";


            //localStorage.clear();
        }


    },


    searchResult: function () {
        views.goto("searchResult", function () {
            console.log("nav to searchResult");
        })
    },

    ShowModalTravellerDatepicker: function () {
        views.flash("modalTravellerDatepicker");

        $('#datepickerTraveller').datepicker({
            dateFormat: "dd/M/yyyy",
            onSelect: function (date) {
                console.log(date);
                dateArray = date.split("/");
                console.log(dateArray);
                app.element('travellerDobDate').innerHTML = dateArray[0];
                app.element('travellerDobMonth').innerHTML = dateArray[1];

                app.element('travellerDobYear').innerHTML = dateArray[2];

            }
        });
    },

    showCabinClass: function () {
        views.flash('modalCabinClassPicker');
    },

    closeTravellerDatepickerModal: function () {
        views.hideFlash("modalTravellerDatepicker");
    },
    travellerDetail: function () {
        views.goto("travellerDetail", function () {
            console.log("nav to travellerDetail");
        })
    },

    closeCabinpickerModal: function () {
        console.log("close closeCabinpickerModal");
        views.hideFlash('modalCabinClassPicker');
    },

    closeTravellerpickerModal: function () {
        console.log("close closeTravellerpickerModal");
        views.hideFlash('modalTravellerPicker');
    },

    flightDetail: function () {
        views.goto("flightDetail", function () {
            console.log("nav to flightDetail");
        })
    },

    travellerNext: function () {
        adult = parseInt(app.element('adultCount').innerHTML);
        children = parseInt(app.element('childrenCount').innerHTML);
        infant = parseInt(app.element('infantCount').innerHTML);

        totalTraveller = adult + children + infant;

        app.element('toolbarTotalTraveller').innerHTML = totalTraveller + " PEOPLE";
        //views.hideFlash()
        views.hideFlash("modalTravellerPicker");
    },

    cabinClassNext: function () {
        views.hideFlash('modalCabinClassPicker');
    },

    increment: function (identifier) {
        console.log("increment for - " + identifier);

        count = parseInt(app.element(identifier).innerHTML);
        count += 1;
        app.element(identifier).innerHTML = count;
        console.log("value is - " + count);
        //app.element(identifier).innerHTML = "0";
    },

    decrement: function (identifier) {

        console.log("decrement clicked");
        console.log("decrement for" + identifier);
        count = parseInt(app.element(identifier).innerHTML);
        if (count == 0) {
            app.element(identifier).innerHTML = "0";
        } else {
            count -= 1;
            app.element(identifier).innerHTML = count;
        }


    },

    showTravellerPicker: function () {
        console.log("TRAVELLER PICKER");
        views.flash("modalTravellerPicker");
    },

//setDates:function(departureDate, returnDate){}

    showDatepickerModal: function () {
        console.log("showDatePicker");
        views.flash("modalDatepicker", function () {
            console.log("Starting....");

            var dateFormat = 'dd/mm/yyyy';


            $('#datepicker').datepicker({
                dateFormat: dateFormat, range: true,
                onSelect: function (dates) {


                    // var a = moment(dates);
                    // console.log("moment date is" + a.format('llll'));
                    console.log("date is this" + dates);
                    dateArray = dates.split(",");

                    console.log(dateArray);
                    console.log("array length" + dateArray.length)
                    if (dateArray.length < 2) {
                        console.log("no return");
                        app.element("modalReturn").innerHTML = "select a date";
                        app.element("toolbarReturn").innerHTML = "select a date"
                    } else {
                        ReturnDateArray = moment(dateArray[1], 'DD/MM/YYYY', true).format('llll').split(",");
                        console.log("ReturnDateArray - " + ReturnDateArray);
                        console.log(ReturnDateArray);
                        console.log(ReturnDateArray[0] + "," + ReturnDateArray[1]);
                        ReturnDate = ReturnDateArray[0] + "," + ReturnDateArray[1];
                        app.element("toolbarReturn").innerHTML = ReturnDate;

                        app.element("modalReturn").innerHTML = ReturnDate;
                        // app.element("modalReturn").innerHTML = dateArray[1];
                        // app.element("toolbarReturn").innerHTML = ReturnDateArray[0] + ", " + ReturnDateArray[1];

                    }
                    departureDateArray = moment(dateArray[0], 'DD/MM/YYYY', true).format('llll').split(",");
                    departureDate = departureDateArray[0] + "," + departureDateArray[1];


                    app.element("modalDeparture").innerHTML = departureDate;
                    app.element("toolbarDeparture").innerHTML = departureDate;


                }
            });

            // $('input[name="daterange"]').show();
            //
            //
            // $('input[name="daterange"]').daterangepicker({
            //     singleDatePicker: false,
            //     showDropdowns: true,
            //     alwaysShowCalendars:false,
            //     autoApply:true
            //
            // }).show();
            //
            // $('#my-element').datepicker([options]);

            //
            // $('input[name="daterange"]').on('cancel.daterangepicker', function(ev, picker) {
            //     //do something, like clearing an input
            //
            //
            //     $('#daterange').val('');
            // });


            //
            // $('input[name="daterange"]').daterangepicker().on('changeDate', function (e) {
            //    // $("#my-input").text(e.format());
            //     console.log(e)
            // });

            //   $('input[name="daterange"]').show();

            //var date = $('#datepicker').datepicker({ dateFormat: 'dd-mm-yy' }).val();

        });


    },

    flightDetailBack: function () {
        views.goto("searchResult");
    },

    searchResultBack: function () {
        //console.log("back from search");
        views.goto("home");
    },

    closeDatepickerModal: function () {
        console.log("closeDatepickerModal");
        views.hideFlash("modalDatepicker");

    },

    searchResultRefresh: function () {
        console.log("search refresh");
        app.element("searchResultRefresh").classList.add("rotate");

    },

    travellerBack: function () {
        console.log("travellerBack");
        views.goto("flightDetail");
    },

    searchHistorySelect: function (cardID, cardLength) {
        console.log("history clicked");
        app.element("card_search_" + cardID).classList.add("card_search_active");
        app.element("separator_plane_suggestion_" + cardID).style.display = "none";
        app.element("separator_plane_suggestion_white_" + cardID).style.display = "inline";


        console.log("card ID -> " + cardID);


        cards = [];
        cardsLength = cardLength + 1;
        var inactiveCards;

        for (var i = 1; i < cardsLength; i++) {
            // CREATE TABS AS ARRAY
            cards.push(i);

            //GET TAB INDEX WHEN TABS ARE CREATED
            if (cardLength == cards.length) {
                cardIndex = cards.indexOf(parseInt(cardID));

                //RETURN ARRAY OF INACTIVE TABS
                inactiveCards = cards.splice(cardIndex, 1);
            }
        }

        //ADD CSS PROPERTY TO INACTVE TABS
        for (var i = 0; i < cards.length; i++) {
            console.log(cards[i]);
            app.element("card_search_" + cards[i]).classList.remove("card_search_active");
            app.element("separator_plane_suggestion_" + cards[i]).style.display = "inline";
            app.element("separator_plane_suggestion_white_" + cards[i]).style.display = "none";

            //  app.element("separator_plane_suggestion_white_"+cardID).style.display="none";

            // app.element("separator_plane_suggestion_"+cardID).style.display="inline";
            // app.element("separator_plane_suggestion_white_"+cardID).classList.add("whitePlane");


        }
    },


    doLogin: function () {
        app.showBusy()
        var payload = {"username": "oo", "password": "ooo"};
        app.send("http:facebook.com", payload, function (data) {
            app.hideBusy();

        })
    },

//
//
//END APP LOGIC


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


$(document).ready(function () {
    console.log("jquery is ready");
    // $( function() {
    //     $( "#datepicker" ).datepicker();
    // } );

    $("departure").click(function () {
        // alert("The paragraph was clicked.");
        console.log("hello from button")
    });


});
