from PIL import Image
import os

def process_spritesheet(input_path, output_prefix, frame_width, frame_height):
    try:
        if not os.path.exists('public/sprites'):
            os.makedirs('public/sprites')
            
        sheet = Image.open(input_path).convert("RGBA")
        sheet_w, sheet_h = sheet.size
        print(f"Processing {input_path} ({sheet_w}x{sheet_h})")
        
        cols = sheet_w // frame_width
        rows = sheet_h // frame_height
        
        print(f"Grid detected: {cols} cols x {rows} rows")
        
        frame_idx = 0
        for r in range(rows):
            for c in range(cols):
                left = c * frame_width
                upper = r * frame_height
                right = left + frame_width
                lower = upper + frame_height
                
                # Crop frame
                frame = sheet.crop((left, upper, right, lower))
                
                # Check if frame is empty (fully transparent)
                extrema = frame.getextrema()
                if extrema[3][1] == 0:
                     print(f"Frame {frame_idx} is empty (transparent), skipping")
                     continue
                
                output_filename = f"public/sprites/{output_prefix}_{frame_idx}.png"
                frame.save(output_filename)
                print(f"Saved {output_filename}")
                frame_idx += 1
                
    except Exception as e:
        print(f"Error processing {input_path}: {e}")

# Based on previous robust logic, the cell size is likely 416x416
# moving.png (832x1248) -> 2 cols x 3 rows = 6 cells
process_spritesheet('moving.png', 'walk', 416, 416)

# waving.png (832x1248) -> 2 cols x 3 rows = 6 cells
# If user says 4 frames, likely the last 2 are empty or user counts differently.
# We will just save all non-empty frames.
process_spritesheet('waving.png', 'wave', 416, 416)
