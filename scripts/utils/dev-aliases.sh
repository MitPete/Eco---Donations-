# Eco Donations Development Aliases
# Add these to your ~/.zshrc or ~/.bashrc for easy access

# Quick server start
alias eco-dev="cd /Users/petermichell/Eco---Donations- && ./start-dev-server.sh"

# Quick server start with cleanup
alias eco-dev-clean="cd /Users/petermichell/Eco---Donations- && pkill -f 'python3 -m http.server' 2>/dev/null || true && ./start-dev-server.sh"

# Quick npm version
alias eco-npm="cd /Users/petermichell/Eco---Donations- && npm run dev"

# Show server URLs
alias eco-urls="echo 'Desktop: http://localhost:8888' && echo 'Mobile: http://$(ifconfig | grep \"inet \" | grep -v \"127.0.0.1\" | head -1 | awk '{print \$2}'):8888'"
