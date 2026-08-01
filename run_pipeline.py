#!/usr/bin/env python3
"""
Stub pipeline entry point for NextSelf.

The backend expects this file to exist and be executable as a subprocess.
This is a minimal implementation that creates the expected output files
with sample data so the frontend can function properly.
"""

import argparse
import json
import time
from datetime import datetime, UTC
from pathlib import Path

# Use the existing config structure
from config.settings import OUTPUT_DIR

def create_sample_feed_data():
    """Create sample feed data that matches the expected structure."""
    
    sample_items = [
        {
            "id": "item_001",
            "title": "The Art of Deep Work in a Distracted World",
            "summary": "Exploring how to cultivate focus and achieve meaningful work in an age of constant interruption.",
            "full_summary": "In our hyperconnected world, the ability to focus deeply on cognitively demanding tasks has become increasingly rare—and increasingly valuable. This exploration examines practical strategies for creating environments and routines that support sustained attention, from the neuroscience of focus to the practical implementation of deep work blocks in daily life.",
            "links": ["https://example.com/deep-work-guide"],
            "media_type": "article",
            "sources": ["Focus Research Lab", "Productivity Studies"],
            "score": {
                "mean_relevance": 0.85,
                "mean_importance": 0.78,
                "mean_novelty": 0.72,
                "mean_trust": 0.88,
                "mean_composed": 0.81
            },
            "rationale": "Aligns with your focus on personal growth and building sustainable habits for learning and development.",
            "published_date": "2024-01-15T10:30:00Z",
            "member_count": 3,
            "stub": False
        },
        {
            "id": "item_002", 
            "title": "Building Systems That Scale: Lessons from Nature",
            "summary": "How natural systems achieve resilience and efficiency through emergent behaviors and distributed decision-making.",
            "full_summary": "From ant colonies to forest ecosystems, nature provides profound examples of how complex, adaptive systems can emerge from simple rules and local interactions. This examination draws parallels between biological systems and human organizational structures, offering insights for building more resilient and adaptive approaches to personal and professional challenges.",
            "links": ["https://example.com/systems-thinking"],
            "media_type": "paper",
            "sources": ["Systems Biology Review", "Complexity Science"],
            "score": {
                "mean_relevance": 0.79,
                "mean_importance": 0.82,
                "mean_novelty": 0.85,
                "mean_trust": 0.84,
                "mean_composed": 0.83
            },
            "rationale": "Matches your interest in understanding complex systems and applying scientific principles to personal development.",
            "published_date": "2024-01-12T14:20:00Z",
            "member_count": 5,
            "stub": False
        },
        {
            "id": "item_003",
            "title": "The Craft of Clear Communication",
            "summary": "Practical techniques for expressing complex ideas with clarity and impact.",
            "full_summary": "Clear communication is both an art and a skill that can be systematically developed. This guide explores the cognitive principles behind effective explanation, from the curse of knowledge to the power of analogies, providing concrete techniques for making complex ideas accessible without sacrificing nuance or depth.",
            "links": ["https://example.com/clear-communication"],
            "media_type": "video",
            "sources": ["Communication Lab", "Teaching Excellence"],
            "score": {
                "mean_relevance": 0.88,
                "mean_importance": 0.79,
                "mean_novelty": 0.68,
                "mean_trust": 0.86,
                "mean_composed": 0.80
            },
            "rationale": "Supports your aspiration to become a clearer thinker and more effective communicator.",
            "published_date": "2024-01-10T09:15:00Z", 
            "member_count": 2,
            "stub": False
        }
    ]
    
    return {"items": sample_items}

def create_clustered_data():
    """Create clustered data that groups related items."""
    raw_data = create_sample_feed_data()
    
    # Group items into clusters (simplified)
    clusters = [
        {
            "cluster_id": "productivity_focus",
            "theme": "Productivity and Focus",
            "items": [raw_data["items"][0]],  # Deep work item
            "summary": "Resources for developing focused work habits"
        },
        {
            "cluster_id": "systems_thinking", 
            "theme": "Systems and Complexity",
            "items": [raw_data["items"][1]],  # Systems item
            "summary": "Understanding complex adaptive systems"
        },
        {
            "cluster_id": "communication_skills",
            "theme": "Communication and Expression", 
            "items": [raw_data["items"][2]],  # Communication item
            "summary": "Improving clarity and impact in communication"
        }
    ]
    
    return {"clusters": clusters, "items": raw_data["items"]}

def create_html_digest():
    """Create a simple HTML digest."""
    html_content = """
    <!DOCTYPE html>
    <html>
    <head>
        <title>NextSelf Weekly Digest</title>
        <style>
            body { font-family: Georgia, serif; max-width: 800px; margin: 0 auto; padding: 2rem; }
            h1 { color: #3A2A21; }
            .item { margin: 2rem 0; padding: 1rem; border-left: 3px solid #B08D57; }
        </style>
    </head>
    <body>
        <h1>NextSelf Weekly Digest</h1>
        <p>Generated: {timestamp}</p>
        
        <div class="item">
            <h2>The Art of Deep Work in a Distracted World</h2>
            <p>Exploring how to cultivate focus and achieve meaningful work in an age of constant interruption.</p>
        </div>
        
        <div class="item">
            <h2>Building Systems That Scale: Lessons from Nature</h2>
            <p>How natural systems achieve resilience and efficiency through emergent behaviors.</p>
        </div>
        
        <div class="item">
            <h2>The Craft of Clear Communication</h2>
            <p>Practical techniques for expressing complex ideas with clarity and impact.</p>
        </div>
    </body>
    </html>
    """.format(timestamp=datetime.now(UTC).isoformat())
    
    return html_content

def run_pipeline_stage(stage: str):
    """Run a specific pipeline stage."""
    print(f"Running stage: {stage}")
    
    # Ensure output directory exists
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    
    if stage in ["fetch", "all"]:
        print("  → Fetching data...")
        raw_data = create_sample_feed_data()
        (OUTPUT_DIR / "raw_items.json").write_text(
            json.dumps(raw_data, indent=2, ensure_ascii=False)
        )
        time.sleep(0.5)  # Simulate work
        
    if stage in ["score", "all"]:
        print("  → Scoring items...")
        # Scored data is same as raw for this stub
        raw_data = create_sample_feed_data()
        (OUTPUT_DIR / "scored_items.json").write_text(
            json.dumps(raw_data, indent=2, ensure_ascii=False)
        )
        time.sleep(0.3)
        
    if stage in ["cluster", "all"]:
        print("  → Clustering items...")
        clustered_data = create_clustered_data()
        (OUTPUT_DIR / "clustered_items.json").write_text(
            json.dumps(clustered_data, indent=2, ensure_ascii=False)
        )
        time.sleep(0.4)
        
    if stage in ["digest", "all"]:
        print("  → Generating digest...")
        html_digest = create_html_digest()
        (OUTPUT_DIR / "latest.html").write_text(html_digest, encoding="utf-8")
        
        # Also create a timestamped version
        timestamp = datetime.now(UTC).strftime("%Y%m%d_%H%M%S")
        (OUTPUT_DIR / f"weekly_digest_{timestamp}.html").write_text(html_digest, encoding="utf-8")
        time.sleep(0.2)

def main():
    parser = argparse.ArgumentParser(description="NextSelf content curation pipeline")
    parser.add_argument("--stage", 
                       choices=["fetch", "score", "cluster", "digest", "all"],
                       default="all",
                       help="Pipeline stage to run")
    
    args = parser.parse_args()
    
    print(f"NextSelf Pipeline v1.0 - Running stage: {args.stage}")
    print(f"Output directory: {OUTPUT_DIR}")
    
    try:
        run_pipeline_stage(args.stage)
        print("✓ Pipeline completed successfully")
        return 0
    except Exception as e:
        print(f"✗ Pipeline failed: {e}")
        return 1

if __name__ == "__main__":
    exit(main())