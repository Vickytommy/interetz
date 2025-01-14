

  var spy = new Gumshoe('#navbar-navlist  a', {
    // Active classes
    navClass: 'active', // applied to the nav list item
    contentClass: 'active', // applied to the content
  
    offset: 70
  });
  // Smooth scroll 
  var scroll = new SmoothScroll('#navbar-navlist  a', {
    speed: 500,
    offset: 70
  });