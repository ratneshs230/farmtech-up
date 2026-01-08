"""
FarmTech UP - Idea Generation Agent
Generates innovative tool ideas for farmers using Claude Code CLI
"""
import json
import subprocess
import re
import platform
from datetime import datetime
from pathlib import Path
from typing import Optional
import sys

sys.path.insert(0, str(Path(__file__).parent.parent))
from config import IDEAS_FILE, IDEA_DOMAIN, IDEA_CONSTRAINTS, CLAUDE_CODE_TIMEOUT

# Windows compatibility
IS_WINDOWS = platform.system() == 'Windows'


class IdeaGenerator:
    """Generates unique tool ideas for farmers using Claude Code CLI"""

    def __init__(self):
        self.ideas_file = IDEAS_FILE
        self.existing_ideas = self._load_existing_ideas()

    def _load_existing_ideas(self) -> list:
        """Load existing ideas to prevent duplicates"""
        if self.ideas_file.exists():
            with open(self.ideas_file, 'r', encoding='utf-8') as f:
                data = json.load(f)
                return data.get('ideas', [])
        return []

    def _save_idea(self, idea: dict) -> None:
        """Save new idea to the ideas file"""
        self.existing_ideas.append(idea)
        data = {
            'ideas': self.existing_ideas,
            'last_updated': datetime.now().isoformat()
        }
        with open(self.ideas_file, 'w', encoding='utf-8') as f:
            json.dump(data, f, indent=2, ensure_ascii=False)

    def _get_existing_ideas_summary(self) -> str:
        """Get summary of existing ideas for the prompt"""
        if not self.existing_ideas:
            return "No tools have been built yet."

        summaries = []
        for idea in self.existing_ideas:
            summaries.append(f"- {idea.get('name', 'Unknown')}: {idea.get('short_description', 'No description')}")
        return "\n".join(summaries)

    def _create_prompt(self) -> str:
        """Create the prompt for Claude Code"""
        existing = self._get_existing_ideas_summary()

        # Very explicit prompt with exact structure
        prompt = f'''Generate a farmer tool idea. Output EXACTLY this JSON structure with your values:

{{"name":"Crop Helper","name_hindi":"फसल सहायक","short_description":"AI tool for farmers","pain_point":"farmers struggle with X","opportunity":"this helps by Y","target_users":"small farmers in UP","ai_features":["image recognition","voice input"],"key_features":["feature 1","feature 2","feature 3"],"technical_approach":"uses camera and AI"}}

Requirements:
- Tool for farmers in Uttar Pradesh, India
- Must work as HTML/CSS/JS web app on basic Android phones
- Support Hindi and English
- Avoid: {existing}

Output only the JSON object, no explanation.'''

        return prompt

    def _parse_response(self, response: str) -> Optional[dict]:
        """Parse the Claude Code response to extract the idea JSON"""
        try:
            content = response.strip()

            # If using --output-format json, the response is wrapped in a JSON object
            if content.startswith('{') and '"result"' in content[:100]:
                outer = json.loads(content)
                content = outer.get('result', '')

            # Remove markdown code blocks if present
            content = re.sub(r'^```json\s*\n?', '', content.strip())
            content = re.sub(r'^```\s*\n?', '', content)
            content = re.sub(r'\n?```\s*$', '', content)

            # Look for JSON object pattern
            json_match = re.search(r'\{[\s\S]*\}', content)
            if json_match:
                raw = json.loads(json_match.group())

                # Normalize field names - map common variations
                idea = {}
                # Name field
                idea['name'] = raw.get('name') or raw.get('tool_name') or raw.get('idea') or raw.get('title', 'Unknown Tool')
                if isinstance(idea['name'], dict):
                    idea['name'] = idea['name'].get('en', idea['name'].get('english', str(idea['name'])))

                # Hindi name
                idea['name_hindi'] = raw.get('name_hindi') or raw.get('hindi_name', '')
                if isinstance(raw.get('name'), dict):
                    idea['name_hindi'] = raw['name'].get('hi', raw['name'].get('hindi', ''))

                # Description
                idea['short_description'] = raw.get('short_description') or raw.get('description') or raw.get('summary', '')

                # Pain point
                idea['pain_point'] = raw.get('pain_point') or raw.get('problem') or raw.get('challenge', '')

                # Opportunity
                idea['opportunity'] = raw.get('opportunity') or raw.get('benefit') or raw.get('value') or raw.get('potential_impact', '')

                # Target users
                idea['target_users'] = raw.get('target_users') or raw.get('users') or raw.get('audience', 'Farmers in UP')

                # AI features
                idea['ai_features'] = raw.get('ai_features') or raw.get('ai_capabilities') or []
                if not isinstance(idea['ai_features'], list):
                    idea['ai_features'] = [idea['ai_features']]

                # Key features
                idea['key_features'] = raw.get('key_features') or raw.get('features') or []
                if not isinstance(idea['key_features'], list):
                    idea['key_features'] = [idea['key_features']]

                # Technical approach
                idea['technical_approach'] = raw.get('technical_approach') or raw.get('technology') or raw.get('implementation', '')

                # Validate we have the essentials
                if idea['name'] and idea['short_description']:
                    return idea
                else:
                    print(f"Missing essential fields. Name: {idea.get('name')}, Desc: {idea.get('short_description')}")

        except json.JSONDecodeError as e:
            print(f"JSON parse error: {e}")
        except Exception as e:
            print(f"Parse error: {e}")
        return None

    def _check_duplicate(self, new_idea: dict) -> bool:
        """Check if the idea is too similar to existing ones"""
        new_name = new_idea.get('name', '').lower()
        new_desc = new_idea.get('short_description', '').lower()

        for existing in self.existing_ideas:
            existing_name = existing.get('name', '').lower()
            existing_desc = existing.get('short_description', '').lower()

            # Simple similarity check - can be enhanced with embeddings
            if new_name == existing_name:
                return True
            if new_desc == existing_desc:
                return True

            # Check for significant word overlap
            new_words = set(new_name.split() + new_desc.split())
            existing_words = set(existing_name.split() + existing_desc.split())
            overlap = len(new_words & existing_words) / max(len(new_words), 1)
            if overlap > 0.7:
                return True

        return False

    def generate(self, max_retries: int = 3) -> Optional[dict]:
        """Generate a new unique tool idea using Claude Code CLI"""
        prompt = self._create_prompt()

        for attempt in range(max_retries):
            print(f"Generating idea (attempt {attempt + 1}/{max_retries})...")

            try:
                # Call Claude Code CLI directly with the prompt
                # Use --output-format json for structured output
                cmd = ['claude', '-p', prompt, '--output-format', 'json']
                result = subprocess.run(
                    cmd,
                    capture_output=True,
                    text=True,
                    timeout=CLAUDE_CODE_TIMEOUT,
                    cwd=str(Path(__file__).parent.parent),
                    shell=IS_WINDOWS,
                    encoding='utf-8',
                    errors='replace'
                )

                if result.returncode != 0:
                    print(f"Claude Code error: {result.stderr}")
                    continue

                response = result.stdout.strip()
                print(f"Response received ({len(response)} chars)")
                print(f"First 300 chars: {response[:300]}")
                idea = self._parse_response(response)

                if idea is None:
                    print("Failed to parse idea from response")
                    continue

                if self._check_duplicate(idea):
                    print(f"Duplicate idea detected: {idea.get('name')}")
                    continue

                # Add metadata
                idea['id'] = f"tool_{len(self.existing_ideas) + 1:03d}"
                idea['created_at'] = datetime.now().isoformat()
                idea['status'] = 'pending'

                # Save and return
                self._save_idea(idea)
                print(f"Generated new idea: {idea['name']}")
                return idea

            except subprocess.TimeoutExpired:
                print("Claude Code timed out")
            except Exception as e:
                print(f"Error generating idea: {e}")

        print("Failed to generate idea after all retries")
        return None


if __name__ == "__main__":
    # Test the idea generator
    generator = IdeaGenerator()
    idea = generator.generate()
    if idea:
        print("\nGenerated Idea:")
        print(json.dumps(idea, indent=2, ensure_ascii=False))
    else:
        print("Failed to generate idea")
