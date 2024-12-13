
const sprite = document.getElementById('sprite');
let spriteX = 0;
let spriteVelocityX = 0;
const SPEED = 200;

window.onkeydown = function (e) {
    if (!e.repeat) {
        if (e.key === 'ArrowLeft') {
            sprite.classList.remove('right');
            sprite.classList.add('left', 'walk');
            spriteVelocityX = -SPEED;
        } else if (e.key === 'ArrowRight') {
            sprite.classList.remove('left');
            sprite.classList.add('right', 'walk');
            spriteVelocityX = SPEED;
        }
    }
};

window.onkeyup = function () {
    spriteVelocityX = 0;
    sprite.classList.remove('walk');
};

function updateSpritePosition(timeNow) {
    const delta = (timeNow - lastFrameTime) / 1000;
    spriteX += spriteVelocityX * delta;
    sprite.style.transform = `translateX(${spriteX}px)`;
    lastFrameTime = timeNow;
    requestAnimationFrame(updateSpritePosition);
}

let lastFrameTime = 0;
requestAnimationFrame(updateSpritePosition);


const fetchFactBtn = document.getElementById('fetch-fact');
const catFact = document.getElementById('cat-fact');
const catImage = document.getElementById('cat-image');
const shareFactBtn = document.getElementById('share-fact');

fetchFactBtn.addEventListener('click', async () => {
    catFact.textContent = 'Loading...';
    catImage.style.display = 'none';

    try {

        const factRes = await fetch('https://catfact.ninja/fact');
        const factData = await factRes.json();
        catFact.textContent = factData.fact;

    } catch (error) {
        catFact.textContent = 'Failed to load data.';
        console.error('Error fetching cat fact or image:', error);
    }
});


shareFactBtn.addEventListener('click', () => {
    const factText = catFact.textContent;
    const shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(factText)}`;
    window.open(shareUrl, '_blank');
});


async function fetchCatBreeds() {
    const url = 'https://api.thecatapi.com/v1/breeds';
    const options = {
        method: 'GET',
        headers: {
            'x-api-key': 'live_PShJ2ozZoDhIOSWT1mrlUhDI1n1x9DnZGRmdDmPjmTmBa8YR0ShlhNIiVatJyV1M'
        }
    };

    try {
        const response = await fetch(url, options);
        if (!response.ok) throw new Error(`Failed to fetch cat breeds. Status: ${response.status}`);
        const data = await response.json();
        console.log('Fetched Cat Breeds:', data);
        return data;
    } catch (error) {
        console.error('Error fetching cat breeds:', error);
        return [];
    }
}


document.getElementById('submit-quiz').addEventListener('click', async () => {
    const activity = document.querySelector('input[name="activity"]:checked')?.value;
    const independence = document.querySelector('input[name="independence"]:checked')?.value;
    const grooming = document.querySelector('input[name="grooming"]:checked')?.value;
    const otherPets = document.querySelector('input[name="other-pets"]:checked')?.value;
    const space = document.querySelector('input[name="space"]:checked')?.value;

    if (!activity || !independence || !grooming || !otherPets || !space) {
        alert('Please answer all questions to get your result.');
        return;
    }


    const breeds = await fetchCatBreeds();

    if (!breeds || breeds.length === 0) {
        alert('Could not retrieve cat breeds. Please try again later.');
        return;
    }


    let filteredBreeds = breeds.filter(breed => {
        const isActivityMatch =
            breed.energy_level &&
            ((activity === 'active' && breed.energy_level >= 4) ||
            (activity === 'moderate' && breed.energy_level === 3) ||
            (activity === 'calm' && breed.energy_level <= 2));

        const isGroomingMatch =
            breed.grooming &&
            ((grooming === 'low' && breed.grooming <= 2) ||
            (grooming === 'medium' && breed.grooming === 3) ||
            (grooming === 'high' && breed.grooming >= 4));

        const isIndependenceMatch =
            breed.temperament &&
            ((independence === 'yes' && breed.temperament.includes('Independent')) ||
            (independence === 'no' && breed.temperament.includes('Affectionate')));

        const isOtherPetsMatch =
            otherPets === 'yes' ? true : !breed.temperament.includes('Aggressive');

        const isSpaceMatch =
            ((space === 'large' && breed.adaptability >= 4) ||
            (space === 'medium' && breed.adaptability === 3) ||
            (space === 'small' && breed.adaptability <= 2));

        return isActivityMatch && isGroomingMatch && isIndependenceMatch && isOtherPetsMatch && isSpaceMatch;
    });

    if (filteredBreeds.length === 0) {
        alert('No matching breeds found. Try different answers!');
        return;
    }


    const bestMatch = filteredBreeds[0];


    const imageUrl = `https://api.thecatapi.com/v1/images/search?breed_ids=${bestMatch.id}`;
    try {
        const imageRes = await fetch(imageUrl, {
            method: 'GET',
            headers: {
                'x-api-key': 'live_PShJ2ozZoDhIOSWT1mrlUhDI1n1x9DnZGRmdDmPjmTmBa8YR0ShlhNIiVatJyV1M'
            }
        });
        const imageData = await imageRes.json();
        document.getElementById('breed-image').src = imageData[0]?.url || 'default-cat-image.jpg';
    } catch (error) {
        console.error('Error fetching breed image:', error);
        document.getElementById('breed-image').src = 'default-cat-image.jpg';
    }


    document.getElementById('breed-name').textContent = bestMatch.name;
    document.getElementById('breed-description').textContent = bestMatch.description || 'No description available.';
    document.getElementById('result').style.display = 'block';
});


