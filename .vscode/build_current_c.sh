#!/bin/zsh

workspace="$1"

# Find the most recently modified .c file
src=$(find "$workspace" \
    -type f \
    -name "*.c" \
    -not -path "$workspace/.vscode/*" \
    -print0 |
    xargs -0 ls -t |
    head -n 1)

if [[ -z "$src" ]]; then
    echo "Error: no .c file found."
    exit 1
fi

dir=$(dirname "$src")
filename=$(basename "$src")
base="${filename%.c}"

output="$dir/$base"
link="$workspace/current_debug"

echo "Building:"
echo "  source: $src"
echo "  output: $output"

clang -Wall -Wextra -g "$src" -o "$output"

if [[ $? -ne 0 ]]; then
    echo "Compilation failed."
    exit 1
fi

ln -sf "$output" "$link"

echo "Debug target:"
echo "  $link -> $output"