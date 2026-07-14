document.addEventListener("DOMContentLoaded", () => {

    // Reveal Animation
    const reveals = document.querySelectorAll(".reveal");

    reveals.forEach(el => {
        el.classList.add("is-visible");
    });

    // Navbar Shadow
    const navbar = document.querySelector(".navbar");

    window.addEventListener("scroll", () => {

        if(window.scrollY > 30){
            navbar.classList.add("scrolled");
        }else{
            navbar.classList.remove("scrolled");
        }

    });

});