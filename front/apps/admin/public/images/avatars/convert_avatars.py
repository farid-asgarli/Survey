#!/usr/bin/env python3
import base64
import os

# Get the directory where this script is located
script_dir = os.path.dirname(os.path.abspath(__file__))
avatars_file = os.path.join(script_dir, 'avatars.txt')

# Read the avatars.txt file
with open(avatars_file, 'r') as f:
    lines = f.readlines()

# Process each line
for i, line in enumerate(lines, start=1):
    line = line.strip()
    if not line:
        continue
    
    # Remove the data URI prefix if present
    if line.startswith('data:image/png;base64,'):
        base64_data = line.replace('data:image/png;base64,', '')
    else:
        base64_data = line
    
    try:
        # Decode the base64 data
        image_data = base64.b64decode(base64_data)
        
        # Save as PNG file
        output_path = os.path.join(script_dir, f'avatar_{i}.png')
        with open(output_path, 'wb') as img_file:
            img_file.write(image_data)
        
        print(f'Created: avatar_{i}.png')
    except Exception as e:
        print(f'Error processing line {i}: {e}')

print(f'\nDone! Converted {len(lines)} avatars.')
