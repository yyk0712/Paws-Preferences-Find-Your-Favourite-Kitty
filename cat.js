const TOTAL_CATS = 12;

const stack = document.getElementById("card-stack");
const summary = document.getElementById("summary");
const likedDiv = document.getElementById("liked-cats");
const countSpan = document.getElementById("count");

const tipLike = document.getElementById("tip-like");
const tipDislike = document.getElementById("tip-dislike");

let liked = [];
let currentCard = null;

const cats = Array.from({ length: TOTAL_CATS }, () =>
    `https://cataas.com/cat?width=400&height=500&random=${Math.random()}&t=${Date.now()}`
);

function createCards() {
    cats.forEach((url, i) => {
        const card = document.createElement("div");
        card.className = "cat-card";
        card.dataset.index = i;

        card.innerHTML = `
            <div class="swipe-like-bg"></div>
            <div class="swipe-dislike-bg"></div>
            <img src="${url}" alt="Cat ${i + 1}" onerror="this.src='https://placekitten.com/400/500?image=${i}'" />
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
            // Reset to center
            card.style.transition = "transform 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)";
            card.style.transform = "translate3d(0, 0, 0) rotate(0deg)";
            
            // Hide backgrounds with transition
            if (likeBg) {
                likeBg.style.transition = "opacity 0.3s ease-out";
                likeBg.style.opacity = 0;
            }
            if (dislikeBg) {
                dislikeBg.style.transition = "opacity 0.3s ease-out";
                dislikeBg.style.opacity = 0;
            }
        }
    };

    card.addEventListener("mousedown", start);
    card.addEventListener("mouseleave", end);
    
    // For mouse events on the whole document
    document.addEventListener("mousemove", (e) => {
        if (dragging && currentCard === card) move(e);
    });
    
    document.addEventListener("mouseup", (e) => {
        if (dragging && currentCard === card) {
            end();
            currentCard = null;
        }
    });

    // Touch events
    card.addEventListener("touchstart", start, { passive: false });
    card.addEventListener("touchmove", (e) => {
        if (dragging && currentCard === card) {
            move(e);
            e.preventDefault();
        }
    }, { passive: false });
    
    card.addEventListener("touchend", () => {
        if (dragging && currentCard === card) {
            end();
            currentCard = null;
        }
    });
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
    const idx = card.dataset.index;
    
    if (isLiked) {
        liked.push(cats[idx]);
        console.log(`Liked cat ${idx + 1}, total liked: ${liked.length}`);
    } else {
        console.log(`Disliked cat ${idx + 1}`);
    }

    setTimeout(() => {
        card.remove();
        if (!stack.children.length) {
            showSummary();
        }
    }, 500);
}

function showSummary() {
    summary.style.display = "block";
    countSpan.textContent = liked.length;
    
    liked.forEach(url => {
        const img = document.createElement("img");
        img.src = url;
        likedDiv.appendChild(img);
    });
    
    console.log(`Summary: Liked ${liked.length} cats`);
}

// Initialize
createCards();

console.log("Paws & Preferences app loaded!");
console.log("Swipe left for NOPE, right for LIKE");
