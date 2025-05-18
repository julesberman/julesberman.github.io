function highlightAuthorName(authors) {
  return authors.replace(/Jules\s+Berman|J\.\s*Berman/g, '<span class="author-highlight">$&</span>');
}

document.addEventListener('DOMContentLoaded', function () {
  fetch('papers/papers.json')
    .then(response => response.json())
    .then(data => {
      const container = document.getElementById('papers-container');
      if (!container) return;

      container.innerHTML = '';

      data.papers.forEach(paper => {
        const paperElement = document.createElement('div');
        paperElement.className = 'paper-card';
        const arxivLink = paper.arxiv ? `<a href="${paper.arxiv}" class="paper-link arxiv-link" target="_blank">arXiv</a>` : '';
        const codeLink = paper.code ? `<a href="${paper.code}" class="paper-link code-link" target="_blank">Code</a>` : '';
        const linksHTML = (arxivLink || codeLink) ? `<div class="paper-links">${arxivLink} ${codeLink}</div>` : '';

        paperElement.innerHTML = `
          <div class="paper-content-wrapper">
            <div class="paper-image-container">
              <img src="papers/${paper.image}" alt="${paper.title}" class="paper-image">
            </div>
            <div class="paper-content">
              <div class="paper-header">
                <h3 class="paper-title">${paper.title}</h3>
              </div>
              <div class="paper-links-container">
                ${linksHTML}
              </div>
              <div class="paper-meta">
                <span class="paper-authors">${highlightAuthorName(paper.authors)}</span>
                <span class="paper-separator">•</span>
                <span class="paper-publication">${paper.publication}</span>
              </div>
              <div class="abstract-container">
                <p class="paper-abstract collapsed">${paper.abstract}</p>
                <button class="abstract-toggle">Show more</button>
              </div>
            </div>
          </div>`;

        // Add event listener to toggle button for this specific paper
        const toggleButton = paperElement.querySelector('.abstract-toggle');
        const abstractElement = paperElement.querySelector('.paper-abstract');

        toggleButton.addEventListener('click', function () {
          // Toggle the collapsed class
          abstractElement.classList.toggle('collapsed');

          // Update button text
          if (abstractElement.classList.contains('collapsed')) {
            toggleButton.textContent = 'Show more';
          } else {
            toggleButton.textContent = 'Show less';
          }
        });
        container.appendChild(paperElement);
      });
    })
    .catch(error => {
      console.error('Error loading papers:', error);
      const container = document.getElementById('papers-container');
      if (container) {
        container.innerHTML = '<p>Error loading publications. Please try again later.</p>';
      }
    });
});
