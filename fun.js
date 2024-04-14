//show menu//

const navMenu = document.getElementById("nav-menu"),
  navToggle = document.getElementById("nav-toggle"),
  navClose = document.getElementById("nav-close");

/*===== MENU SHOW =====*/
/* Validate if constant exists #*/
if (navToggle) {
  navToggle.addEventListener("click", () => {
    navMenu.classList.add("show-menu");
  });
}
/*===== MENU HIDDEN =====*/
/* Validate if constant exists */
if (navClose) {
  navClose.addEventListener("click", () => {
    navMenu.classList.remove("show-menu");
  });
}


/* ———————————— remove menu mobile ——————————*/
const navLink = document.querySelectorAll('.nav__link')
function linkAction(){
const navMenu = document.getElementById('nav-menu')
// When we click on each nav__link, we remove the show-
navMenu.classList.remove('show-menu')
}
navLink.forEach(n => n.addEventListener('click', linkAction))


/*=============== CHANGE BACKGROUND HEADER ===============*/
function scrollHeader() {
    const header = document.getElementById('header');
    // When the scroll is greater than 50 viewport height, add the scroll-header class to the header tag
    if (window.scrollY >= 50) {
      header.classList.add('scroll-header');
    } else {
      header.classList.remove('scroll-header');
    }
  }
  
  // Call scrollHeader when the page loads
  window.addEventListener('load', function() {
    scrollHeader();
    
    // Attach scroll event listener
    window.addEventListener('scroll', scrollHeader);
  });

  /*popular swiper*/
 let swiperPopular = new Swiper(".popular__container", {
   loop:true,
   spaceBetween:24,
   slidesPerView:'auto',
   grabCursor:true,
   pagination: {
      el: ".swiper-pagination",
      dynamicBullets: true,
    },

    breakpoints: {
      768: {
        slidesPerView: 3,

      },
      1024: {
        spaceBetween: 48,
      },
    },
  });

  /*show scroll up*/

  function scrollup() {
    const scrollUp = document.getElementById('scroll-up');
    /* When the scroll is higher than 350 viewport height, add the show-scroll class to the a tag with the scroll-t*/
    if (window.scrollY >= 350) {
      scrollUp.classList.add('show-scroll');
    } else {
      scrollUp.classList.remove('show-scroll');
    }
  }
  
  window.addEventListener('scroll', scrollup); 
  
    const sections=document.querySelectorAll('section[id]')
function scrollActive(){
  const scrollY=window.pageYOffset

  sections.forEach(current=>{
const sectionHeight=current.offsetHeight,
sectionTop=current.offsetTop-58,
sectionId=current.getAttribute('id')


if(scrollY>sectionTop&& scrollY <= sectionTop+sectionHeight){

  document.querySelector('.nav__menu a[href*='+sectionId+']').classList.add('active-link')}
  else{
    document.querySelector('.nav__menu a[href*='+sectionId+']').classList.remove('active-link')}
  
  })
}  
window.addEventListener('scroll',scrollActive)



/*scroll reveal*/
const sr=ScrollReveal({
   origin:'top',
   distance: '60px',
   duration:2500,
   delay:400

})

sr.reveal('.home_title,.popular__container,.features__img')
sr.reveal('.home_subtitle',{delay:500})
sr.reveal('.home__elec',{delay:600})
sr.reveal('.home__img',{delay:800})
sr.reveal('.home__car-data',{delay:900,interval:100,origin:'bottom'})
sr.reveal('.home__button',{delay:500,origin:'bottom'})
sr.reveal('.about__group,.offer__data',{origin:'left'})
sr.reveal('.about__data,.offer__img',{origin:'right'})
sr.reveal('.features__map',{delay:600,origin:'bottom'})
sr.reveal('.features__card',{interval:300})
sr.reveal('.footer',{interval:100})


/*Login & Signup*/

const sign_in_btn = document.querySelector('#sign-in-button');
const sign_up_btn = document.querySelector('#sign-up-button');
const container = document.querySelector('.container2');

console.log(sign_in_btn);

sign_up_btn.addEventListener('click', () => {
  container.classList.add('sign-up-mode');
});

sign_in_btn.addEventListener('click', () => {
  container.classList.remove('sign-up-mode');
});


function goToSpecificPage() {
  window.location.href = "https://example.com/"; // Replace this with the URL of the specific page you want to navigate to
}