#!/usr/bin/env python3
"""
FarmTech UP - Pipeline Scheduler
Runs the pipeline at regular intervals
"""

import time
import subprocess
import sys
import io
from datetime import datetime
from pathlib import Path

# Fix Windows console encoding
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')
sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding='utf-8', errors='replace')

# Configuration
INTERVAL_MINUTES = 10
PIPELINE_DIR = Path(__file__).parent


def run_pipeline():
    """Run the full pipeline"""
    print(f"\n{'='*60}")
    print(f"  Starting Pipeline Run: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print(f"{'='*60}\n")

    try:
        result = subprocess.run(
            [sys.executable, 'orchestrator.py', '--no-git'],
            cwd=str(PIPELINE_DIR),
            capture_output=False,
            text=True
        )

        if result.returncode == 0:
            print("\n[SUCCESS] Pipeline completed successfully!")
            # Push to git after successful run
            push_to_git()
        else:
            print(f"\n[FAILED] Pipeline failed with code {result.returncode}")

    except Exception as e:
        print(f"\n[ERROR] Pipeline error: {e}")


def push_to_git():
    """Push changes to GitHub"""
    try:
        # Check if there are changes
        result = subprocess.run(
            ['git', 'status', '--porcelain'],
            cwd=str(PIPELINE_DIR),
            capture_output=True,
            text=True
        )

        if result.stdout.strip():
            print("\nPushing changes to GitHub...")
            subprocess.run(['git', 'add', '-A'], cwd=str(PIPELINE_DIR))
            subprocess.run(
                ['git', 'commit', '-m', f'Auto-generated tool - {datetime.now().strftime("%Y-%m-%d %H:%M")}'],
                cwd=str(PIPELINE_DIR)
            )
            subprocess.run(['git', 'push'], cwd=str(PIPELINE_DIR))
            print("[OK] Pushed to GitHub")
        else:
            print("No changes to push")

    except Exception as e:
        print(f"Git push error: {e}")


def main():
    print("""
================================================================
        FarmTech UP - Automated Pipeline Scheduler

        Running pipeline every 10 minutes
        Press Ctrl+C to stop
================================================================
    """)

    run_count = 0

    while True:
        run_count += 1
        print(f"\n[Run #{run_count}]")

        run_pipeline()

        next_run = datetime.now().strftime('%H:%M:%S')
        print(f"\nNext run in {INTERVAL_MINUTES} minutes... (started waiting at {next_run})")
        print("Press Ctrl+C to stop\n")

        try:
            time.sleep(INTERVAL_MINUTES * 60)
        except KeyboardInterrupt:
            print("\n\nScheduler stopped by user.")
            break


if __name__ == "__main__":
    main()
