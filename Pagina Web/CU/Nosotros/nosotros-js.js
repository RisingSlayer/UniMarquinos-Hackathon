function scrollToSection(targetId) {
    const targetElement = document.getElementById(targetId);

    if (targetElement) {
        const targetOffset = targetElement.offsetTop;

        document.documentElement.style.scrollBehavior = 'smooth';
        window.scrollTo({
            top: targetOffset,
            behavior: 'smooth'
        });

        setTimeout(() => {
            document.documentElement.style.scrollBehavior = 'auto';
        }, 3000);
    }
}
