"""
FarmTech UP - Configuration Management
"""
import os
from pathlib import Path
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Base paths
BASE_DIR = Path(__file__).parent
AGENTS_DIR = BASE_DIR / "agents"
DATA_DIR = BASE_DIR / "data"
TOOLS_DIR = BASE_DIR / "tools"
SHOWCASE_DIR = BASE_DIR / "showcase"
TEMPLATES_DIR = BASE_DIR / "templates"

# Ensure directories exist
DATA_DIR.mkdir(exist_ok=True)
TOOLS_DIR.mkdir(exist_ok=True)

# API Keys
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")

# GitHub Configuration
GITHUB_TOKEN = os.getenv("GITHUB_TOKEN")
GITHUB_REPO = os.getenv("GITHUB_REPO")
GITHUB_PAGES_URL = os.getenv("GITHUB_PAGES_URL", "")

# Data files
IDEAS_FILE = DATA_DIR / "ideas.json"
TOOLS_FILE = DATA_DIR / "tools.json"

# Pipeline settings
MAX_RETRIES = 3
CLAUDE_CODE_TIMEOUT = 300  # seconds

# Idea generation settings
IDEA_DOMAIN = "AI and smartphone-based tools for farmers in Uttar Pradesh, India"
IDEA_CONSTRAINTS = [
    "Must be buildable as a simple web app (HTML/CSS/JS)",
    "Must work on basic Android smartphones",
    "Should support Hindi and English",
    "Should solve a real pain point for UP farmers",
    "Should leverage AI capabilities (image recognition, NLP, predictions)",
]

# Tool building settings
TOOL_REQUIREMENTS = [
    "Mobile-first responsive design",
    "Works offline where possible",
    "Hindi/English bilingual UI",
    "Simple, intuitive interface for farmers",
    "Fast loading on slow connections",
]
