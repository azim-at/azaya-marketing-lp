/**
 * Hero Section Mouse Parallax Effect
 * Particles move in opposite direction of mouse movement
 */

(function() {
  'use strict';

  const heroSection = document.getElementById('hero-section');

  if (!heroSection) return;

  const particles = heroSection.querySelectorAll('.hero-particle');

  let mouseX = 0;
  let mouseY = 0;
  let targetX = 0;
  let targetY = 0;

  // Smooth interpolation for buttery smooth animation
  function lerp(start, end, factor) {
    return start + (end - start) * factor;
  }

  // Handle mouse movement
  heroSection.addEventListener('mousemove', function(e) {
    const rect = heroSection.getBoundingClientRect();

    // Calculate mouse position relative to hero section center
    // Values range from -1 to 1
    mouseX = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    mouseY = ((e.clientY - rect.top) / rect.height) * 2 - 1;
  });

  // Reset on mouse leave
  heroSection.addEventListener('mouseleave', function() {
    mouseX = 0;
    mouseY = 0;
  });

  // Animation loop for smooth parallax
  function animate() {
    // Smooth interpolation for fluid movement
    targetX = lerp(targetX, mouseX, 0.15);
    targetY = lerp(targetY, mouseY, 0.15);

    particles.forEach(function(particle) {
      const speed = parseFloat(particle.getAttribute('data-speed')) || 0.3;

      // Move in opposite direction with increased range for more visible effect
      const moveX = -targetX * 80 * speed;
      const moveY = -targetY * 80 * speed;

      // Clamp values to prevent particles from going too far
      const clampedX = Math.max(-100, Math.min(100, moveX));
      const clampedY = Math.max(-100, Math.min(100, moveY));

      // Apply transform while preserving the base animation
      particle.style.transform = `translate(${clampedX}px, ${clampedY}px)`;
    });

    requestAnimationFrame(animate);
  }

  // Start animation loop
  animate();

  // Add parallax to text elements as well for depth
  const heroHeadline = document.querySelector('.mxd-hero-03__headline');

  if (heroHeadline) {
    let textTargetX = 0;
    let textTargetY = 0;

    function animateHeadline() {
      textTargetX = lerp(textTargetX, mouseX, 0.18);
      textTargetY = lerp(textTargetY, mouseY, 0.18);

      // Increased movement for text (opposite direction)
      const moveX = -textTargetX * 50;
      const moveY = -textTargetY * 50;

      // Clamp text movement to larger range
      const clampedX = Math.max(-60, Math.min(60, moveX));
      const clampedY = Math.max(-60, Math.min(60, moveY));

      heroHeadline.style.transform = `translate(${clampedX}px, ${clampedY}px)`;

      requestAnimationFrame(animateHeadline);
    }

    animateHeadline();
  }

  // Performance optimization: Pause animations when page is not visible
  document.addEventListener('visibilitychange', function() {
    if (document.hidden) {
      particles.forEach(function(particle) {
        particle.style.animationPlayState = 'paused';
      });
    } else {
      particles.forEach(function(particle) {
        particle.style.animationPlayState = 'running';
      });
    }
  });

})();
