#!/bin/bash

# PM2 重启脚本 - 管理台

set -e

# 颜色输出
YELLOW='\033[1;33m'
GREEN='\033[0;32m'
NC='\033[0m' # No Color

echo -e "${YELLOW}重启 RoundMatch 管理台...${NC}"

MODE=${1:-dev}

if [ "$MODE" = "prod" ]; then
    CONFIG_FILE="ecosystem.prod.config.cjs"
else
    CONFIG_FILE="ecosystem.config.cjs"
fi

pm2 restart roundmatch-admin 2>/dev/null || {
    echo -e "${GREEN}管理台未运行，尝试启动...${NC}"
    cd "$(dirname "$0")/../admin"
    pm2 start "$CONFIG_FILE"
}

echo -e "${GREEN}重启完成${NC}"
pm2 show roundmatch-admin
