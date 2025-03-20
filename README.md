<!-- Project Title -->
# <img src="./public/favicon.png" width="30" height="30" alt="DCM Logo"> DCM - Docker Compose Maker

<p align="center">
<img src="https://img.shields.io/github/stars/ajnart/docker-compose-selector?label=%E2%AD%90%20Stars&style=flat-square?branch=master&kill_cache=1%22">
<a href="https://docker-compose-selector.vercel.app">
  <img alt="Live Demo" src="https://img.shields.io/badge/🌐_Live_Demo-Visit_Site-blue">
</a>
<a href="https://github.com/ajnart/docker-compose-selector/actions">
  <img title="CI Status" src="https://github.com/ajnart/docker-compose-selector/actions/workflows/docker.yml/badge.svg" alt="CI Status">
</a>
</p>

<!-- Links -->
<p align="center">
  <a href="https://docker-compose-selector.vercel.app">
    <strong>Live Demo 🚀</strong>
  </a>
  •
  <a href="#-quick-start">
    <strong>Install 💻</strong>
  </a>
  •
  <a href="https://github.com/ajnart/docker-compose-selector">
    <strong>GitHub 📂</strong>
  </a>
  •
  <a href="#-features">
    <strong>Features ✨</strong>
  </a>
</p>

## 📋 About

DCM (Docker Compose Maker) is a simple yet powerful tool that helps you create `docker-compose.yaml` files for your self-hosted applications. Select from a curated list of popular containers and generate a ready-to-use configuration file with just a few clicks.

No more copy-pasting from documentation or trying to remember the correct configuration options - this tool makes it easy to set up your Docker environment.

## ✨ Features

- 🧩 **Simple selection interface** - Pick the tools you want to include with a simple click
- 🔍 **Search functionality** - Find containers quickly with powerful search (Cmd/Ctrl+K)
- 📊 **GitHub stars** - See popularity metrics for each container
- 📱 **Responsive design** - Works on desktop, tablet and mobile devices
- 🌙 **Dark mode support** - Easy on the eyes with automatic theme detection
- ⚙️ **Configuration variables** - Set common environment variables for all containers
- 📋 **Copy to clipboard** - One-click to copy your generated docker-compose.yaml
- 🔒 **Privacy focused** - No tracking in self-hosted version
- 🚀 **Fast and lightweight** - Built with Next.js for optimal performance

## 🚀 Quick Start

### 🌐 Use the Online Version

Visit [docker-compose-selector.vercel.app](https://docker-compose-selector.vercel.app) to use the tool immediately without installation.

> **Note**: The online version includes analytics for usage tracking, while the self-hosted version does not.

### 🐳 Run with Docker

Run with a single command:

```bash
docker run -p 3000:3000 ghcr.io/ajnart/dcm
```

Then visit `http://localhost:3000` in your browser.

### 📦 Using Docker Compose

Create a `docker-compose.yaml` file:

```yaml
version: '3'
services:
  dcm:
    image: ghcr.io/ajnart/dcm
    container_name: dcm
    ports:
      - "3000:3000"
    restart: unless-stopped
```

Then run:

```bash
docker-compose up -d
```

### 🛠️ Build from Source

1. Clone the repository:
```bash
git clone https://github.com/ajnart/docker-compose-selector.git
cd docker-compose-selector
```

2. Install dependencies:
```bash
npm install
# or
yarn install
# or
pnpm install
```

3. Build and start:
```bash
npm run build
npm start
# or
yarn build
yarn start
```

## 🧰 Supported Tools

DCM includes configuration for many popular self-hosted applications, including:

- 📺 **Media Management**: [Sonarr](https://github.com/Sonarr/Sonarr), [Radarr](https://github.com/Radarr/Radarr), [Lidarr](https://github.com/lidarr/Lidarr), [Readarr](https://github.com/Readarr/Readarr), [Prowlarr](https://github.com/Prowlarr/Prowlarr), [Jellyfin](https://github.com/jellyfin/jellyfin), [Plex](https://github.com/plexinc/pms-docker), [Emby](https://github.com/MediaBrowser/Emby)
- 🔍 **Dashboards**: [Homarr](https://github.com/homarr-labs/homarr), [Heimdall](https://github.com/linuxserver/Heimdall), [Portainer](https://github.com/portainer/portainer)
- 🌐 **Networking**: [Traefik](https://github.com/traefik/traefik), [Nginx](https://github.com/nginx/nginx), [Pi-hole](https://github.com/pi-hole/pi-hole), [AdGuard Home](https://github.com/AdguardTeam/AdGuardHome)
- 💾 **Storage**: [Nextcloud](https://github.com/nextcloud/server)
- 🗄️ **Databases**: [MariaDB](https://github.com/MariaDB/server), [MySQL](https://github.com/mysql/mysql-server), [PostgreSQL](https://github.com/postgres/postgres), [MongoDB](https://github.com/mongodb/mongo), [Redis](https://github.com/redis/redis), [Elasticsearch](https://github.com/elastic/elasticsearch)
- 📊 **Monitoring**: [Grafana](https://github.com/grafana/grafana), [Prometheus](https://github.com/prometheus/prometheus)
- 🏠 **Home Automation**: [Home Assistant](https://github.com/home-assistant/core)
- 🔐 **Security**: [Vaultwarden](https://github.com/dani-garcia/vaultwarden)
- 💻 **Development**: [Gitea](https://github.com/go-gitea/gitea), [Code Server](https://github.com/coder/code-server)
- 🔄 **Maintenance**: [Watchtower](https://github.com/containrrr/watchtower)

Each tool includes a detailed description, GitHub star count, and pre-configured docker-compose settings.

## 🖼️ Screenshots

![Desktop view of the application](https://i.imgur.com/example1.png)
![Generated docker-compose file](https://i.imgur.com/example2.png)

## 🤝 Contributing

Contributions are welcome! If you'd like to add a new container to the list or improve the existing configurations:

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-container`)
3. Commit your changes (`git commit -m 'Add some amazing container'`)
4. Push to the branch (`git push origin feature/amazing-container`)
5. Open a Pull Request

## 📜 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 💖 Support

If you find this tool useful, consider supporting the project by:

- ⭐ Starring the repository on GitHub
- 🐦 Sharing it on social media
- ☕ [Buying me a coffee](https://ko-fi.com/ajnart)

## 📞 Contact

- GitHub: [@ajnart](https://github.com/ajnart)

---

Made with ❤️ by [ajnart](https://github.com/ajnart) 