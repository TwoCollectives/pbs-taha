/**
 * Lazy Video Loader for Vimeo Players
 * Optimizes page load by only loading videos when needed
 * Features: lazy loading, hover preloading, played video tracking
 */

(function() {
    'use strict';
  
    // State management
    let currentTab = 0;
    let vimeoPlayers = [];
    let playedVideos = new Set();
    let loadedVideos = new Set();
  
    /**
     * Load a video iframe by replacing about:blank with actual Vimeo URL
     */
    function loadVideo(iframe) {
      if (!iframe) return;
      
      const currentSrc = iframe.getAttribute('src');
      const vimeoSrc = iframe.getAttribute('data-vimeo-src');
      
      // Only load if it's still the placeholder and has a vimeo source
      if (vimeoSrc && currentSrc === 'about:blank') {
        // Add loading indicator
        iframe.classList.add('video-loading');
        
        iframe.setAttribute('src', vimeoSrc);
        loadedVideos.add(iframe);
        
        // Remove loading indicator after video starts loading
        setTimeout(() => {
          iframe.classList.remove('video-loading');
        }, 1500);
      }
    }
  
    /**
     * Preload video on hover for better UX
     */
    function preloadVideo(index) {
      const modules = document.querySelectorAll(".module-card");
      const module = modules[index];
      if (module) {
        const iframe = module.querySelector("iframe");
        if (iframe) {
          loadVideo(iframe);
        }
      }
    }
  
    /**
     * Show a specific tab and manage video loading
     */
    function showTab(index) {
      // Update tab buttons
      const tabButtons = document.querySelectorAll(".tab-button");
      tabButtons.forEach((button, i) => {
        button.classList.toggle("active", i === index);
      });
  
      // Update content visibility using classList
      const modules = document.querySelectorAll(".module-card");
      modules.forEach((module, i) => {
        if (i === index) {
          module.classList.remove("hidden");
          module.style.display = "block";
        } else {
          module.classList.add("hidden");
        }
      });
  
      // Pause all videos except those that have been played
      vimeoPlayers.forEach((player) => {
        const iframe = player.element;
        // Only pause if the video hasn't been started yet
        if (!playedVideos.has(iframe)) {
          player.api.pause().catch((err) => console.error("Error pausing video:", err));
        }
      });
  
      // Load and initialize Vimeo player for the current tab
      const activeModule = modules[index];
      if (activeModule) {
        const iframe = activeModule.querySelector("iframe");
        if (iframe) {
          // Load the video if not already loaded
          loadVideo(iframe);
          
          // Initialize player after a small delay to ensure src is set
          setTimeout(() => {
            const currentSrc = iframe.getAttribute('src');
            let player = vimeoPlayers.find((p) => p.element === iframe);
            
            // Only initialize if we have a real Vimeo URL and no player exists yet
            if (!player && currentSrc && currentSrc !== 'about:blank') {
              player = new Vimeo.Player(iframe);
              vimeoPlayers.push({
                element: iframe,
                api: player,
              });
              
              // Track when video is played
              player.on('play', () => {
                playedVideos.add(iframe);
              });
            }
          }, 150);
        }
      }
  
      // Handle special navigation for Module 7 if it exists
      const extraNav = document.getElementById("module7-extra-nav");
      if (extraNav) {
        extraNav.style.display = index === 7 ? "flex" : "none";
      }
  
      // Show bonus sections for specific modules (if they exist)
      document.querySelectorAll(".bonus-section").forEach(section => {
        section.style.display = "none";
      });
      
      if (index === 2 && document.getElementById("bonus2")) {
        document.getElementById("bonus2").style.display = "block";
      }
      if (index === 4 && document.getElementById("bonus4")) {
        document.getElementById("bonus4").style.display = "block";
      }
  
      currentTab = index;
      updateNavigationButtons();
    }
  
    /**
     * Navigate to previous tab
     */
    function goToPreviousTab() {
      if (currentTab > 0) {
        showTab(currentTab - 1);
      }
    }
  
    /**
     * Navigate to next tab
     */
    function goToNextTab() {
      const totalTabs = document.querySelectorAll(".tab-button").length;
      if (currentTab < totalTabs - 1) {
        showTab(currentTab + 1);
      }
    }
  
    /**
     * Update navigation button states
     */
    function updateNavigationButtons() {
      const prevButtons = document.querySelectorAll(".prev-btn");
      const nextButtons = document.querySelectorAll(".next-btn");
      const totalTabs = document.querySelectorAll(".tab-button").length;
  
      // Update previous buttons
      prevButtons.forEach(button => {
        button.disabled = currentTab === 0;
      });
  
      // Update next buttons
      nextButtons.forEach(button => {
        button.disabled = currentTab === totalTabs - 1;
      });
    }
  
    /**
     * Initialize lazy video loading on page load
     */
    function initLazyVideoLoading() {
      // Initialize the welcome video player immediately (it has full src)
      const welcomeModule = document.getElementById('welcome-tab');
      if (welcomeModule) {
        const iframe = welcomeModule.querySelector('iframe');
        if (iframe) {
          const player = new Vimeo.Player(iframe);
          vimeoPlayers.push({
            element: iframe,
            api: player,
          });
          
          // Track when video is played
          player.on('play', () => {
            playedVideos.add(iframe);
          });
        }
      }
      
      // Add hover listeners to tab buttons for predictive loading
      const tabButtons = document.querySelectorAll(".tab-button");
      tabButtons.forEach((button, index) => {
        button.addEventListener('mouseenter', () => {
          preloadVideo(index);
        });
      });
      
      // Show the first tab
      showTab(0);
    }
  
    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', initLazyVideoLoading);
    } else {
      initLazyVideoLoading();
    }
  
    // Expose functions to global scope for HTML onclick handlers
    window.showTab = showTab;
    window.goToPreviousTab = goToPreviousTab;
    window.goToNextTab = goToNextTab;
  })();
  
  