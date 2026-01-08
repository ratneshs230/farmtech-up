# FarmTech UP Pipeline

An automated pipeline that generates innovative AI-powered tool ideas for farmers in Uttar Pradesh, builds them as web apps, and publishes them to a showcase website.

## Architecture

```
┌─────────────────┐
│   Orchestrator  │
└────────┬────────┘
         │
         ▼
┌─────────────────┐     ┌─────────────────┐
│ Idea Generator  │ ──▶ │ Image Generator │
│ (Claude Code)   │     │ (Gemini API)    │
└────────┬────────┘     └────────┬────────┘
         │                       │
         ▼                       │
┌─────────────────┐              │
│  Tool Builder   │◀─────────────┘
│ (Claude Code)   │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│   Publisher     │ ──▶ GitHub + Showcase
└─────────────────┘
```

## Quick Start

1. **Install dependencies:**
   ```bash
   cd Pipeline
   pip install -r requirements.txt
   ```

2. **Set up environment:**
   ```bash
   cp .env.example .env
   # Edit .env and add your API keys
   ```

3. **Run the pipeline:**
   ```bash
   python orchestrator.py
   ```

## Usage

```bash
# Full pipeline: generate idea → build tool → create infographic → publish
python orchestrator.py

# Generate only a new idea (no building)
python orchestrator.py --idea-only

# Build the latest pending idea
python orchestrator.py --build

# Update showcase site only
python orchestrator.py --showcase

# Run without git operations
python orchestrator.py --no-git
```

## Project Structure

```
Pipeline/
├── orchestrator.py          # Main pipeline runner
├── config.py                # Configuration
├── requirements.txt         # Python dependencies
├── agents/
│   ├── idea_generator.py    # Generates tool ideas via Claude Code
│   ├── image_generator.py   # Creates infographics via Gemini
│   ├── tool_builder.py      # Builds web apps via Claude Code
│   └── publisher.py         # Git operations & showcase updates
├── data/
│   ├── ideas.json           # History of generated ideas
│   └── tools.json           # Registry of published tools
├── tools/                   # Generated tools
│   └── [tool-name]/
│       ├── index.html
│       ├── style.css
│       ├── script.js
│       ├── infographic.svg
│       └── metadata.json
├── showcase/                # Static showcase website
│   ├── index.html
│   ├── style.css
│   └── script.js
└── .github/workflows/
    └── pipeline.yml         # GitHub Actions for scheduled runs
```

## Configuration

Create a `.env` file with:

```env
GEMINI_API_KEY=your_gemini_api_key
GITHUB_TOKEN=your_github_token
GITHUB_REPO=username/farmtech-up
```

## Agents

### 1. Idea Generator
- Uses Claude Code CLI to generate innovative farmer tool ideas
- Tracks all generated ideas to prevent duplicates
- Focus: AI + smartphone tools for UP farmers

### 2. Image Generator
- Uses Gemini API to create infographics
- Falls back to SVG generation if API unavailable

### 3. Tool Builder
- Uses Claude Code CLI to build complete web apps
- Creates mobile-first, bilingual (Hindi/English) interfaces
- Outputs: index.html, style.css, script.js

### 4. Publisher
- Updates tools registry
- Regenerates showcase website
- Handles git commit and push

## Scheduled Runs

The pipeline can run automatically via GitHub Actions:
- **Weekly:** Every Sunday at 10:00 AM IST
- **Manual:** Trigger from GitHub Actions UI

## License

MIT
