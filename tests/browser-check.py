"""Compatibility entry point for the full local/production Chromium suite."""
import runpy
from pathlib import Path

runpy.run_path(str(Path(__file__).with_name('production-check.py')),run_name='__main__')
