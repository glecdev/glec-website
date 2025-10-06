#!/usr/bin/env python3
"""
Enterprise-grade Node.js Process Killer
CTO-level recursive methodology application

Purpose: Kill all Node.js processes on Windows
Author: Claude AI (CTO Mode)
"""

import subprocess
import sys
import time

def get_node_pids():
    """Get all Node.js process PIDs"""
    try:
        result = subprocess.run(
            ['tasklist', '/FI', 'IMAGENAME eq node.exe', '/FO', 'CSV', '/NH'],
            capture_output=True,
            text=True,
            timeout=5
        )

        pids = []
        for line in result.stdout.strip().split('\n'):
            if line and 'node.exe' in line:
                # Parse CSV: "node.exe","PID","..."
                parts = line.split(',')
                if len(parts) >= 2:
                    pid = parts[1].strip('"')
                    pids.append(pid)

        return pids
    except Exception as e:
        print(f"Error getting PIDs: {e}")
        return []

def kill_process(pid):
    """Kill a process by PID"""
    try:
        subprocess.run(
            ['taskkill', '/F', '/PID', pid],
            capture_output=True,
            timeout=5
        )
        return True
    except Exception as e:
        print(f"Error killing PID {pid}: {e}")
        return False

def main():
    print("=" * 60)
    print("CTO-LEVEL NODE.JS PROCESS CLEANUP")
    print("=" * 60)

    # Iteration 1: Get all PIDs
    print("\n[Step 1] Scanning for Node.js processes...")
    pids = get_node_pids()

    if not pids:
        print("[OK] No Node.js processes found!")
        return 0

    print(f"Found {len(pids)} Node.js process(es): {', '.join(pids)}")

    # Iteration 2: Kill each process
    print("\n[Step 2] Terminating processes...")
    killed = 0
    failed = 0

    for pid in pids:
        print(f"  Killing PID {pid}...", end=" ")
        if kill_process(pid):
            print("[SUCCESS]")
            killed += 1
        else:
            print("[FAILED]")
            failed += 1
        time.sleep(0.1)  # Prevent resource contention

    # Iteration 3: Verify
    print("\n[Step 3] Verification...")
    time.sleep(1)  # Wait for OS to clean up
    remaining = get_node_pids()

    print("=" * 60)
    print(f"RESULTS:")
    print(f"  - Killed: {killed}")
    print(f"  - Failed: {failed}")
    print(f"  - Remaining: {len(remaining)}")
    print("=" * 60)

    if remaining:
        print("\n[WARNING] Some processes could not be killed:")
        print(f"   PIDs: {', '.join(remaining)}")
        return 1
    else:
        print("\n[SUCCESS] ALL NODE.JS PROCESSES TERMINATED SUCCESSFULLY!")
        return 0

if __name__ == '__main__':
    sys.exit(main())
