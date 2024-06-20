echo "Note: Please use bash when installing, zsh/sh/everything else will probaly work, but i am not sure."
curl -fsSL https://bun.sh/install | bash # Setup bun
source $HOME/.bashrc
# Install the packages
echo "Setting up fileDB"
cd db
bun install