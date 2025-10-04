#!/usr/bin/env python3
"""
Convert Next.js API routes to Cloudflare Pages Functions

Usage:
  python scripts/convert-to-cloudflare-functions.py
"""

import os
import re
from pathlib import Path

def convert_api_route(content: str, route_path: str) -> str:
    """
    Convert Next.js API route to Cloudflare Pages Function

    Transformations:
    - Remove Next.js imports
    - Replace export async function GET/POST/PUT/DELETE
    - Replace NextRequest/NextResponse with Cloudflare types
    - Replace process.env with context.env
    - Replace new Resend(...) with fetch API
    """

    # Remove Next.js imports
    content = re.sub(
        r"import\s+\{\s*NextRequest,\s*NextResponse\s*\}\s+from\s+['\"]next/server['\"];\s*\n",
        "",
        content
    )

    # Remove Resend import
    content = re.sub(
        r"import\s+\{\s*Resend\s*\}\s+from\s+['\"]resend['\"];\s*\n",
        "",
        content
    )

    # Remove Resend initialization
    content = re.sub(
        r"const resend = process\.env\.RESEND_API_KEY[^;]+;\s*\n",
        "",
        content,
        flags=re.MULTILINE
    )

    # Replace export async function GET with onRequestGet
    content = re.sub(
        r"export async function GET\(request: NextRequest\)",
        "export async function onRequestGet(context: { request: Request; env: any })",
        content
    )

    # Replace export async function POST with onRequestPost
    content = re.sub(
        r"export async function POST\(request: NextRequest\)",
        "export async function onRequestPost(context: { request: Request; env: any })",
        content
    )

    # Replace export async function PUT with onRequestPut
    content = re.sub(
        r"export async function PUT\(request: NextRequest\)",
        "export async function onRequestPut(context: { request: Request; env: any })",
        content
    )

    # Replace export async function DELETE with onRequestDelete
    content = re.sub(
        r"export async function DELETE\(request: NextRequest\)",
        "export async function onRequestDelete(context: { request: Request; env: any })",
        content
    )

    # Replace process.env.RESEND_API_KEY with context.env.RESEND_API_KEY
    content = re.sub(
        r"process\.env\.RESEND_API_KEY",
        "context.env.RESEND_API_KEY",
        content
    )

    # Replace process.env.RESEND_FROM_EMAIL with context.env.RESEND_FROM_EMAIL
    content = re.sub(
        r"process\.env\.RESEND_FROM_EMAIL",
        "context.env.RESEND_FROM_EMAIL",
        content
    )

    # Replace request.json() with context.request.json()
    content = re.sub(
        r"await request\.json\(\)",
        "await context.request.json()",
        content
    )

    # Replace new URL(request.url) with new URL(context.request.url)
    content = re.sub(
        r"new URL\(request\.url\)",
        "new URL(context.request.url)",
        content
    )

    # Replace NextResponse.json with Response.json
    content = re.sub(
        r"NextResponse\.json",
        "Response.json",
        content
    )

    # Replace new NextResponse with new Response
    content = re.sub(
        r"new NextResponse",
        "new Response",
        content
    )

    # Replace resend.emails.send with fetch API
    # This is complex - will be done manually for now

    return content

def main():
    # Source directory: app/api
    api_dir = Path("app/api")

    # Target directory: functions/api
    functions_dir = Path("functions/api")
    functions_dir.mkdir(parents=True, exist_ok=True)

    # Find all route.ts files
    route_files = list(api_dir.rglob("route.ts"))

    print(f"Found {len(route_files)} API routes to convert")

    for route_file in route_files:
        # Calculate relative path from app/api
        rel_path = route_file.relative_to(api_dir)

        # Remove 'route.ts' and use parent directory name as filename
        # Example: app/api/contact-form/route.ts -> functions/api/contact-form.ts
        parts = rel_path.parts[:-1]  # Remove 'route.ts'

        if len(parts) == 0:
            # Skip root route.ts (app/api/route.ts)
            print(f"  Skipping {route_file} (root route)")
            continue

        # Join parts with '/' and add .ts extension
        target_filename = "-".join(parts) + ".ts"
        target_file = functions_dir / target_filename

        # Read source file
        with open(route_file, "r", encoding="utf-8") as f:
            content = f.read()

        # Convert content
        converted_content = convert_api_route(content, str(rel_path))

        # Write target file
        with open(target_file, "w", encoding="utf-8") as f:
            f.write(converted_content)

        print(f"  Converted {route_file} -> {target_file}")

    print("\nConversion complete!")
    print(f"Total files converted: {len(route_files) - 1}")  # Exclude root route.ts

if __name__ == "__main__":
    main()
