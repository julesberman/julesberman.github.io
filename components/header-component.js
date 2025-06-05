class HeaderComponent extends HTMLElement {
  constructor() {
    super();
  }

  connectedCallback() {
    this.innerHTML = `
      <div class="header-container">
        <div class="left-section">
          <div class="name" style="cursor: pointer;" onclick="window.location.href='/'">
            Jules Berman
          </div>
          <div class="header">
            <a href="mailto:julesmichaelberman@gmail.com" class="hlink">email</a><span class="header-separator">•</span>
            <a href="https://scholar.google.com/citations?user=g44S1mAAAAAJ&hl=en" class="hlink">google scholar</a>
            <span class="header-separator">•</span>
            <a href="/files/Berman_CV.pdf" class="hlink">CV</a>
          </div>
        </div>
      </div>
    `;
  }
}

// add later: <a href="/blog/index.html" class="hlink">blog</a>
customElements.define('header-component', HeaderComponent);
