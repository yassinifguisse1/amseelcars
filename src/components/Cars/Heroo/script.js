gsap.registerPlugin(ScrollTrigger)

document.addEventListener('DOMContentLoaded', () => {
    const contentHolderHeight = document.querySelector('.content-holder').offsetHeight;
    const imgHolderHeight = window.innerHeight;
    const additionalScrollHeight = window.innerHeight 
    const totalBodyHeight = contentHolderHeight + imgHolderHeight + additionalScrollHeight;
    document.body.style.height = `${totalBodyHeight}px`;
})

ScrollTrigger.create({
    trigger: '.website-content',
    start: '-0.1% top',
    end: 'bottom bottom',
    onUpdate: () => {
        
        gsap.set('.website-content', {
            position: 'absolute',
            top: '195%',
        })
    },
    onLeave: () => {
        gsap.set('.website-content', {
            position: 'fixed',
            top: '0',
        })
    }

})
gsap.to('.header .letters:first-child', {
    x: () => -innerWidth * 3,
    scale: 10,
    ease: "power2.inOut",
    scrollTrigger: {
        start: 'top top',
        end: `+=200%`,
        scrub: 1,
    }   
})
gsap.to('.header .letters:last-child', {
    x: () => innerWidth * 3,
    scale: 10,
    ease: "power2.inOut",
    scrollTrigger: {
        start: 'top top',
        end: `+=200%`,
        scrub: 1,
    }   
})

