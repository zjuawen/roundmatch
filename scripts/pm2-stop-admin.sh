#!/bin/bash

# PM2 停止脚本 - 管理台

set -e

# 颜色输出
YELLOW='\033[1;33m'
GREEN='\033[0;32m'
NC='\033[0m' # No Color

echo -e "${YELLOW}停止 RoundMatch 管理台...${NC}"

pm2 stop roundmatch-admin 2>/dev/null || {
    echo -e "${GREEN}管理台未运行${NC}"
    exit 0
}

echo -e "${GREEN}管理台已停止${NC}"
