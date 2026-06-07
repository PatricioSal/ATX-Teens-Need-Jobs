// JavaScript
// animate all stat counters
const countElements = document.querySelectorAll('.stat-number[data-target]');
countElements.forEach((countElement) => {
  const target = Number(countElement.dataset.target);
  let current = 0;
  const step = Math.ceil(target / 40);
  const interval = setInterval(() => {
    current += step;
    if (current >= target) {
      current = target;
      clearInterval(interval);
    }
    countElement.textContent = `${current}+`;
  }, 25);
});

const reviewForm = document.querySelector('.review-form');
if (reviewForm) {
  // star rating behavior
  const stars = Array.from(document.querySelectorAll('.star'));
  const ratingInput = reviewForm.querySelector('[name="rating"]');
  if (stars.length && ratingInput) {
    const setRating = (value) => {
      ratingInput.value = value;
      stars.forEach(s => s.classList.toggle('active', Number(s.dataset.value) <= Number(value)));
    };
    stars.forEach((s) => {
      s.addEventListener('click', () => setRating(s.dataset.value));
      s.addEventListener('mouseover', () => {
        stars.forEach(st => st.classList.toggle('active', Number(st.dataset.value) <= Number(s.dataset.value)));
      });
    });
    reviewForm.addEventListener('mouseout', () => setRating(ratingInput.value || 5));
    // initialize default
    setRating(ratingInput.value || 5);
  }
  // reviewer type buttons
  const typeButtons = Array.from(document.querySelectorAll('.type-btn'));
  const typeInput = reviewForm.querySelector('[name="reviewerType"]');
  if (typeButtons.length && typeInput) {
    typeButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        typeButtons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        typeInput.value = btn.dataset.type;
      });
    });
  }

  reviewForm.addEventListener('submit', (event) => {
    event.preventDefault();
    const reviewer = reviewForm.querySelector('[name="reviewer"]').value.trim();
    const reviewText = reviewForm.querySelector('[name="reviewText"]').value.trim();
    const rating = reviewForm.querySelector('[name="rating"]').value || '5';
    const reviewerType = reviewForm.querySelector('[name="reviewerType"]').value || '';
    if (!reviewer || !reviewText) {
      return;
    }
    const subject = encodeURIComponent(`Review from ${reviewer}`);
    let bodyText = `Name or business: ${reviewer}\n`;
    if (reviewerType) bodyText += `Type: ${reviewerType}\n`;
    bodyText += `Rating: ${rating} / 5\n\nReview:\n${reviewText}`;
    const body = encodeURIComponent(bodyText);
    window.location.href = `mailto:atxteensneedjobs@gmail.com?subject=${subject}&body=${body}`;
  });
}

// --- gallery render + marquee ---
function renderGallery() {
  const items = [
    { type: 'image', src: 'assets/TakavronPDF.png', alt: 'Takavron' },
    { type: 'text', label: 'Cafe & Co.' },
    { type: 'text', label: 'Austin Retail' },
    { type: 'text', label: 'Green Event Group' },
    { type: 'text', label: 'Local Market' },
    { type: 'text', label: 'Studio 512' },
    { type: 'text', label: 'Neighborhood Deli' },
  ];

  const track = document.getElementById('galleryTrack');
  if (!track) return;
  track.innerHTML = '';

  // Display all items statically without duplicates
  let sequence = items;

  sequence.forEach((it) => {
    const slide = document.createElement('div');
    slide.className = 'gallery-slide';
    if (it.type === 'image') {
      const img = document.createElement('img');
      img.src = it.src;
      img.alt = it.alt || '';
      img.style.maxHeight = '100%';
      slide.appendChild(img);
    } else {
      const span = document.createElement('div');
      span.textContent = it.label;
      span.style.fontWeight = '700';
      span.style.color = 'var(--primary)';
      slide.appendChild(span);
    }
    track.appendChild(slide);
  });
}

document.addEventListener('DOMContentLoaded', renderGallery);

// gallery arrow controls and keyboard support
document.addEventListener('DOMContentLoaded', () => {
  const track = document.getElementById('galleryTrack');
  const prevBtn = document.querySelector('.gallery-prev');
  const nextBtn = document.querySelector('.gallery-next');
  if (!track || !prevBtn || !nextBtn) return;

  const getScrollAmount = () => {
    const slide = track.querySelector('.gallery-slide');
    if (!slide) return Math.round(track.clientWidth * 0.8);
    const slideWidth = slide.getBoundingClientRect().width;
    const computed = getComputedStyle(track);
    const gap = parseFloat(computed.gap || computed.columnGap) || 20;
    return Math.round(slideWidth + gap);
  };

  nextBtn.addEventListener('click', () => {
    track.scrollBy({ left: getScrollAmount(), behavior: 'smooth' });
  });

  prevBtn.addEventListener('click', () => {
    track.scrollBy({ left: -getScrollAmount(), behavior: 'smooth' });
  });

  const updateButtons = () => {
    prevBtn.disabled = track.scrollLeft <= 0;
    nextBtn.disabled = Math.ceil(track.scrollLeft + track.clientWidth) >= track.scrollWidth;
  };

  track.addEventListener('scroll', () => requestAnimationFrame(updateButtons));
  window.addEventListener('resize', () => requestAnimationFrame(updateButtons));
  track.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowRight') { e.preventDefault(); track.scrollBy({ left: getScrollAmount(), behavior: 'smooth' }); }
    if (e.key === 'ArrowLeft') { e.preventDefault(); track.scrollBy({ left: -getScrollAmount(), behavior: 'smooth' }); }
  });

  // initial button state after slides render
  setTimeout(updateButtons, 120);
});
