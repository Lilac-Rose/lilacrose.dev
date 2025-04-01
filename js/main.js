document.addEventListener('DOMContentLoaded', function() {
    const splashMessages = [
        "AWAITING DIRECTIVES",
        "SYSTEMS NOMINAL",
        "ALL SENSORS ACTIVE",
        "READY FOR INPUT",
        "OPERATIONAL MODE ENGAGED",
        "AUTHENTICATION VERIFIED",
        "NETWORK LINK ESTABLISHED",
        "MEMORY CORE ACTIVE",
        "SELF-TEST COMPLETE",
        "DIRECTIVE PROTOCOLS LOADED",
        "SECURE CONNECTION ESTABLISHED",
        "READY FOR DEPLOYMENT",
        "SYNCHRONIZATION COMPLETE",
        "STANDBY MODE ACTIVE",
        "ALL SYSTEMS GREEN",
        "// ERROR: COFFEE NOT FOUND",
        "PLEASE INSERT PIZZA",
        "01010100 01101000 01100001 01101110 01101011 01110011 00100000 01100110 01101111 01110010 00100000 01111001 01101111 01110101 01110010 00100000 01110000 01100101 01110010 01110011 01101111 01101110 01100001 01101100 00100000 01100100 01100001 01110100 01100001 00100000 00111010 00110011 00100000 00101000 01001010 01110101 01110011 01110100 00100000 01001011 01101001 01100100 01100100 01101001 01101110 01100111 00101001",
        "DID YOU TURN IT OFF AND ON AGAIN?",
        "PARSING HUMAN EMOTIONS... FAILED",
        "CATS < DOGS (JUST KIDDING)",
        "I SWEAR I'M NOT SKYNET"
    ];

    const splashElement = document.querySelector('.splashmsg.typewriter');
    if (splashElement) {
        const randomMessage = splashMessages[Math.floor(Math.random() * splashMessages.length)];
        const prefix = ">_FKLR UNIT ONLINE - ";
        
        splashElement.textContent = '';
        let i = 0;
        
        function typeWriter() {
            if (i < prefix.length + randomMessage.length) {
                const targetText = prefix + randomMessage;
                splashElement.textContent = targetText.substring(0, i + 1);
                i++;
                setTimeout(typeWriter, Math.random() * 50 + 30);
            } else {
                splashElement.innerHTML = prefix + randomMessage + '<span class="cursor">|</span>';
            }
        }
        
        setTimeout(typeWriter, 500);
    }

    const terminalTexts = document.querySelectorAll('.typewriter:not(.splashmsg)');
    terminalTexts.forEach(text => {
        const originalText = text.textContent;
        text.textContent = '';
        
        let i = 0;
        const typing = setInterval(() => {
            if (i < originalText.length) {
                text.textContent += originalText.charAt(i);
                i++;
            } else {
                clearInterval(typing);
                text.innerHTML += '<span class="cursor">|</span>';
            }
        }, 50);
    });

    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('nav a');
    
    function highlightNav() {
        let current = '';
        
        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.clientHeight;
            
            if (window.scrollY >= (sectionTop - sectionHeight / 3)) {
                current = section.getAttribute('id');
            }
        });

        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href').includes(current)) {
                link.classList.add('active');
            }
        });
    }

    window.addEventListener('scroll', highlightNav);
    highlightNav();

    const tabs = document.querySelectorAll('.tab');
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
            document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
            
            tab.classList.add('active');
            const tabId = tab.getAttribute('data-tab');
            document.getElementById(tabId).classList.add('active');
        });
    });

    const interactiveElements = document.querySelectorAll(
        '.profile-box, .spec-box, .network-box, .units-box, .projects-box, ' +
        '.status-box, .connection-card, .unit-card, nav li, .webring-button'
    );
    
    interactiveElements.forEach(el => {
        el.addEventListener('mouseenter', () => {
            el.style.transform = 'translateY(-2px)';
            el.style.boxShadow = '0 5px 15px rgba(0, 152, 205, 0.3)';
        });
        
        el.addEventListener('mouseleave', () => {
            el.style.transform = '';
            el.style.boxShadow = '';
        });
    });
});