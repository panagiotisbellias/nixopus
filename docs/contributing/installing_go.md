# Installing Go 1.23.6

This guide will help you install Go version 1.23.6 on Linux systems.

## Prerequisites

- Linux system with curl installed
- sudo privileges
- Terminal access

## Installation Steps

### 1. Download Go 1.23.6

Download the official Go 1.23.6 tarball for Linux:

```bash
curl -LO https://go.dev/dl/go1.23.6.linux-amd64.tar.gz
```

The `-L` flag follows redirects and `-O` saves the file with the original filename.

### 2. Remove Previous Go Installation

Remove any existing Go installation to avoid conflicts:

```bash
sudo rm -rf /usr/local/go
```

### 3. Extract Go to /usr/local

Extract the downloaded tarball to the standard location:

```bash
sudo tar -C /usr/local -xzf go1.23.6.linux-amd64.tar.gz
```

### 4. Configure Environment Variables

Add Go to your system PATH by editing your shell profile:

```bash
nano ~/.bashrc
```

Add this line to the end of the file:

```bash
export PATH=$PATH:/usr/local/go/bin
```

Save and exit the editor (Ctrl+O, Enter, Ctrl+X).

Reload your shell profile:

```bash
source ~/.bashrc
```

### 5. Verify Installation

Check that Go is properly installed:

```bash
go version
```

You should see output similar to:

```
go version go1.23.6 linux/amd64
```

### 6. Clean Up

Remove the downloaded tarball to free disk space:

```bash
rm go1.23.6.linux-amd64.tar.gz
```

## Alternative Installation Methods

### Using Package Manager

For Ubuntu/Debian:

```bash
sudo apt update
sudo apt install golang-go
```

For CentOS/RHEL/Fedora:

```bash
sudo dnf install golang
```

### Using Go Version Manager (gvm)

Install gvm and then install Go 1.23.6:

```bash
bash < <(curl -s -S -L https://raw.githubusercontent.com/moovweb/gvm/master/binscripts/gvm-installer)
source ~/.gvm/scripts/gvm
gvm install go1.23.6
gvm use go1.23.6 --default
```

## Troubleshooting

### Go Command Not Found

If `go version` returns "command not found":

1. Verify the PATH is set correctly:
   ```bash
   echo $PATH
   ```

2. Check if Go is in the expected location:
   ```bash
   ls -la /usr/local/go/bin/go
   ```

3. Restart your terminal or run:
   ```bash
   source ~/.bashrc
   ```

### Permission Denied

If you encounter permission errors:

1. Ensure you have sudo privileges
2. Check file permissions:
   ```bash
   ls -la /usr/local/go/bin/go
   ```

## Next Steps

After installation, you can:

- Set up your Go workspace: `mkdir ~/go`
- Configure GOPATH and GOPROXY if needed
- Install Go tools: `go install golang.org/x/tools/gopls@latest`
- Start your first Go project: `go mod init myproject`