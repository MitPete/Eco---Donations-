#!/bin/bash

# CSS optimization script to eliminate FOUC
# This script creates optimized, minified CSS bundles

echo "🚀 Optimizing CSS to eliminate FOUC..."

# Create optimized directory
mkdir -p /Users/petermichell/Eco---Donations-/frontend/public/src/styles/optimized

# Function to minify CSS (basic minification)
minify_css() {
    local input_file="$1"
    local output_file="$2"

    # Basic CSS minification: remove comments, extra whitespace, and newlines
    sed 's/\/\*.*\*\///g' "$input_file" | \
    sed 's/[[:space:]]\+/ /g' | \
    sed 's/; /;/g' | \
    sed 's/ {/{/g' | \
    sed 's/{ /{/g' | \
    sed 's/ }/}/g' | \
    tr -d '\n' > "$output_file"
}

# Create critical CSS bundle for each page
create_critical_bundle() {
    local page="$1"
    local bundle_file="/Users/petermichell/Eco---Donations-/frontend/public/src/styles/optimized/critical-${page}.css"

    echo "/* Critical CSS Bundle for ${page} - Generated $(date) */" > "$bundle_file"

    # Add base critical styles
    cat /Users/petermichell/Eco---Donations-/frontend/public/src/styles/critical.css >> "$bundle_file"

    # Add page-specific critical styles (first 5KB of each CSS file)
    if [ -f "/Users/petermichell/Eco---Donations-/frontend/public/src/styles/css/${page}.css" ]; then
        echo "/* Page-specific critical styles */" >> "$bundle_file"
        head -c 5120 "/Users/petermichell/Eco---Donations-/frontend/public/src/styles/css/${page}.css" >> "$bundle_file"
    fi

    # Minify the bundle
    local minified_file="/Users/petermichell/Eco---Donations-/frontend/public/src/styles/optimized/critical-${page}.min.css"
    minify_css "$bundle_file" "$minified_file"

    echo "✅ Created critical bundle for ${page}: $(wc -c < "$minified_file") bytes"
}

# Create bundles for each page
pages=("home" "donate" "dashboard" "history" "foundation" "governance" "whitepaper")

for page in "${pages[@]}"; do
    create_critical_bundle "$page"
done

# Create a universal critical CSS file
universal_critical="/Users/petermichell/Eco---Donations-/frontend/public/src/styles/optimized/critical-universal.min.css"
echo "/* Universal Critical CSS - Generated $(date) */" > "$universal_critical"
minify_css "/Users/petermichell/Eco---Donations-/frontend/public/src/styles/critical.css" "$universal_critical"

echo "✅ CSS optimization complete!"
echo "📊 File sizes:"
ls -lh /Users/petermichell/Eco---Donations-/frontend/public/src/styles/optimized/
