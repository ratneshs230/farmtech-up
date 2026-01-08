"""
FarmTech UP - Tool Builder Agent
Builds web apps for farmer tools using Claude Code CLI
"""
import json
import subprocess
import os
import platform
from datetime import datetime
from pathlib import Path
from typing import Optional
import sys

sys.path.insert(0, str(Path(__file__).parent.parent))
from config import TOOLS_DIR, TOOL_REQUIREMENTS, CLAUDE_CODE_TIMEOUT

# Windows compatibility
IS_WINDOWS = platform.system() == 'Windows'


class ToolBuilder:
    """Builds web applications for farmer tools using Claude Code CLI"""

    def __init__(self):
        self.tools_dir = TOOLS_DIR

    def _create_tool_slug(self, name: str) -> str:
        """Create a URL-friendly slug from the tool name"""
        slug = name.lower()
        slug = slug.replace(' ', '-')
        slug = ''.join(c for c in slug if c.isalnum() or c == '-')
        slug = '-'.join(filter(None, slug.split('-')))  # Remove consecutive dashes
        return slug

    def _create_build_prompt(self, idea: dict) -> str:
        """Create the prompt for Claude Code to build the tool"""
        requirements = "\n".join(f"- {r}" for r in TOOL_REQUIREMENTS)
        features = "\n".join(f"- {f}" for f in idea.get('key_features', []))
        ai_features = "\n".join(f"- {f}" for f in idea.get('ai_features', []))

        prompt = f'''Build a complete web application for the following farmer tool.

TOOL DETAILS:
Name: {idea.get('name', 'Unknown')}
Hindi Name: {idea.get('name_hindi', '')}
Description: {idea.get('short_description', '')}
Problem it solves: {idea.get('pain_point', '')}
Target users: {idea.get('target_users', 'Farmers in Uttar Pradesh')}

KEY FEATURES:
{features}

AI CAPABILITIES TO SIMULATE:
{ai_features}

TECHNICAL REQUIREMENTS:
{requirements}

BUILD INSTRUCTIONS:
1. Create index.html - Main HTML file with proper structure
2. Create style.css - Mobile-first responsive styles
3. Create script.js - Application logic with simulated AI features

DESIGN GUIDELINES:
- Use a green/earthy color scheme (agricultural theme)
- Large touch-friendly buttons (minimum 48px)
- Clear Hindi and English labels
- Simple icons using emoji or Unicode symbols
- Loading states for AI operations
- Offline message when no connection

SIMULATE AI FEATURES:
Since this is a front-end demo, simulate AI responses:
- For image analysis: Show mock results after a delay
- For predictions: Use sample data
- For recommendations: Display pre-defined suggestions

OUTPUT:
Create only these three files:
1. index.html
2. style.css
3. script.js

Make the app fully functional as a demo. Include sample data and simulated responses.
Write clean, well-commented code.'''

        return prompt

    def _validate_output(self, tool_dir: Path) -> bool:
        """Validate that all required files were created"""
        required_files = ['index.html', 'style.css', 'script.js']
        for file in required_files:
            if not (tool_dir / file).exists():
                print(f"Missing required file: {file}")
                return False
            # Check file is not empty
            if (tool_dir / file).stat().st_size < 50:
                print(f"File too small: {file}")
                return False
        return True

    def _save_metadata(self, idea: dict, tool_dir: Path) -> None:
        """Save tool metadata"""
        metadata = {
            **idea,
            'built_at': datetime.now().isoformat(),
            'status': 'built',
            'files': ['index.html', 'style.css', 'script.js', 'infographic.svg']
        }
        with open(tool_dir / 'metadata.json', 'w', encoding='utf-8') as f:
            json.dump(metadata, f, indent=2, ensure_ascii=False)

    def build(self, idea: dict, max_retries: int = 3) -> Optional[Path]:
        """Build a web app for the given idea using Claude Code CLI"""
        tool_slug = self._create_tool_slug(idea.get('name', 'unknown-tool'))
        tool_dir = self.tools_dir / tool_slug
        tool_dir.mkdir(parents=True, exist_ok=True)

        print(f"Building tool: {idea.get('name')} -> {tool_dir}")

        prompt = self._create_build_prompt(idea)

        for attempt in range(max_retries):
            print(f"Build attempt {attempt + 1}/{max_retries}...")

            try:
                # Change to tool directory for Claude Code to create files there
                original_dir = os.getcwd()

                # Create the prompt file for Claude Code
                prompt_file = tool_dir / '.build_prompt.txt'
                with open(prompt_file, 'w', encoding='utf-8') as f:
                    f.write(prompt)

                # Call Claude Code CLI with allowedTools to enable file writing
                cmd = [
                    'claude',
                    '-p', prompt,
                    '--allowedTools', 'Write,Edit,Read',
                    '--output-format', 'text'
                ]
                result = subprocess.run(
                    cmd,
                    capture_output=True,
                    text=True,
                    timeout=CLAUDE_CODE_TIMEOUT,
                    cwd=str(tool_dir),
                    shell=IS_WINDOWS  # Required for Windows to find claude.cmd
                )

                # Clean up prompt file
                if prompt_file.exists():
                    prompt_file.unlink()

                if result.returncode != 0:
                    print(f"Claude Code error: {result.stderr}")
                    continue

                # Validate output
                if self._validate_output(tool_dir):
                    self._save_metadata(idea, tool_dir)
                    print(f"Successfully built tool: {tool_dir}")
                    return tool_dir
                else:
                    print("Build validation failed, retrying...")

            except subprocess.TimeoutExpired:
                print("Claude Code timed out")
            except Exception as e:
                print(f"Error building tool: {e}")

        print("Failed to build tool after all retries")
        return None


if __name__ == "__main__":
    # Test with a sample idea
    sample_idea = {
        "name": "Crop Disease Detector",
        "name_hindi": "फसल रोग पहचानकर्ता",
        "short_description": "Take a photo of your crop to identify diseases and get treatment advice",
        "pain_point": "Farmers lose crops due to late disease detection",
        "opportunity": "Early disease detection can save up to 30% of crop yield",
        "target_users": "Farmers growing wheat, rice, and vegetables in UP",
        "ai_features": [
            "Image recognition for disease identification",
            "Treatment recommendation engine"
        ],
        "key_features": [
            "Take photo of affected plant",
            "AI identifies the disease",
            "Get treatment recommendations in Hindi"
        ],
        "technical_approach": "Use image classification to identify common crop diseases"
    }

    builder = ToolBuilder()
    result = builder.build(sample_idea)
    if result:
        print(f"Built at: {result}")
