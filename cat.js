const TOTAL_CATS = 12;

const stack = document.getElementById("card-stack");
const summary = document.getElementById("summary");
const likedDiv = document.getElementById("liked-cats");
const dislikedDiv = document.getElementById("disliked-cats");
const likedCountSpan = document.getElementById("liked-count");
const dislikedCountSpan = document.getElementById("disliked-count");
const restartBtn = document.getElementById("restart-btn");

const tipLike = document.getElementById("tip-like");
const tipDislike = document.getElementById("tip-dislike");

let liked = [];
let disliked = [];
let currentCard = null;

const cats = Array.from({ length: TOTAL_CATS }, (_, i) => ({
    id: i,
    url: `https://cataas.com/cat?width=400&height=500&random=${Math.random()}&t=${Date.now()}`,
    name: `Cat ${i + 1}`
}));

function createCards() {
    cats.forEach((cat, i) => {
        const card = document.createElement("div");
        card.className = "cat-card";
        card.dataset.id = cat.id;

        card.innerHTML = `
            <div class="swipe-like-bg"></div>
            <div class="swipe-dislike-bg"></div>
            <img src="${cat.url}" alt="${cat.name}" 
                 onerror="this.src='https://placekitten.com/400/500?image=${i}'" />
            <div class="card-name">${cat.name}</div>
        `;

        addSwipe(card);
        stack.appendChild(card);
    });
    
    console.log(`Created ${TOTAL_CATS} cards`);
}

function addSwipe(card) {
    let startX = 0, currentX = 0, dragging = false;

    const start = e => {
        dragging = true;
        currentCard = card;
        startX = e.touches ? e.touches[0].clientX : e.clientX;
        card.style.transition = "none";
        e.preventDefault();
    };

    const move = e => {
        if (!dragging) return;

        currentX = e.touches ? e.touches[0].clientX : e.clientX;
        const dx = currentX - startX;
        const rotation = dx * 0.08;
        
        card.style.transform = `translate3d(${dx}px, 0, 0) rotate(${rotation}deg)`;

        const likeBg = card.querySelector('.swipe-like-bg');
        const dislikeBg = card.querySelector('.swipe-dislike-bg');
        
        if (dx > 30) {
            let strength = Math.min(dx / 120, 1);
            
            tipLike.style.opacity = strength;
            tipLike.style.transform = `translateY(-50%) rotate(-10deg) scale(${1 + strength * 0.4})`;
            tipDislike.style.opacity = 0;
            
            if (likeBg) {
                likeBg.style.opacity = strength;
                likeBg.style.transform = `scale(${1 + strength * 0.05})`;
            }
            if (dislikeBg) dislikeBg.style.opacity = 0;
            
        } else if (dx < -30) {
            let strength = Math.min(Math.abs(dx) / 120, 1);
            
            tipDislike.style.opacity = strength;
            tipDislike.style.transform = `translateY(-50%) rotate(10deg) scale(${1 + strength * 0.4})`;
            tipLike.style.opacity = 0;
            
            if (dislikeBg) {
                dislikeBg.style.opacity = strength;
                dislikeBg.style.transform = `scale(${1 + strength * 0.05})`;
            }
            if (likeBg) likeBg.style.opacity = 0;
            
        } else {
            tipLike.style.opacity = 0;
            tipDislike.style.opacity = 0;
            
            if (likeBg) likeBg.style.opacity = 0;
            if (dislikeBg) dislikeBg.style.opacity = 0;
        }
    };

    const end = () => {
        if (!dragging) return;
        dragging = false;

        tipLike.style.opacity = 0;
        tipDislike.style.opacity = 0;

        const dx = currentX - startX;
        
        const likeBg = card.querySelector('.swipe-like-bg');
        const dislikeBg = card.querySelector('.swipe-dislike-bg');

        if (dx > 100) {
            console.log("Swiped RIGHT (LIKE)");
            swipeRight(card);
        } else if (dx < -100) {
            console.log("Swiped LEFT (DISLIKE)");
            swipeLeft(card);
        } else {
            card.style.transition = "transform 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)";
            card.style.transform = "translate3d(0, 0, 0) rotate(0deg)";
            
            if (likeBg) {
                likeBg.style.transition = "opacity 0.3s ease-out";
                likeBg.style.opacity = 0;
            }
            if (dislikeBg) {
                dislikeBg.style.transition = "opacity 0.3s ease-out";
                dislikeBg.style.opacity = 0;
            }
        }
        
        currentCard = null;
    };

    card.addEventListener("mousedown", start);
    card.addEventListener("mouseleave", end);
    
    const handleMouseMove = (e) => {
        if (dragging && currentCard === card) move(e);
    };
    
    const handleMouseUp = (e) => {
        if (dragging && currentCard === card) {
            end();
        }
    };

    card.addEventListener("touchstart", start, { passive: false });
    const handleTouchMove = (e) => {
        if (dragging && currentCard === card) {
            move(e);
            e.preventDefault();
        }
    };
    
    const handleTouchEnd = () => {
        if (dragging && currentCard === card) {
            end();
        }
    };
    
    card._handleMouseMove = handleMouseMove;
    card._handleMouseUp = handleMouseUp;
    card._handleTouchMove = handleTouchMove;
    card._handleTouchEnd = handleTouchEnd;
    
    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
    document.addEventListener("touchmove", handleTouchMove, { passive: false });
    document.addEventListener("touchend", handleTouchEnd);
}

function swipeRight(card) {
    card.style.transition = "transform 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275), opacity 0.5s ease-out";
    card.style.transform = "translate3d(600px, 0, 0) rotate(25deg)";
    card.style.opacity = "0";
    saveResult(card, true);
}

function swipeLeft(card) {
    card.style.transition = "transform 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275), opacity 0.5s ease-out";
    card.style.transform = "translate3d(-600px, 0, 0) rotate(-25deg)";
    card.style.opacity = "0";
    saveResult(card, false);
}

function saveResult(card, isLiked) {
    const catId = parseInt(card.dataset.id);
    const cat = cats.find(c => c.id === catId);
    
    if (isLiked) {
        liked.push(cat);
        console.log(`Liked cat ${catId + 1}, total liked: ${liked.length}`);
    } else {
        disliked.push(cat);
        console.log(`Disliked cat ${catId + 1}, total disliked: ${disliked.length}`);
    }

    setTimeout(() => {
        card.remove();
        if (!stack.children.length) {
            setTimeout(() => {
                showSummary();
            }, 300);
        }
    }, 500);
}

function showSummary() {
    summary.classList.add("show");
    document.getElementById("app-container").classList.add("show-summary");
    
    likedCountSpan.textContent = liked.length;
    dislikedCountSpan.textContent = disliked.length;
    
    likedDiv.innerHTML = '';
    dislikedDiv.innerHTML = '';
    
    if (liked.length > 0) {
        liked.forEach(cat => {
            const img = document.createElement("img");
            img.src = cat.url;
            img.alt = cat.name;
            img.title = cat.name;
            likedDiv.appendChild(img);
        });
    } else {
        likedDiv.innerHTML = '<div class="empty-state">No cats liked yet 😿</div>';
    }
    
    if (disliked.length > 0) {
        disliked.forEach(cat => {
            const img = document.createElement("img");
            img.src = cat.url;
            img.alt = cat.name;
            img.title = cat.name;
            img.style.opacity = "0.7";
            img.style.filter = "grayscale(30%)";
            dislikedDiv.appendChild(img);
        });
    } else {
        dislikedDiv.innerHTML = '<div class="empty-state">No cats disliked yet 😸</div>';
    }
    
    summary.scrollTop = 0;
    
    console.log(`Summary: Liked ${liked.length} cats, Disliked ${disliked.length} cats`);
}

function restartApp() {
    summary.classList.remove("show");
    
    setTimeout(() => {
        document.getElementById("app-container").classList.remove("show-summary");
        
        liked = [];
        disliked = [];
        
        stack.innerHTML = '';
        createCards();
        
        console.log("App restarted!");
    }, 300);
}

restartBtn.addEventListener("click", restartApp);

document.addEventListener("keydown", (e) => {
    const topCard = stack.lastElementChild;
    if (!topCard) return;
    
    switch(e.key) {
        case 'ArrowRight':
        case 'd':
        case 'D':
            swipeRight(topCard);
            break;
        case 'ArrowLeft':
        case 'a':
        case 'A':
            swipeLeft(topCard);
            break;
        case 'r':
        case 'R':
            restartApp();
            break;
    }
});

createCards();

console.log("Paws & Preferences app loaded!");
console.log("Swipe left (←) for NOPE, right (→) for LIKE");
console.log("Keyboard: A/← = Dislike, D/→ = Like, R = Restart");