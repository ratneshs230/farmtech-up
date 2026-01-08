"""
FarmTech UP - Image Generator Agent
Creates infographics for tool ideas using Gemini API
"""
import json
from datetime import datetime
from pathlib import Path
from typing import Optional
import sys

sys.path.insert(0, str(Path(__file__).parent.parent))
from config import GEMINI_API_KEY, TOOLS_DIR

try:
    import google.generativeai as genai
    GEMINI_AVAILABLE = True
except ImportError:
    GEMINI_AVAILABLE = False
    print("Warning: google-generativeai not installed. Run: pip install google-generativeai")


class ImageGenerator:
    """Generates infographics for farmer tools using Gemini API"""

    def __init__(self):
        if GEMINI_AVAILABLE and GEMINI_API_KEY:
            genai.configure(api_key=GEMINI_API_KEY)
            self.model = genai.GenerativeModel('gemini-2.0-flash-exp')  # Using available model
            self.image_model = None  # Will use Imagen when available
        else:
            self.model = None
            self.image_model = None

    def _create_infographic_prompt(self, idea: dict) -> str:
        """Create a prompt for generating an infographic"""
        return f'''Create a simple, colorful infographic for a farmer tool app:

TOOL NAME: {idea.get('name', 'Unknown Tool')}
HINDI NAME: {idea.get('name_hindi', '')}

DESCRIPTION: {idea.get('short_description', '')}

PROBLEM IT SOLVES: {idea.get('pain_point', '')}

KEY FEATURES:
{chr(10).join('- ' + f for f in idea.get('key_features', []))}

DESIGN REQUIREMENTS:
- Simple, clean design suitable for rural audience
- Use bright, friendly colors (green, orange, blue)
- Include simple icons representing the features
- Show a farmer benefiting from the tool
- Include both English and Hindi text
- Mobile phone should be visible in the design
- Make it easy to understand at a glance

Style: Flat design, modern infographic, vibrant colors, farmer-friendly'''

    def _create_placeholder_image(self, idea: dict, output_path: Path) -> bool:
        """Create a placeholder HTML/SVG infographic when image generation is not available"""
        name = idea.get('name', 'Tool')
        name_hindi = idea.get('name_hindi', '')
        description = idea.get('short_description', '')
        pain_point = idea.get('pain_point', '')
        features = idea.get('key_features', [])[:3]

        svg_content = f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 600" width="800" height="600">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#4CAF50"/>
      <stop offset="100%" style="stop-color:#81C784"/>
    </linearGradient>
  </defs>

  <!-- Background -->
  <rect width="800" height="600" fill="url(#bg)"/>

  <!-- Header -->
  <rect x="0" y="0" width="800" height="120" fill="#2E7D32"/>
  <text x="400" y="50" text-anchor="middle" fill="white" font-size="32" font-weight="bold" font-family="Arial">{name}</text>
  <text x="400" y="90" text-anchor="middle" fill="#C8E6C9" font-size="24" font-family="Arial">{name_hindi}</text>

  <!-- Description Box -->
  <rect x="50" y="140" width="700" height="80" rx="10" fill="white" opacity="0.9"/>
  <text x="400" y="190" text-anchor="middle" fill="#333" font-size="18" font-family="Arial">{description[:60]}{'...' if len(description) > 60 else ''}</text>

  <!-- Problem Section -->
  <rect x="50" y="240" width="340" height="150" rx="10" fill="#FFF3E0"/>
  <text x="220" y="275" text-anchor="middle" fill="#E65100" font-size="20" font-weight="bold" font-family="Arial">Problem / समस्या</text>
  <text x="220" y="310" text-anchor="middle" fill="#333" font-size="14" font-family="Arial">{pain_point[:40]}{'...' if len(pain_point) > 40 else ''}</text>

  <!-- Features Section -->
  <rect x="410" y="240" width="340" height="150" rx="10" fill="#E3F2FD"/>
  <text x="580" y="275" text-anchor="middle" fill="#1565C0" font-size="20" font-weight="bold" font-family="Arial">Features / विशेषताएं</text>
  {''.join(f'<text x="580" y="{310 + i*25}" text-anchor="middle" fill="#333" font-size="14" font-family="Arial">• {f[:35]}</text>' for i, f in enumerate(features))}

  <!-- Footer -->
  <rect x="0" y="550" width="800" height="50" fill="#1B5E20"/>
  <text x="400" y="580" text-anchor="middle" fill="white" font-size="18" font-family="Arial">FarmTech UP - Empowering Farmers with Technology</text>

  <!-- Phone Icon -->
  <rect x="680" y="420" width="70" height="120" rx="8" fill="#333"/>
  <rect x="685" y="430" width="60" height="95" rx="2" fill="#4CAF50"/>
  <circle cx="715" cy="535" r="8" fill="#666"/>
</svg>'''

        try:
            # Save as SVG
            svg_path = output_path.with_suffix('.svg')
            with open(svg_path, 'w', encoding='utf-8') as f:
                f.write(svg_content)

            # Try to convert to PNG if Pillow is available
            try:
                from PIL import Image
                import io
                # For now, just keep SVG - PNG conversion requires additional libraries
                print(f"Created SVG infographic: {svg_path}")
            except ImportError:
                pass

            return True
        except Exception as e:
            print(f"Error creating placeholder image: {e}")
            return False

    def generate(self, idea: dict, tool_dir: Path) -> Optional[Path]:
        """Generate an infographic for the given idea"""
        tool_dir.mkdir(parents=True, exist_ok=True)
        output_path = tool_dir / "infographic.svg"

        print(f"Generating infographic for: {idea.get('name', 'Unknown')}")

        # Try Gemini image generation if available
        if self.image_model and GEMINI_API_KEY:
            try:
                prompt = self._create_infographic_prompt(idea)
                # Note: Actual Gemini image generation would go here
                # For now, fall through to placeholder
                pass
            except Exception as e:
                print(f"Gemini image generation failed: {e}")

        # Create placeholder SVG infographic
        if self._create_placeholder_image(idea, output_path):
            print(f"Created infographic: {output_path}")
            return output_path

        return None


if __name__ == "__main__":
    # Test with a sample idea
    sample_idea = {
        "name": "Crop Disease Detector",
        "name_hindi": "फसल रोग पहचानकर्ता",
        "short_description": "Take a photo of your crop to identify diseases and get treatment advice",
        "pain_point": "Farmers lose crops due to late disease detection",
        "key_features": [
            "AI-powered disease detection",
            "Treatment recommendations",
            "Works offline"
        ]
    }

    generator = ImageGenerator()
    test_dir = Path(__file__).parent.parent / "tools" / "test_tool"
    result = generator.generate(sample_idea, test_dir)
    if result:
        print(f"Generated: {result}")
