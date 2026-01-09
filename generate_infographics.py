"""
Generate infographics for all tools missing them
"""
import os
import json
import requests
from pathlib import Path
from openai import OpenAI

# API Key from environment or config
import sys
sys.path.insert(0, str(Path(__file__).parent))
from config import OPENAI_API_KEY

TOOLS_DIR = Path(__file__).parent / "tools"

# Tools that need infographics
TOOLS_TO_GENERATE = [
    "crop-disease-detector",
    "mandi-price-tracker",
    "weather-alert",
    "fertilizer-calculator",
    "crop-calendar",
    "pest-identifier",
    "water-tracker",
    "yield-estimator",
    "loan-calculator",
    "seed-variety-guide"
]

def create_prompt(metadata: dict) -> str:
    """Create a DALL-E prompt for the tool"""
    name = metadata.get('name', 'Farm Tool')
    features = metadata.get('key_features', [])
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

def generate_infographic(client: OpenAI, tool_slug: str) -> bool:
    """Generate infographic for a single tool"""
    tool_dir = TOOLS_DIR / tool_slug
    metadata_path = tool_dir / "metadata.json"

    if not metadata_path.exists():
        print(f"Metadata not found for {tool_slug}")
        return False

    with open(metadata_path, 'r', encoding='utf-8') as f:
        metadata = json.load(f)

    print(f"\n{'='*50}")
    print(f"Generating infographic for: {metadata.get('name')}")
    print(f"{'='*50}")

    prompt = create_prompt(metadata)

    try:
        response = client.images.generate(
            model="dall-e-3",
            prompt=prompt,
            size="1024x1024",
            quality="standard",
            n=1,
        )

        image_url = response.data[0].url
        print(f"Image generated, downloading...")

        # Download the image
        img_response = requests.get(image_url)
        if img_response.status_code == 200:
            output_path = tool_dir / "infographic.png"
            with open(output_path, 'wb') as f:
                f.write(img_response.content)
            print(f"Saved: {output_path}")
            return True
        else:
            print(f"Download failed: {img_response.status_code}")
            return False

    except Exception as e:
        print(f"Error: {e}")
        return False

def main():
    client = OpenAI(api_key=OPENAI_API_KEY)

    success_count = 0
    for tool_slug in TOOLS_TO_GENERATE:
        if generate_infographic(client, tool_slug):
            success_count += 1
        print(f"\nProgress: {success_count}/{len(TOOLS_TO_GENERATE)} completed")

    print(f"\n{'='*50}")
    print(f"COMPLETE: Generated {success_count}/{len(TOOLS_TO_GENERATE)} infographics")
    print(f"{'='*50}")

if __name__ == "__main__":
    main()
