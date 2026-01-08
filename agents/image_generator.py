"""
FarmTech UP - Image Generator Agent
Creates infographics for tool ideas using OpenAI DALL-E
"""
import base64
import requests
from datetime import datetime
from pathlib import Path
from typing import Optional
import sys

sys.path.insert(0, str(Path(__file__).parent.parent))
from config import OPENAI_API_KEY, TOOLS_DIR

try:
    from openai import OpenAI
    OPENAI_AVAILABLE = True
except ImportError:
    OPENAI_AVAILABLE = False
    print("Warning: openai not installed. Run: pip install openai")


class ImageGenerator:
    """Generates infographics for farmer tools using OpenAI DALL-E"""

    def __init__(self):
        self.client = None
        if OPENAI_AVAILABLE and OPENAI_API_KEY:
            self.client = OpenAI(api_key=OPENAI_API_KEY)

    def _create_dalle_prompt(self, idea: dict) -> str:
        """Create a prompt for DALL-E image generation"""
        name = idea.get('name', 'Farm Tool')
        features = idea.get('key_features', [])
        features_text = ', '.join(features[:3]) if features else 'AI-powered features'

        return f'''Create a professional infographic poster for a mobile app called "{name}" designed for farmers in India.

The infographic should include:
- Title "{name}" prominently at the top
- A friendly illustration of an Indian farmer using a smartphone
- Icons representing: {features_text}
- Green and orange agricultural color scheme
- Clean, modern flat design style
- "FarmTech UP" branding at the bottom
- Simple visuals that are easy to understand

Style: Professional infographic, flat design illustration, vibrant colors, farm theme, mobile app showcase'''

    def _generate_with_dalle(self, idea: dict, output_path: Path) -> bool:
        """Generate image using OpenAI DALL-E"""
        if not self.client:
            print("OpenAI client not initialized")
            return False

        try:
            prompt = self._create_dalle_prompt(idea)
            print(f"Generating with DALL-E: {idea.get('name')}")

            response = self.client.images.generate(
                model="dall-e-3",
                prompt=prompt,
                size="1024x1024",
                quality="standard",
                n=1,
            )

            # Get the image URL
            image_url = response.data[0].url

            # Download the image
            img_response = requests.get(image_url)
            if img_response.status_code == 200:
                png_path = output_path.with_suffix('.png')
                with open(png_path, 'wb') as f:
                    f.write(img_response.content)
                print(f"Generated DALL-E infographic: {png_path}")
                return True
            else:
                print(f"Failed to download image: {img_response.status_code}")
                return False

        except Exception as e:
            print(f"DALL-E generation failed: {e}")
            return False

    def _create_fallback_svg(self, idea: dict, output_path: Path) -> bool:
        """Create a fallback SVG infographic"""
        name = idea.get('name', 'Tool')
        name_hindi = idea.get('name_hindi', '')
        description = idea.get('short_description', '')[:80]
        features = idea.get('key_features', ['Feature 1', 'Feature 2', 'Feature 3'])[:3]

        while len(features) < 3:
            features.append(f'Feature {len(features) + 1}')

        svg_content = f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 600" width="800" height="600">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#4CAF50"/>
      <stop offset="100%" style="stop-color:#81C784"/>
    </linearGradient>
  </defs>

  <rect width="800" height="600" fill="url(#bg)"/>
  <rect x="0" y="0" width="800" height="100" fill="#2E7D32"/>
  <text x="400" y="45" text-anchor="middle" fill="white" font-size="28" font-weight="bold" font-family="Arial">{name}</text>
  <text x="400" y="80" text-anchor="middle" fill="#C8E6C9" font-size="20" font-family="Arial">{name_hindi if name_hindi else 'FarmTech UP'}</text>

  <rect x="30" y="120" width="740" height="420" rx="15" fill="white" opacity="0.95"/>
  <text x="400" y="160" text-anchor="middle" fill="#333" font-size="16" font-family="Arial">{description}...</text>

  <circle cx="200" cy="280" r="60" fill="#FFF3E0"/>
  <text x="200" y="295" text-anchor="middle" font-size="50">👨‍🌾</text>
  <text x="200" y="360" text-anchor="middle" fill="#666" font-size="14" font-family="Arial">For Farmers</text>

  <circle cx="400" cy="280" r="60" fill="#E3F2FD"/>
  <text x="400" y="295" text-anchor="middle" font-size="50">📱</text>
  <text x="400" y="360" text-anchor="middle" fill="#666" font-size="14" font-family="Arial">On Your Phone</text>

  <circle cx="600" cy="280" r="60" fill="#F3E5F5"/>
  <text x="600" y="295" text-anchor="middle" font-size="50">🤖</text>
  <text x="600" y="360" text-anchor="middle" fill="#666" font-size="14" font-family="Arial">AI Powered</text>

  <rect x="50" y="400" width="700" height="120" rx="10" fill="#E8F5E9"/>
  <text x="400" y="430" text-anchor="middle" fill="#2E7D32" font-size="18" font-weight="bold" font-family="Arial">Key Features</text>
  <text x="150" y="470" text-anchor="middle" fill="#333" font-size="14" font-family="Arial">✓ {features[0][:25]}</text>
  <text x="400" y="470" text-anchor="middle" fill="#333" font-size="14" font-family="Arial">✓ {features[1][:25]}</text>
  <text x="650" y="470" text-anchor="middle" fill="#333" font-size="14" font-family="Arial">✓ {features[2][:25]}</text>

  <rect x="0" y="550" width="800" height="50" fill="#1B5E20"/>
  <text x="400" y="580" text-anchor="middle" fill="white" font-size="16" font-family="Arial">FarmTech UP - Empowering Farmers</text>
</svg>'''

        try:
            with open(output_path, 'w', encoding='utf-8') as f:
                f.write(svg_content)
            print(f"Created fallback SVG: {output_path}")
            return True
        except Exception as e:
            print(f"Error creating SVG: {e}")
            return False

    def generate(self, idea: dict, tool_dir: Path) -> Optional[Path]:
        """Generate an infographic for the given idea"""
        tool_dir.mkdir(parents=True, exist_ok=True)
        output_path = tool_dir / "infographic"

        print(f"Generating infographic for: {idea.get('name', 'Unknown')}")

        # Try DALL-E first
        if self._generate_with_dalle(idea, output_path):
            return output_path.with_suffix('.png')

        # Fall back to SVG
        svg_path = output_path.with_suffix('.svg')
        if self._create_fallback_svg(idea, svg_path):
            return svg_path

        return None


if __name__ == "__main__":
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
