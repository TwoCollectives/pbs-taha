// Footer Component Loader
// Dynamically loads footer.html content into the footer-container element

(function() {
  // Function to load and inject footer content
  function loadFooter() {
    const footerContainer = document.getElementById('footer-container');
    
    if (!footerContainer) {
      console.error('Footer container element not found');
      return;
    }

    // Use absolute path to footer.html to avoid issues with trailing slashes
    const footerPath = '/cbty2507/ty-access/footer.html';

    // Fetch the footer content
    fetch(footerPath)
      .then(response => {
        if (!response.ok) {
          throw new Error(`Failed to load footer: ${response.status}`);
        }
        return response.text();
      })
      .then(html => {
        // Inject the footer content
        footerContainer.innerHTML = html;
      })
      .catch(error => {
        console.error('Error loading footer:', error);
        // Fallback content in case of loading failure
        footerContainer.innerHTML = `
          <div class="footer">© 2025 Pegasus. All rights reserved.</div>
        `;
      });
  }

  // Load footer when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', loadFooter);
  } else {
    loadFooter();
  }
})();