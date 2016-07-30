$(document).ready(function () {
  var trigger = $('.hamburger'),
      overlay = $('.overlay'),
      isClosed = true;

    trigger.click(function () {
      hamburger_cross();      
    });

    function hamburger_cross() {

      if (isClosed == false) {  
        // Hide opaque layer...        
        // overlay.hide();
        trigger.removeClass('is-open');
        trigger.addClass('is-closed');
        isClosed = true;
      } else {   
        // Make opaque layer...
        // overlay.show();
        trigger.removeClass('is-closed');
        trigger.addClass('is-open');
        isClosed = false;
      }
  }
  
  $('[data-toggle="offcanvas"]').click(function () {
        $('#wrapper').toggleClass('toggled');
  });  
});