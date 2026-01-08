#!/usr/bin/env python3
"""
FarmTech UP - Pipeline Orchestrator
Main entry point for the automated tool building pipeline

Usage:
    python orchestrator.py              # Run full pipeline
    python orchestrator.py --idea-only  # Only generate idea
    python orchestrator.py --build-only # Build from latest pending idea
    python orchestrator.py --showcase   # Only update showcase
"""

import argparse
import sys
import io
from datetime import datetime
from pathlib import Path

# Fix Windows console encoding
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')
sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding='utf-8', errors='replace')

# Add parent directory to path for imports
sys.path.insert(0, str(Path(__file__).parent))

from config import TOOLS_DIR, IDEAS_FILE
from agents.idea_generator import IdeaGenerator
from agents.image_generator import ImageGenerator
from agents.tool_builder import ToolBuilder
from agents.publisher import Publisher


class PipelineOrchestrator:
    """Orchestrates the full tool building pipeline"""

    def __init__(self):
        self.idea_generator = IdeaGenerator()
        self.image_generator = ImageGenerator()
        self.tool_builder = ToolBuilder()
        self.publisher = Publisher()

    def _print_header(self, text: str) -> None:
        """Print a formatted header"""
        print("\n" + "=" * 60)
        print(f"  {text}")
        print("=" * 60 + "\n")

    def _print_step(self, step: int, text: str) -> None:
        """Print a step indicator"""
        print(f"\n[Step {step}] {text}")
        print("-" * 40)

    def run_full_pipeline(self, skip_git: bool = False) -> bool:
        """Run the complete pipeline: idea -> image -> build -> publish"""
        self._print_header("FarmTech UP - Tool Building Pipeline")
        print(f"Started at: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")

        # Step 1: Generate Idea
        self._print_step(1, "Generating new tool idea...")
        idea = self.idea_generator.generate()
        if not idea:
            print("[FAILED] Failed to generate idea. Aborting pipeline.")
            return False
        print(f"[OK] Generated: {idea.get('name')}")
        print(f"     Pain point: {idea.get('pain_point')}")

        # Step 2: Build Tool
        self._print_step(2, "Building tool with Claude Code...")
        tool_dir = self.tool_builder.build(idea)
        if not tool_dir:
            print("[FAILED] Failed to build tool. Aborting pipeline.")
            return False
        print(f"[OK] Built at: {tool_dir}")

        # Step 3: Generate Infographic
        self._print_step(3, "Generating infographic...")
        infographic_path = self.image_generator.generate(idea, tool_dir)
        if infographic_path:
            print(f"[OK] Infographic: {infographic_path}")
        else:
            print("[WARN] Infographic generation failed (continuing anyway)")

        # Step 4: Publish
        self._print_step(4, "Publishing to showcase...")
        if self.publisher.publish_tool(idea, tool_dir):
            print("[OK] Showcase updated")
        else:
            print("[FAILED] Failed to update showcase")
            return False

        # Step 5: Git commit (optional)
        if not skip_git:
            self._print_step(5, "Committing to Git...")
            commit_msg = f"Add tool: {idea.get('name')}\n\n{idea.get('short_description')}"
            if self.publisher.git_commit_and_push(commit_msg):
                print("[OK] Committed and pushed")
            else:
                print("[WARN] Git operations skipped or failed")

        # Summary
        self._print_header("Pipeline Complete!")
        print(f"Tool Name: {idea.get('name')}")
        print(f"Hindi Name: {idea.get('name_hindi', 'N/A')}")
        print(f"Location: {tool_dir}")
        print(f"Completed at: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")

        return True

    def generate_idea_only(self) -> bool:
        """Only generate a new idea without building"""
        self._print_header("Generating Tool Idea Only")

        idea = self.idea_generator.generate()
        if idea:
            print("\n[OK] Generated Idea:")
            print(f"     Name: {idea.get('name')}")
            print(f"     Hindi: {idea.get('name_hindi')}")
            print(f"     Description: {idea.get('short_description')}")
            print(f"     Pain Point: {idea.get('pain_point')}")
            print(f"     ID: {idea.get('id')}")
            return True
        else:
            print("[FAILED] Failed to generate idea")
            return False

    def build_pending_idea(self) -> bool:
        """Build the latest pending idea"""
        self._print_header("Building Pending Idea")

        # Load ideas and find pending ones
        import json
        if not IDEAS_FILE.exists():
            print("[FAILED] No ideas file found")
            return False

        with open(IDEAS_FILE, 'r', encoding='utf-8') as f:
            data = json.load(f)

        pending = [i for i in data.get('ideas', []) if i.get('status') == 'pending']
        if not pending:
            print("[FAILED] No pending ideas found")
            return False

        idea = pending[-1]  # Get latest pending
        print(f"Building: {idea.get('name')}")

        # Build
        tool_dir = self.tool_builder.build(idea)
        if not tool_dir:
            print("[FAILED] Failed to build")
            return False

        # Generate infographic
        self.image_generator.generate(idea, tool_dir)

        # Publish
        self.publisher.publish_tool(idea, tool_dir)

        print(f"[OK] Built and published: {tool_dir}")
        return True

    def update_showcase_only(self) -> bool:
        """Only regenerate the showcase site"""
        self._print_header("Updating Showcase")

        if self.publisher.update_showcase():
            print("[OK] Showcase updated")
            return True
        else:
            print("[FAILED] Failed to update showcase")
            return False


def main():
    parser = argparse.ArgumentParser(
        description='FarmTech UP - Automated Tool Building Pipeline',
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog='''
Examples:
    python orchestrator.py              # Run full pipeline
    python orchestrator.py --idea-only  # Only generate idea
    python orchestrator.py --build      # Build latest pending idea
    python orchestrator.py --showcase   # Update showcase only
    python orchestrator.py --no-git     # Run without git operations
        '''
    )

    parser.add_argument(
        '--idea-only',
        action='store_true',
        help='Only generate a new idea without building'
    )
    parser.add_argument(
        '--build',
        action='store_true',
        help='Build the latest pending idea'
    )
    parser.add_argument(
        '--showcase',
        action='store_true',
        help='Only update the showcase site'
    )
    parser.add_argument(
        '--no-git',
        action='store_true',
        help='Skip git commit and push operations'
    )

    args = parser.parse_args()

    orchestrator = PipelineOrchestrator()

    try:
        if args.idea_only:
            success = orchestrator.generate_idea_only()
        elif args.build:
            success = orchestrator.build_pending_idea()
        elif args.showcase:
            success = orchestrator.update_showcase_only()
        else:
            success = orchestrator.run_full_pipeline(skip_git=args.no_git)

        sys.exit(0 if success else 1)

    except KeyboardInterrupt:
        print("\n\n[WARN] Pipeline interrupted by user")
        sys.exit(130)
    except Exception as e:
        print(f"\n[ERROR] Pipeline error: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)


if __name__ == "__main__":
    main()
