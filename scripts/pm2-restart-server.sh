#!/bin/bash

# PM2 重启脚本 - 服务端

set -e

# 颜色输出
YELLOW='\033[1;33m'
GREEN='\033[0;32m'
NC='\033[0m' # No Color

echo -e "${YELLOW}重启 RoundMatch 服务端...${NC}"

pm2 restart roundmatch-server 2>/dev/null || {
    echo -e "${GREEN}服务端未运行，尝试启动...${NC}"
    cd "$(dirname "$0")/../server"
    pm2 start ecosystem.config.js
}

echo -e "${GREEN}重启完成${NC}"
pm2 show roundmatch-server
