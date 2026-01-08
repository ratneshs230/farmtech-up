"""
FarmTech UP - Image Generator Agent
Creates infographics for tool ideas using Gemini API
"""
import json
import base64
from datetime import datetime
from pathlib import Path
from typing import Optional
import sys

sys.path.insert(0, str(Path(__file__).parent.parent))
from config import GEMINI_API_KEY, TOOLS_DIR

try:
    import google.generativeai as genai
    from google.generativeai import types
    GEMINI_AVAILABLE = True
except ImportError:
    GEMINI_AVAILABLE = False
    print("Warning: google-generativeai not installed. Run: pip install google-generativeai")


class ImageGenerator:
    """Generates infographics for farmer tools using Gemini API"""

    def __init__(self):
        self.model = None
        if GEMINI_AVAILABLE and GEMINI_API_KEY:
            genai.configure(api_key=GEMINI_API_KEY)
            # Use Gemini 2.0 Flash for image generation
            self.model = genai.GenerativeModel('gemini-2.0-flash-exp')

    def _create_infographic_prompt(self, idea: dict) -> str:
        """Create a prompt for generating an infographic"""
        features = idea.get('key_features', [])
        features_text = ', '.join(features[:3]) if features else 'AI-powered features'

        return f'''Create a simple, colorful infographic image for a farmer tool app called "{idea.get('name', 'Farm Tool')}".

The infographic should show:
- The tool name prominently at the top
- A simple illustration of a farmer using a smartphone
- Icons representing: {features_text}
- Green and orange color scheme (agricultural theme)
- Simple, clean design suitable for rural audience
- The text "FarmTech UP" at the bottom

Style: Flat design, modern infographic, vibrant agricultural colors, mobile-friendly visual'''

    def _generate_with_gemini(self, idea: dict, output_path: Path) -> bool:
        """Generate image using Gemini's image generation"""
        if not self.model:
            return False

        try:
            prompt = self._create_infographic_prompt(idea)

            # Try to generate image with Gemini
            response = self.model.generate_content(
                prompt,
                generation_config=types.GenerationConfig(
                    response_mime_type="image/png"
                )
            )

            # Check if we got an image
            if response.candidates and response.candidates[0].content.parts:
                for part in response.candidates[0].content.parts:
                    if hasattr(part, 'inline_data') and part.inline_data:
                        # Save the image
                        image_data = base64.b64decode(part.inline_data.data)
                        png_path = output_path.with_suffix('.png')
                        with open(png_path, 'wb') as f:
                            f.write(image_data)
                        print(f"Generated PNG infographic: {png_path}")
                        return True

            return False
        except Exception as e:
            print(f"Gemini image generation failed: {e}")
            return False

    def _create_enhanced_svg(self, idea: dict, output_path: Path) -> bool:
        """Create an enhanced SVG infographic"""
        name = idea.get('name', 'Tool')
        name_hindi = idea.get('name_hindi', '')
        description = idea.get('short_description', '')[:80]
        pain_point = idea.get('pain_point', 'Helping farmers with technology')[:50]
        features = idea.get('key_features', ['Feature 1', 'Feature 2', 'Feature 3'])[:3]

        # Ensure we have at least 3 features
        while len(features) < 3:
            features.append(f'Feature {len(features) + 1}')

        svg_content = f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 600" width="800" height="600">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#4CAF50"/>
      <stop offset="100%" style="stop-color:#81C784"/>
    </linearGradient>
    <linearGradient id="header" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" style="stop-color:#2E7D32"/>
      <stop offset="100%" style="stop-color:#1B5E20"/>
    </linearGradient>
  </defs>

  <!-- Background -->
  <rect width="800" height="600" fill="url(#bg)"/>

  <!-- Header -->
  <rect x="0" y="0" width="800" height="100" fill="url(#header)"/>
  <text x="400" y="45" text-anchor="middle" fill="white" font-size="28" font-weight="bold" font-family="Arial">{name}</text>
  <text x="400" y="80" text-anchor="middle" fill="#C8E6C9" font-size="20" font-family="Arial">{name_hindi if name_hindi else 'FarmTech UP'}</text>

  <!-- Main Content Area -->
  <rect x="30" y="120" width="740" height="420" rx="15" fill="white" opacity="0.95"/>

  <!-- Description -->
  <text x="400" y="160" text-anchor="middle" fill="#333" font-size="16" font-family="Arial">{description}...</text>

  <!-- Farmer Icon -->
  <circle cx="200" cy="280" r="60" fill="#FFF3E0"/>
  <text x="200" y="295" text-anchor="middle" font-size="50">👨‍🌾</text>
  <text x="200" y="360" text-anchor="middle" fill="#666" font-size="14" font-family="Arial">For Farmers</text>

  <!-- Phone Icon -->
  <circle cx="400" cy="280" r="60" fill="#E3F2FD"/>
  <text x="400" y="295" text-anchor="middle" font-size="50">📱</text>
  <text x="400" y="360" text-anchor="middle" fill="#666" font-size="14" font-family="Arial">On Your Phone</text>

  <!-- AI Icon -->
  <circle cx="600" cy="280" r="60" fill="#F3E5F5"/>
  <text x="600" y="295" text-anchor="middle" font-size="50">🤖</text>
  <text x="600" y="360" text-anchor="middle" fill="#666" font-size="14" font-family="Arial">AI Powered</text>

  <!-- Features Section -->
  <rect x="50" y="400" width="700" height="120" rx="10" fill="#E8F5E9"/>
  <text x="400" y="430" text-anchor="middle" fill="#2E7D32" font-size="18" font-weight="bold" font-family="Arial">Key Features / मुख्य विशेषताएं</text>

  <text x="150" y="470" text-anchor="middle" fill="#333" font-size="14" font-family="Arial">✓ {features[0][:25]}</text>
  <text x="400" y="470" text-anchor="middle" fill="#333" font-size="14" font-family="Arial">✓ {features[1][:25]}</text>
  <text x="650" y="470" text-anchor="middle" fill="#333" font-size="14" font-family="Arial">✓ {features[2][:25]}</text>

  <!-- Footer -->
  <rect x="0" y="550" width="800" height="50" fill="#1B5E20"/>
  <text x="400" y="580" text-anchor="middle" fill="white" font-size="16" font-family="Arial">🌾 FarmTech UP - Empowering Farmers with Technology</text>
</svg>'''

        try:
            with open(output_path, 'w', encoding='utf-8') as f:
                f.write(svg_content)
            print(f"Created enhanced SVG infographic: {output_path}")
            return True
        except Exception as e:
            print(f"Error creating SVG: {e}")
            return False

    def generate(self, idea: dict, tool_dir: Path) -> Optional[Path]:
        """Generate an infographic for the given idea"""
        tool_dir.mkdir(parents=True, exist_ok=True)
        output_path = tool_dir / "infographic.svg"

        print(f"Generating infographic for: {idea.get('name', 'Unknown')}")

        # Try Gemini image generation first
        if self._generate_with_gemini(idea, output_path):
            return output_path.with_suffix('.png')

        # Fall back to enhanced SVG
        if self._create_enhanced_svg(idea, output_path):
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
