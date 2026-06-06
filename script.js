// JavaScript

// --- stats ---
async function loadStats() {
  const grid = document.getElementById('statsGrid');
  if (!grid) return;
  try {
    const res = await fetch('/api/stats');
    if (!res.ok) throw new Error('stats fetch failed');
    const stats = await res.json();

    const keyOrder = ['businesses_partnered', 'successful_placements', 'jobs_posted', 'internships_filled'];
    const sorted = keyOrder
      .map(k => stats.find(s => s.key === k))
      .filter(Boolean)
      .concat(stats.filter(s => !keyOrder.includes(s.key)));

    grid.innerHTML = sorted.map(s => `
      <div class="stat-card stat-card-hero">
        <span class="stat-number" data-target="${s.value}">0</span>
        <span class="stat-label">${s.label}</span>
      </div>
    `).join('');

    animateCounters();
  } catch {
    grid.innerHTML = `
      <div class="stat-card stat-card-hero"><span class="stat-number">32+</span><span class="stat-label">Local businesses partnered</span></div>
      <div class="stat-card stat-card-hero"><span class="stat-number">89+</span><span class="stat-label">Successful placements</span></div>
      <div class="stat-card stat-card-hero"><span class="stat-number">450+</span><span class="stat-label">Jobs posted</span></div>
      <div class="stat-card stat-card-hero"><span class="stat-number">34+</span><span class="stat-label">Internships filled</span></div>
    `;
  }
}

function animateCounters() {
  document.querySelectorAll('.stat-number[data-target]').forEach((el) => {
    const target = Number(el.dataset.target);
    let current = 0;
    const step = Math.ceil(target / 40);
    const interval = setInterval(() => {
      current += step;
      if (current >= target) {
        current = target;
        clearInterval(interval);
      }
      el.textContent = `${current}+`;
    }, 25);
  });
}

// --- reviews ---
async function loadReviews() {
  const grid = document.getElementById('reviewsGrid');
  if (!grid) return;
  try {
    const res = await fetch('/api/reviews');
    if (!res.ok) throw new Error('reviews fetch failed');
    const reviews = await res.json();
    if (!reviews.length) {
      grid.innerHTML = '<p class="reviews-empty">No reviews yet. Be the first to share your experience!</p>';
      return;
    }
    grid.innerHTML = reviews.map(r => {
      const stars = '★'.repeat(r.rating) + '☆'.repeat(5 - r.rating);
      return `
        <div class="review-card">
          <span class="review-label">${r.reviewer_type === 'Business' ? 'Business review' : 'Student review'}</span>
          <div class="review-stars" aria-label="${r.rating} out of 5 stars">${stars}</div>
          <p>"${r.review_text}"</p>
          <strong>— ${r.name}</strong>
        </div>
      `;
    }).join('');
  } catch {
    grid.innerHTML = '<p class="reviews-empty">Reviews are temporarily unavailable.</p>';
  }
}

// --- review form ---
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

  reviewForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    const submitBtn = reviewForm.querySelector('[type="submit"]');
    const reviewer = reviewForm.querySelector('[name="reviewer"]').value.trim();
    const reviewText = reviewForm.querySelector('[name="reviewText"]').value.trim();
    const rating = parseInt(reviewForm.querySelector('[name="rating"]').value || '5', 10);
    const reviewerType = reviewForm.querySelector('[name="reviewerType"]').value || 'unknown';
    if (!reviewer || !reviewText) return;

    submitBtn.disabled = true;
    submitBtn.textContent = 'Sending…';

    try {
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reviewerType, name: reviewer, rating, reviewText }),
      });
      if (!res.ok) throw new Error('submit failed');
      reviewForm.innerHTML = '<p class="review-success">Thank you for your review! It has been submitted.</p>';
      loadReviews();
    } catch {
      submitBtn.disabled = false;
      submitBtn.textContent = 'Send review';
      const err = document.getElementById('review-error') || document.createElement('p');
      err.id = 'review-error';
      err.className = 'review-error';
      err.textContent = 'Something went wrong. Please try again.';
      reviewForm.appendChild(err);
    }
  });
}

// --- gallery render ---
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

  items.forEach((it) => {
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

document.addEventListener('DOMContentLoaded', () => {
  renderGallery();
  loadStats();
  loadReviews();
});
