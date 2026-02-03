"""
Script to slice sprite sheets into individual frames.
- waving.png: 2x2 grid (4 frames)
- moving.png: 2x3 grid (6 frames)
"""

from PIL import Image
import os

def slice_sprite_sheet(input_path, output_dir, prefix, cols, rows):
    """
    Slice a sprite sheet into individual frames.
    
    Args:
        input_path: Path to the sprite sheet image
        output_dir: Directory to save the sliced frames
        prefix: Prefix for output filenames (e.g., 'walk', 'wave')
        cols: Number of columns in the grid
        rows: Number of rows in the grid
    """
    # Open the sprite sheet
    img = Image.open(input_path)
    width, height = img.size
    
    # Calculate frame dimensions
    frame_width = width // cols
    frame_height = height // rows
    
    print(f"Image size: {width}x{height}")
    print(f"Frame size: {frame_width}x{frame_height}")
    print(f"Grid: {cols}x{rows} = {cols * rows} frames")
    
    # Create output directory if it doesn't exist
    os.makedirs(output_dir, exist_ok=True)
    
    # Slice the sprite sheet
    frame_index = 0
    for row in range(rows):
        for col in range(cols):
            left = col * frame_width
            top = row * frame_height
            right = left + frame_width
            bottom = top + frame_height
            
            # Crop the frame
            frame = img.crop((left, top, right, bottom))
            
            # Save the frame
            output_path = os.path.join(output_dir, f"{prefix}_{frame_index}.png")
            frame.save(output_path, "PNG")
            print(f"Saved: {output_path}")
            
            frame_index += 1
    
    return frame_index

def main():
    # Output directory
    output_dir = "public/sprites"
    
    # Check if input files exist
    waving_path = "waving.png"
    moving_path = "moving.png"
    
    if os.path.exists(waving_path):
        print("\n=== Slicing waving.png (2x2 grid = 4 frames) ===")
        slice_sprite_sheet(waving_path, output_dir, "wave", cols=2, rows=2)
    else:
        print(f"Warning: {waving_path} not found")
    
    if os.path.exists(moving_path):
        print("\n=== Slicing moving.png (2x3 grid = 6 frames) ===")
        slice_sprite_sheet(moving_path, output_dir, "walk", cols=2, rows=3)
    else:
        print(f"Warning: {moving_path} not found")
    
    print("\n=== Done! ===")

if __name__ == "__main__":
    main()
