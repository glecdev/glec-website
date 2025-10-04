#!/usr/bin/env python3
"""
Add 'export const dynamic = "force-dynamic"' to all API route files
"""

import os
import glob

# Find all API route files
route_files = glob.glob('app/api/**/route.ts', recursive=True)

print(f"Found {len(route_files)} API route files")

for file_path in route_files:
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()

    # Check if already has dynamic export
    if 'export const dynamic' in content:
        print(f"SKIP: {file_path}")
        continue

    # Add dynamic export at the top (after imports or docstring)
    lines = content.split('\n')

    # Find insertion point (after imports or docstring)
    insert_index = 0
    in_docstring = False

    for i, line in enumerate(lines):
        stripped = line.strip()

        # Handle multi-line docstring
        if stripped.startswith('/**') or stripped.startswith('/*'):
            in_docstring = True
        if in_docstring and ('*/' in stripped):
            in_docstring = False
            insert_index = i + 1
            continue

        # After imports
        if stripped.startswith('import '):
            insert_index = i + 1

        # Stop at first non-import, non-docstring line
        if (not stripped.startswith('import ') and
            not stripped.startswith('//') and
            not stripped.startswith('/*') and
            not stripped.startswith('*') and
            not in_docstring and
            stripped != ''):
            break

    # Insert dynamic export
    lines.insert(insert_index, '')
    lines.insert(insert_index + 1, '// Force dynamic rendering for this API route')
    lines.insert(insert_index + 2, "export const dynamic = 'force-dynamic';")
    lines.insert(insert_index + 3, '')

    # Write back
    with open(file_path, 'w', encoding='utf-8') as f:
        f.write('\n'.join(lines))

    print(f"OK: {file_path}")

print("Done! All API routes now have dynamic export.")
