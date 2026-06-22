// JavaScript

// Helper function to animate stat counters
function animateStats() {
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
}

// Helper to show custom review submission status banner
function showReviewBanner(type, message) {
  const existing = document.querySelector('.review-status-banner');
  if (existing) existing.remove();
  
  const banner = document.createElement('div');
  banner.className = `review-status-banner banner-${type}`;
  banner.textContent = message;
  
  banner.style.padding = '12px 16px';
  banner.style.borderRadius = '8px';
  banner.style.marginTop = '16px';
  banner.style.fontWeight = '500';
  banner.style.fontSize = '0.95rem';
  banner.style.textAlign = 'center';
  
  if (type === 'success') {
    banner.style.backgroundColor = '#d1e7dd';
    banner.style.color = '#0f5132';
    banner.style.border = '1px solid #badbcc';
  } else {
    banner.style.backgroundColor = '#f8d7da';
    banner.style.color = '#842029';
    banner.style.border = '1px solid #f5c2c7';
  }
  
  const form = document.querySelector('.review-form');
  if (form) {
    form.appendChild(banner);
    setTimeout(() => {
      banner.remove();
    }, 6000);
  }
}

// Dynamic database loading
if (window.supabasePromise) {
  window.supabasePromise.then(async (supabaseClient) => {
    if (!supabaseClient) {
      animateStats();
      return;
    }

    // 1. Fetch and apply dynamic statistics
    try {
      const { data: stats, error } = await supabaseClient.from('stats').select('*').eq('id', 1).single();
      if (stats && !error) {
        document.querySelectorAll('.stat-number[data-stat-key]').forEach(el => {
          const key = el.dataset.statKey;
          if (stats[key] !== undefined) {
            el.dataset.target = stats[key];
          }
        });
      }
    } catch (e) {
      console.error("Failed to load statistics from Supabase:", e);
    }
    
    // Always trigger statistics counter animation
    animateStats();

    // 2. Fetch and render approved reviews
    try {
      const reviewsGrid = document.getElementById('reviewsGrid');
      if (reviewsGrid) {
        const { data: reviews, error } = await supabaseClient
          .from('reviews')
          .select('*')
          .eq('approved', true)
          .order('created_at', { ascending: false });

        if (reviews && reviews.length > 0 && !error) {
          reviewsGrid.innerHTML = ''; // Clear fallback static reviews
          reviews.forEach(r => {
            const card = document.createElement('div');
            card.className = 'review-card';
            
            const label = document.createElement('span');
            label.className = 'review-label';
            label.textContent = `${r.reviewer_type} review`;
            card.appendChild(label);
            
            const text = document.createElement('p');
            text.textContent = `“${r.review_text}”`;
            card.appendChild(text);
            
            if (r.rating) {
              const starsContainer = document.createElement('div');
              starsContainer.style.color = '#ffb800';
              starsContainer.style.marginBottom = '8px';
              starsContainer.textContent = '★'.repeat(r.rating) + '☆'.repeat(5 - r.rating);
              card.appendChild(starsContainer);
            }
            
            const author = document.createElement('strong');
            author.textContent = `— ${r.reviewer}`;
            card.appendChild(author);
            
            reviewsGrid.appendChild(card);
          });
        }
      }
    } catch (e) {
      console.error("Failed to load reviews from Supabase:", e);
    }

    // 3. Fetch and render 2-3 most recent jobs
    try {
      const recentJobsContainer = document.getElementById('recentJobsContainer');
      if (recentJobsContainer) {
        const { data: recentJobs, error } = await supabaseClient
          .from('jobs')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(3);

        if (recentJobs && recentJobs.length > 0 && !error) {
          recentJobsContainer.innerHTML = ''; // Clear fallback hardcoded jobs
          recentJobs.forEach(job => {
            const card = document.createElement('a');
            card.href = 'jobs.html';
            card.className = 'recent-job-card';

            if (job.logo) {
              const img = document.createElement('img');
              img.src = job.logo;
              img.alt = job.company;
              img.className = 'recent-job-logo';
              card.appendChild(img);
            } else {
              const circle = document.createElement('span');
              circle.className = 'recent-job-logo';
              circle.style.display = 'inline-flex';
              circle.style.alignItems = 'center';
              circle.style.justifyContent = 'center';
              circle.style.fontWeight = '800';
              circle.style.fontSize = '0.9rem';
              circle.style.color = 'var(--primary)';
              circle.style.background = 'var(--bg)';
              circle.style.width = '42px';
              circle.style.height = '42px';
              circle.style.borderRadius = '10px';
              circle.textContent = job.company.charAt(0);
              card.appendChild(circle);
            }

            const info = document.createElement('div');
            info.className = 'recent-job-info';

            const company = document.createElement('span');
            company.className = 'recent-job-company';
            company.textContent = job.company;
            info.appendChild(company);

            const role = document.createElement('span');
            role.className = 'recent-job-role';
            role.textContent = job.role;
            info.appendChild(role);

            card.appendChild(info);

            const arrow = document.createElement('span');
            arrow.className = 'recent-job-arrow';
            arrow.textContent = '→';
            card.appendChild(arrow);

            recentJobsContainer.appendChild(card);
          });
        }
      }
    } catch (e) {
      console.error("Failed to load recent jobs from Supabase:", e);
    }
  });
} else {
  // If not integrated, fallback immediately
  animateStats();
}

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
    reviewForm.setRating = setRating; // Expose to form object
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

  reviewForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    const reviewer = reviewForm.querySelector('[name="reviewer"]').value.trim();
    const reviewText = reviewForm.querySelector('[name="reviewText"]').value.trim();
    const rating = reviewForm.querySelector('[name="rating"]').value || '5';
    const reviewerType = reviewForm.querySelector('[name="reviewerType"]').value || '';
    if (!reviewer || !reviewText) {
      return;
    }

    const submitBtn = reviewForm.querySelector('button[type="submit"]');
    const originalText = submitBtn.textContent;
    submitBtn.disabled = true;
    submitBtn.textContent = 'Sending...';

    if (window.supabaseClient) {
      try {
        const { error } = await window.supabaseClient
          .from('reviews')
          .insert([{
            reviewer,
            reviewer_type: reviewerType || 'Student',
            rating: Number(rating),
            review_text: reviewText,
            approved: false
          }]);

        if (error) throw error;

        showReviewBanner('success', 'Review submitted! It will appear on the site once approved by an administrator.');
        reviewForm.reset();
        if (reviewForm.setRating) reviewForm.setRating(5);
        
        // Reset active reviewer type button
        typeButtons.forEach(b => b.classList.remove('active'));
        if (typeInput) typeInput.value = '';

      } catch (err) {
        console.error("Error submitting review to Supabase:", err);
        showReviewBanner('error', 'Failed to submit review database. Please try again.');
      } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = originalText;
      }
    } else {
      // Fallback: mailto
      const subject = encodeURIComponent(`Review from ${reviewer}`);
      let bodyText = `Name or business: ${reviewer}\n`;
      if (reviewerType) bodyText += `Type: ${reviewerType}\n`;
      bodyText += `Rating: ${rating} / 5\n\nReview:\n${reviewText}`;
      const body = encodeURIComponent(bodyText);
      window.location.href = `mailto:atxteensneedjobs@gmail.com?subject=${subject}&body=${body}`;
      
      submitBtn.disabled = false;
      submitBtn.textContent = originalText;
    }
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

