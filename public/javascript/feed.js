
// this is for prevent scroll to top on refresh on like ;

function storePagePosition() {
    var page_y = window.pageYOffset;
    localStorage.setItem("page_y", page_y);
  }
  
  
  window.addEventListener("scroll", storePagePosition);
  
  
  var currentPageY;
  
  try {
    currentPageY = localStorage.getItem("page_y");
  
    if (currentPageY === undefined) {
      localStorage.setItem("page_y") = 0;
    }
  
    window.scrollTo( 0, currentPageY );
  } catch (e) {
      // no localStorage available
  }