"""
FarmTech UP - Publisher Agent
Handles Git operations and showcase site updates
"""
import json
import shutil
from datetime import datetime
from pathlib import Path
from typing import Optional, List
import subprocess
import sys

sys.path.insert(0, str(Path(__file__).parent.parent))
from config import (
    BASE_DIR, TOOLS_DIR, TOOLS_FILE, SHOWCASE_DIR,
    GITHUB_TOKEN, GITHUB_REPO, GITHUB_PAGES_URL
)


class Publisher:
    """Publishes tools to GitHub and updates the showcase site"""

    def __init__(self):
        self.tools_file = TOOLS_FILE
        self.showcase_dir = SHOWCASE_DIR
        self.tools_dir = TOOLS_DIR
        self.base_dir = BASE_DIR

    def _load_tools_registry(self) -> dict:
        """Load the tools registry"""
        if self.tools_file.exists():
            with open(self.tools_file, 'r', encoding='utf-8') as f:
                return json.load(f)
        return {'tools': [], 'last_updated': None}

    def _save_tools_registry(self, data: dict) -> None:
        """Save the tools registry"""
        data['last_updated'] = datetime.now().isoformat()
        with open(self.tools_file, 'w', encoding='utf-8') as f:
            json.dump(data, f, indent=2, ensure_ascii=False)

    def _add_tool_to_registry(self, tool_info: dict) -> None:
        """Add a new tool to the registry"""
        registry = self._load_tools_registry()

        # Check if tool already exists
        existing = next(
            (t for t in registry['tools'] if t.get('id') == tool_info.get('id')),
            None
        )
        if existing:
            # Update existing
            idx = registry['tools'].index(existing)
            registry['tools'][idx] = tool_info
        else:
            registry['tools'].append(tool_info)

        self._save_tools_registry(registry)

    def _generate_tool_card_html(self, tool: dict) -> str:
        """Generate HTML for a single tool card"""
        name = tool.get('name', 'Unknown Tool')
        name_hindi = tool.get('name_hindi', '')
        description = tool.get('short_description', '')
        slug = tool.get('slug', '')
        features = tool.get('key_features', [])[:3]

        features_html = '\n'.join(
            f'<li>{f}</li>' for f in features
        )

        return f'''
    <div class="tool-card" data-id="{tool.get('id', '')}">
      <div class="tool-image">
        <img src="../tools/{slug}/infographic.svg" alt="{name}" onerror="this.src='assets/placeholder.svg'">
      </div>
      <div class="tool-content">
        <h2 class="tool-name">{name}</h2>
        <p class="tool-name-hindi">{name_hindi}</p>
        <p class="tool-description">{description}</p>
        <ul class="tool-features">
          {features_html}
        </ul>
        <a href="../tools/{slug}/index.html" class="tool-link">Try Now / अभी आज़माएं →</a>
      </div>
    </div>'''

    def _generate_showcase_html(self, tools: List[dict]) -> str:
        """Generate the complete showcase HTML"""
        tool_cards = '\n'.join(self._generate_tool_card_html(t) for t in tools)

        return f'''<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>FarmTech UP - Empowering Farmers with Technology</title>
    <meta name="description" content="AI-powered tools for farmers in Uttar Pradesh">
    <link rel="stylesheet" href="style.css">
</head>
<body>
    <header class="header">
        <div class="container">
            <h1 class="logo">🌾 FarmTech UP</h1>
            <p class="tagline">Empowering Farmers with Technology / किसानों को तकनीक से सशक्त बनाना</p>
        </div>
    </header>

    <main class="main">
        <div class="container">
            <section class="intro">
                <h2>Our Tools / हमारे उपकरण</h2>
                <p>Simple AI-powered tools designed for farmers in Uttar Pradesh. Works on any smartphone!</p>
                <p class="hindi">उत्तर प्रदेश के किसानों के लिए डिज़ाइन किए गए सरल AI-संचालित उपकरण। किसी भी स्मार्टफोन पर काम करता है!</p>
            </section>

            <section class="tools-grid">
                {tool_cards if tool_cards else '<p class="no-tools">No tools yet. Check back soon! / अभी तक कोई उपकरण नहीं। जल्द ही वापस जांचें!</p>'}
            </section>
        </div>
    </main>

    <footer class="footer">
        <div class="container">
            <p>FarmTech UP - Built with ❤️ for Farmers</p>
            <p class="hindi">किसानों के लिए ❤️ के साथ बनाया गया</p>
            <p class="updated">Last updated: {datetime.now().strftime('%B %d, %Y')}</p>
        </div>
    </footer>

    <script src="script.js"></script>
</body>
</html>'''

    def _generate_showcase_css(self) -> str:
        """Generate CSS for the showcase site"""
        return '''/* FarmTech UP - Showcase Styles */
:root {
    --primary-green: #2E7D32;
    --light-green: #4CAF50;
    --pale-green: #C8E6C9;
    --orange: #FF9800;
    --dark: #1B5E20;
    --white: #FFFFFF;
    --gray: #F5F5F5;
}

* {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
}

body {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    line-height: 1.6;
    background: var(--gray);
    color: #333;
}

.container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 20px;
}

/* Header */
.header {
    background: linear-gradient(135deg, var(--primary-green), var(--dark));
    color: var(--white);
    padding: 40px 0;
    text-align: center;
}

.logo {
    font-size: 2.5rem;
    margin-bottom: 10px;
}

.tagline {
    font-size: 1.1rem;
    opacity: 0.9;
}

/* Main Content */
.main {
    padding: 40px 0;
}

.intro {
    text-align: center;
    margin-bottom: 40px;
}

.intro h2 {
    color: var(--primary-green);
    font-size: 2rem;
    margin-bottom: 15px;
}

.intro p {
    font-size: 1.1rem;
    color: #666;
}

.intro .hindi {
    color: var(--primary-green);
    font-size: 1rem;
    margin-top: 10px;
}

/* Tools Grid */
.tools-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
    gap: 30px;
}

.tool-card {
    background: var(--white);
    border-radius: 16px;
    overflow: hidden;
    box-shadow: 0 4px 20px rgba(0,0,0,0.1);
    transition: transform 0.3s, box-shadow 0.3s;
}

.tool-card:hover {
    transform: translateY(-5px);
    box-shadow: 0 8px 30px rgba(0,0,0,0.15);
}

.tool-image {
    height: 200px;
    background: var(--pale-green);
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: hidden;
}

.tool-image img {
    width: 100%;
    height: 100%;
    object-fit: cover;
}

.tool-content {
    padding: 20px;
}

.tool-name {
    font-size: 1.5rem;
    color: var(--primary-green);
    margin-bottom: 5px;
}

.tool-name-hindi {
    color: var(--light-green);
    font-size: 1.1rem;
    margin-bottom: 15px;
}

.tool-description {
    color: #666;
    margin-bottom: 15px;
}

.tool-features {
    list-style: none;
    margin-bottom: 20px;
}

.tool-features li {
    padding: 5px 0;
    padding-left: 25px;
    position: relative;
    color: #555;
}

.tool-features li::before {
    content: '✓';
    position: absolute;
    left: 0;
    color: var(--light-green);
    font-weight: bold;
}

.tool-link {
    display: inline-block;
    background: var(--light-green);
    color: var(--white);
    padding: 12px 24px;
    border-radius: 8px;
    text-decoration: none;
    font-weight: 600;
    transition: background 0.3s;
}

.tool-link:hover {
    background: var(--primary-green);
}

.no-tools {
    text-align: center;
    padding: 60px;
    color: #999;
    font-size: 1.2rem;
    grid-column: 1 / -1;
}

/* Footer */
.footer {
    background: var(--dark);
    color: var(--white);
    padding: 30px 0;
    text-align: center;
}

.footer .hindi {
    opacity: 0.8;
    margin-top: 5px;
}

.footer .updated {
    margin-top: 15px;
    font-size: 0.9rem;
    opacity: 0.6;
}

/* Mobile Responsive */
@media (max-width: 768px) {
    .logo {
        font-size: 2rem;
    }

    .tools-grid {
        grid-template-columns: 1fr;
    }

    .tool-card {
        margin: 0 10px;
    }
}'''

    def _generate_showcase_js(self) -> str:
        """Generate JavaScript for the showcase site"""
        return '''// FarmTech UP - Showcase Scripts

document.addEventListener('DOMContentLoaded', function() {
    // Add animation on scroll
    const cards = document.querySelectorAll('.tool-card');

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, { threshold: 0.1 });

    cards.forEach(card => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(20px)';
        card.style.transition = 'opacity 0.5s, transform 0.5s';
        observer.observe(card);
    });

    // Handle image loading errors
    document.querySelectorAll('.tool-image img').forEach(img => {
        img.addEventListener('error', function() {
            this.src = 'assets/placeholder.svg';
        });
    });

    console.log('FarmTech UP - Loaded successfully');
});'''

    def _create_placeholder_svg(self) -> str:
        """Create a placeholder SVG for missing images"""
        return '''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300" width="400" height="300">
  <rect width="400" height="300" fill="#C8E6C9"/>
  <text x="200" y="140" text-anchor="middle" fill="#2E7D32" font-size="24" font-family="Arial">🌾</text>
  <text x="200" y="180" text-anchor="middle" fill="#4CAF50" font-size="16" font-family="Arial">FarmTech UP</text>
</svg>'''

    def update_showcase(self) -> bool:
        """Regenerate the showcase site from the tools registry"""
        print("Updating showcase site...")

        try:
            # Load all tools
            registry = self._load_tools_registry()
            tools = registry.get('tools', [])

            # Ensure showcase directory exists
            self.showcase_dir.mkdir(parents=True, exist_ok=True)
            assets_dir = self.showcase_dir / 'assets'
            assets_dir.mkdir(exist_ok=True)

            # Generate files
            with open(self.showcase_dir / 'index.html', 'w', encoding='utf-8') as f:
                f.write(self._generate_showcase_html(tools))

            with open(self.showcase_dir / 'style.css', 'w', encoding='utf-8') as f:
                f.write(self._generate_showcase_css())

            with open(self.showcase_dir / 'script.js', 'w', encoding='utf-8') as f:
                f.write(self._generate_showcase_js())

            with open(assets_dir / 'placeholder.svg', 'w', encoding='utf-8') as f:
                f.write(self._create_placeholder_svg())

            print(f"Showcase updated with {len(tools)} tools")
            return True

        except Exception as e:
            print(f"Error updating showcase: {e}")
            return False

    def publish_tool(self, idea: dict, tool_dir: Path) -> bool:
        """Add a tool to the registry and update the showcase"""
        print(f"Publishing tool: {idea.get('name')}")

        # Create tool info for registry
        slug = tool_dir.name
        tool_info = {
            **idea,
            'slug': slug,
            'published_at': datetime.now().isoformat(),
            'url': f"tools/{slug}/index.html"
        }

        # Add to registry
        self._add_tool_to_registry(tool_info)

        # Update showcase
        return self.update_showcase()

    def git_commit_and_push(self, message: str) -> bool:
        """Commit and push changes to GitHub"""
        print(f"Committing: {message}")

        try:
            # Check if git repo exists
            result = subprocess.run(
                ['git', 'status'],
                capture_output=True,
                text=True,
                cwd=str(self.base_dir)
            )

            if result.returncode != 0:
                print("Not a git repository. Skipping git operations.")
                return False

            # Add all changes
            subprocess.run(
                ['git', 'add', '.'],
                cwd=str(self.base_dir),
                check=True
            )

            # Commit
            subprocess.run(
                ['git', 'commit', '-m', message],
                cwd=str(self.base_dir),
                check=True
            )

            # Push if remote exists
            result = subprocess.run(
                ['git', 'remote', '-v'],
                capture_output=True,
                text=True,
                cwd=str(self.base_dir)
            )

            if 'origin' in result.stdout:
                subprocess.run(
                    ['git', 'push'],
                    cwd=str(self.base_dir),
                    check=True
                )
                print("Pushed to remote repository")
            else:
                print("No remote configured. Commit saved locally.")

            return True

        except subprocess.CalledProcessError as e:
            print(f"Git operation failed: {e}")
            return False
        except Exception as e:
            print(f"Error with git: {e}")
            return False


if __name__ == "__main__":
    # Test the publisher
    publisher = Publisher()
    publisher.update_showcase()
    print("Showcase updated successfully")
