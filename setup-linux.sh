curl -fsSL https://bun.sh/install | bash # Setup bun
source $HOME/.bashrc
# Install the packages
echo "Setting up fileDB"
cd db
bun install