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
